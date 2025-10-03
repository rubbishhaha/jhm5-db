# 任務清單 — 在 Cloudflare Workers 上建立儲存 DSE.csv 與對話資料的資料庫

本文件列出逐步作法（含命令與範例程式片段），讓你可以使用 Cloudflare Workers 搭配 D1（關聯資料庫）、R2（物件存儲）與 Workers KV / Durable Objects（視情境）來儲存與提供 DSE.csv 與對話資料。
# 任務清單 — 前端改造：讓網站更吸睛（取代舊的 task.md）

目標：把目前的網站（public/）改成更吸引人的介面。重點有三項：

1) 修正並擴充 DSE 趨勢圖：確保圖表載入並顯示全部時間範圍（不是只顯示 2020-04-12 ~ 2020-05-24），並加入時間區間篩選（動態圖表）。
2) 新增一個卡片（box），標題 "DSE Past Paper"，點擊會導到 `public/past-papers.html`，卡片風格與現有一致並含可愛文件圖示。
3) 增加打字機式文字動畫：頁面載入時顯示逐字打字動畫，游標為灰色直線，速度每 5 個字隨機變動（20~30 字/秒），完成後游標閃爍。

要修改 / 新增的檔案
- `public/index.html` — 主頁：新增 chart 容器、篩選 UI、卡片、typing 容器與腳本
- `public/styles.css` — 共用 CSS（若不存在，可把 CSS 內嵌在 index.html）
- `public/past-papers.html` — 新增的目的頁
- （必要時）`src/index.ts` — 確認或新增可以讓前端以 POST `/api/sql` 取得完整 dse_trends 的 endpoint（現有專案已有 /api/sql 的實作，請確認回傳結構）

具體實作說明（步驟與範例程式）

A. Chart（完整資料與動態篩選）
- 目的：用 Chart.js（CDN）顯示 time series，且提供 dropdown 篩選（All / 1y / 6m / 3m / 1m）。
- 主要修改：在 `public/index.html` <head> 加入 Chart.js 與 dayjs/adaptor，body 加入 `<canvas id="dseChart"></canvas>` 與 `<select id="rangeSelect">`。

範例程式片段（請放在 index.html 底部或獨立 JS 檔）：
```js
async function fetchDseData() {
  const res = await fetch('/api/sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'SELECT date, value FROM dse_trends ORDER BY date ASC' })
  });
  const j = await res.json();
  // adapt to response shape
  return j.rows || j.results || j; 
}

function toChartData(rows) {
  return { labels: rows.map(r => r.date), data: rows.map(r => Number(r.value)) };
}

function applyRangeFilter(rows, rangeKey) {
  if (!rows || rows.length === 0) return rows;
  if (rangeKey === 'all') return rows;
  const end = new Date(rows[rows.length-1].date);
  const start = new Date(end);
  if (rangeKey === '1y') start.setFullYear(end.getFullYear()-1);
  if (rangeKey === '6m') start.setMonth(end.getMonth()-6);
  if (rangeKey === '3m') start.setMonth(end.getMonth()-3);
  if (rangeKey === '1m') start.setMonth(end.getMonth()-1);
  return rows.filter(r => new Date(r.date) >= start && new Date(r.date) <= end);
}

let chartInstance = null;
async function initChart() {
  const rows = await fetchDseData();
  const ctx = document.getElementById('dseChart').getContext('2d');
  const cdata = toChartData(rows);
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: cdata.labels, datasets: [{ label: 'DSE Trend', data: cdata.data, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.15)', tension: 0.2 }] },
    options: { scales: { x: { type: 'time', time: { parser: 'yyyy-MM-dd', unit: 'month' } } }, plugins: { legend: { display: false } } }
  });

  document.getElementById('rangeSelect').addEventListener('change', (e) => {
    const filtered = applyRangeFilter(rows, e.target.value);
    const d = toChartData(filtered);
    chartInstance.data.labels = d.labels;
    chartInstance.data.datasets[0].data = d.data;
    chartInstance.update();
  });
}

document.addEventListener('DOMContentLoaded', () => initChart().catch(console.error));
```

注意：若 Chart 時間軸解析有問題，可改成用 category x 軸 或引入 dayjs/date-fns adaptor（CDN 可載入）。

