# 任務清單 — 在 Cloudflare Workers 上建立儲存 DSE.csv 與對話資料的資料庫

本文件列出逐步作法（含命令與範例程式片段），讓你可以使用 Cloudflare Workers 搭配 D1（關聯資料庫）、R2（物件存儲）與 Workers KV / Durable Objects（視情境）來儲存與提供 DSE.csv 與對話資料。

設計建議（簡短）
- 對於原始檔案（例如完整的 `DSE.csv`）建議放到 R2（物件存儲），便於上傳/下載與版本控制。
- 若要對 CSV 做查詢、統計或儲存結構化紀錄，建議把解析後的資料寫入 D1（SQL）。
- 對話（聊天紀錄）可放在 D1（如果需要 SQL 查詢）或放到 Workers KV / Durable Objects（低延遲、簡單 key-value 存取）。

前置條件
- 已有 Cloudflare 帳號與權限（可建立 Worker、D1、R2）。
- 已安裝 node/npm 與 Cloudflare 的 CLI（wrangler / 官方 create 指令）。

快速安裝（如果尚未安裝）
```bash
# 建議使用官方的新專案建立工具
npm create cloudflare@latest
# 或傳統安裝 wrangler（若需要全域）
npm install -g wrangler
# 登入 Cloudflare
wrangler login
```

任務步驟（分成準備、資源建立、開發、測試與部署）

1) 建立專案骨架
- 在專案目錄（例如 /workspaces/jhm5-db）建立 Worker 專案：
```bash
# 若使用 create cloudflare
npm create cloudflare@latest -- --name jhm5-db
# 或用 wrangler 快速建立
wrangler init jhm5-db
```
- 會產生 `wrangler.toml`、`src/` 或 `workers/` 程式碼位置。

2) 建立 D1（關聯資料庫）
- 可在 Cloudflare Dashboard 建立 D1 資料庫，或使用 wrangler CLI：
```bash
wrangler d1 create jhm5_db
```
- 建立資料表（migration）：
  - 建議建立兩個 table：`dse_trends`、`dialogues`
  - sample SQL migration:
```sql
-- migrations/001_create_tables.sql
CREATE TABLE IF NOT EXISTS dse_trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  value INTEGER NOT NULL,
  source TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dialogues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  role TEXT,
  message TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- 使用 wrangler 或 dashboard 執行 migration（或在 worker 啟動時檢查並建立）。

3) 建立 R2 bucket（存放原始 CSV 等檔案）
- 在 Dashboard 建立 R2，也可以用 wrangler：
```bash
wrangler r2 bucket create jhm5-csv-bucket
```
- 在 `wrangler.toml` 加上 R2 binding：
```toml
[[r2_buckets]]
binding = "JHM5_R2"
bucket_name = "jhm5-csv-bucket"
preview_bucket_name = "jhm5-csv-bucket"
```

4) 設定 wrangler.toml 的 D1 與其他 binding
- 範例片段：
```toml
name = "jhm5-db"
main = "./src/index.js"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "JHM5_D1"
database_name = "jhm5_db"
```
- 若使用 KV / Durable Objects，同樣在 `wrangler.toml` 中加上 bindings。

5) 撰寫 Worker API（範例端點）
- 功能建議：
  - POST /upload-csv -> 接收 CSV 上傳，把檔案存 R2，並觸發解析寫入 D1（或回傳 job id）
  - GET /csv/:name -> 從 R2 下載原始 CSV
  - POST /dialogue -> 儲存一條對話紀錄到 D1
  - GET /dialogue?session_id=... -> 取得會話歷史

- 範例（Node-like / Workers JS）:
```js
export async function onRequestPostUpload({ request, env }) {
  const form = await request.formData();
  const file = form.get('file'); // File object
  const key = `dse/${Date.now()}-${file.name}`;
  // 儲存到 R2
  await env.JHM5_R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  // 可回傳 key 或觸發解析作業
  return new Response(JSON.stringify({ key }), { status: 200 });
}

// 將解析後的紀錄寫入 D1（示意）
async function writeRowsToD1(env, rows) {
  // rows = [{date: '2020-04-12', value: 33}, ...]
  const db = env.JHM5_D1;
  const tx = await db.prepare('BEGIN').run();
  try {
    for (const r of rows) {
      await db.prepare('INSERT INTO dse_trends (date, value, source) VALUES (?, ?, ?)')
              .bind(r.date, r.value, 'r2-upload')
              .run();
    }
    await db.prepare('COMMIT').run();
  } catch (e) {
    await db.prepare('ROLLBACK').run();
    throw e;
  }
}
```

6) CSV 解析策略
- 可在 Worker 中解析（小檔案）或由後端任務/Queue 處理（若檔案很大）
- 建議：
  - 先把原始 CSV 放到 R2
  - Worker 建立一個 job row（或直接同步）解析 R2 的內容，分批寫入 D1
- CSV 解析示例（簡單）：
```js
function parseCsv(text) {
  return text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).slice(2).map(line=>{
    const [date,val] = line.split(','); return {date, value: Number(val)};
  });
}
```

7) 驗證與本地開發
- 使用 `wrangler dev` 於本機測試：
```bash
wrangler dev --local src/index.js
```
- 範例 curl 測試：
```bash
# 上傳 csv
curl -X POST -F "file=@DSE.csv" http://127.0.0.1:8787/upload-csv

# 儲存對話
curl -X POST -H "Content-Type: application/json" \
  -d '{"session_id":"s1","role":"user","message":"hello"}' \
  http://127.0.0.1:8787/dialogue
```

8) 部署
- 使用 `wrangler publish` 部署到 Cloudflare：
```bash
wrangler publish
```
- 建議先在 staging zone / preview 測試，再到 production。

9) 權限、API Token 與安全性
- 建議建立有限權限的 API token（只允許管理 Worker / D1 / R2 所需的 scope）並儲存在 CI 的 secrets 或 `wrangler secret put`。
- 如果公開 API，請加上驗證（JWT、API key、Cloudflare Access 或其他方式）。

10) 監控、維護與備份
- R2 裡的原始 CSV 可定期備份（下載或透過 replication 流程）。
- D1 的重要資料可定期匯出備份。
- 加入基本的 logging（Workers 上的 console / 轉送到 log sink）。

可選進階項目（後續可實作）
- 增加時間序列查詢 API（aggregate、rolling average 等）。
- 使用 Durable Objects 實作即時會話或鎖定機制。
- 加上 Cloudflare Queues（若解析需背景作業）。
- 在 Worker 中加入 pagination 與 index（SQL 上的索引）。

---

建議下一步（擇一）
- 如果你想我直接幫你：我可以產生一個最小可跑的 Worker 範例（`src/index.js`）和更新 `wrangler.toml` 的範本，並加入 D1 migration SQL 檔與一個上傳 endpoint 的實作。
- 或者你先嘗試上述步驟並告訴我哪一步卡住（我會逐項協助）。