B. 新增 "DSE Past Paper" 卡片並導向新頁面
- 在 index.html 合適位置新增以下 HTML（或使用現有卡片樣式）：
```html
<a href="/past-papers.html" class="card-link">
  <div class="card">
    <div class="card-icon">📄</div>
    <div class="card-body"><h3>DSE Past Paper</h3><p>歷屆試題與資源</p></div>
  </div>
</a>
```
- 共用 CSS 範例（放 `public/styles.css`）：
```css
.card { display:flex; gap:12px; align-items:center; padding:16px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.08); background:#fff; transition:transform .14s; }
.card:hover{ transform: translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,0.12); }
.card-icon{ font-size:28px; padding:8px; background:#f3f4f6; border-radius:8px; }
```
- 新增 `public/past-papers.html`（基本骨架即可）：
```html
<!doctype html>
<html><head><meta charset="utf-8"><title>DSE Past Paper</title><link rel="stylesheet" href="/styles.css"></head>
<body>
  <h1>DSE Past Paper</h1>
  <p>此頁為佔位，後續可由 R2 列出檔案或加入下載連結。</p>
  <a href="/">回首頁</a>
</body></html>
```

C. 打字機式文字動畫（typing effect）
- HTML：在 index.html 放置一個容器，例如 `<div id="heroTyping"></div>`。
- CSS：游標樣式與閃爍動畫。
- JS：逐字插入，隨機每 5 字變化速率（20~30 字/秒），完成後游標改為閃爍。

範例 JS（放 index.html 底部）：
```js
function typingEffect(containerSelector, text) {
  const container = document.querySelector(containerSelector);
  container.textContent = '';
  const cursor = document.createElement('span'); cursor.className = 'typing-cursor'; cursor.textContent = '|'; container.appendChild(cursor);
  const chars = Array.from(text);
  let i = 0, ticks = 0, speed = randSpeed();
  function randSpeed(){ return 20 + Math.floor(Math.random()*11); }
  function nextTick(){
    if (i >= chars.length) { cursor.classList.add('blink'); return; }
    const charNode = document.createTextNode(chars[i]); container.insertBefore(charNode, cursor); i++; ticks++;
    if (ticks % 5 === 0) speed = randSpeed();
    const delay = 1000 / speed; setTimeout(nextTick, delay);
  }
  nextTick();
}

/* CSS: .typing-cursor { color:#9ca3af; margin-left:2px } .typing-cursor.blink { animation: blink 1s steps(2,start) infinite } @keyframes blink { to { visibility: hidden } } */

document.addEventListener('DOMContentLoaded', () => typingEffect('#heroTyping', '歡迎來到 DSE 趨勢分析平台，這裡會展示完整的 DSE 搜尋趨勢走勢圖與相關資源。'));
```

可選/加強項
- 把 Chart 的資料載入改為 lazy load（只在視窗中才載入）。
- Past Papers 使用 R2 + presigned URLs 顯示檔案列表。
- 打字機支援多段文字輪替（carousel）。

啟動與測試（本地）
1. 進入 cloudflarethings 專案並啟動 dev server：
```bash
cd /workspaces/jhm5-db/cloudflarethings
npm install
npm run dev   # 或使用 wrangler dev
```

2. 在瀏覽器開啟 http://127.0.0.1:8787
- 檢查 chart 是否載入完整資料：若只看到少數點，請打開 DevTools 的 Network/Console，檢查 `/api/sql` 的回傳 JSON 結構，並依回傳格式調整 `fetchDseData()`。
- 檢查 range select 是否能做 filter
- 點擊 DSE Past Paper 卡片是否可跳轉至 `/past-papers.html`
- 觀察打字動畫（speed 隨機、完成後游標閃爍）

要我現在做哪一件事？（擇一）
1) 我直接修改 repo：變更 `public/index.html`、新增 `public/past-papers.html`、新增/修改 `public/styles.css`，並在本機啟動測試；
2) 我只產生完整的 patch / code snippets（你手動套用）；
3) 我先幫你把 Chart 的 fetch 與 typing script 寫到檔案裡，但保留 UI 樣式由你調整。

回覆你要的選項，我就開始動手（我建議選 1，這樣我可以直接實作並在本地驗證）。
8) 部署

