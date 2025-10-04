export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      // Serve static assets
      if (!path.startsWith('/api')) {
        if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          return env.ASSETS.fetch(request);
        }
        return new Response('Not Found', { status: 404 });
      }

      // Ensure tables exist
      await ensureTables(env);

      // /api/sql: POST, only allow SELECT
      if (path === '/api/sql' && request.method === 'POST') {
        const body = await request.json() as any;
        const sqlQuery = body && body.query;
        if (!sqlQuery || !/^select\b/i.test(sqlQuery) || /;/.test(sqlQuery)) {
          return json({ error: 'Only single SELECT queries without semicolons are allowed' }, 400);
        }
        const res = await env.dse_trend.prepare(sqlQuery).all();
        return json({ rows: res.results || [] });
      }

      // /api/dialogue: POST to insert, GET to list
      if (path === '/api/dialogue' && request.method === 'POST') {
        const body = await request.json() as any;
        const session_id = body.session_id ?? null;
        const role = body.role ?? 'user';
        const message = body.message ?? '';
        const metadata = body.metadata ? JSON.stringify(body.metadata) : null;
        const res = await env.dse_trend.prepare(
          'INSERT INTO dialogues (session_id, role, message, metadata) VALUES (?, ?, ?, ?)'
        ).bind(session_id, role, message, metadata).run();
        return json({ ok: true, lastInsertId: res?.lastInsertRowId ?? null });
      }
      if (path === '/api/dialogue' && request.method === 'GET') {
        const session_id = url.searchParams.get('session_id');
        let rows = [];
        if (session_id) {
          const res = await env.dse_trend.prepare(
            'SELECT * FROM dialogues WHERE session_id = ? ORDER BY id DESC'
          ).bind(session_id).all();
          rows = res.results || [];
        } else {
          const res = await env.dse_trend.prepare(
            'SELECT * FROM dialogues ORDER BY id DESC LIMIT 100'
          ).all();
          rows = res.results || [];
        }
        return json({ rows });
      }

      // Immediate admin route to delete the automated test message
      if (path === '/api/admin/delete-test-message' && request.method === 'POST') {
        try {
          await env.dse_trend.prepare('DELETE FROM dialogues WHERE message LIKE ?').bind('%Hello from automated test%').run();
          return json({ ok: true, deleted: true });
        } catch (e:any) {
          return json({ ok: false, error: String(e?.message ?? e) }, 500);
        }
      }

      // API help
      if (path === '/api/ping') return new Response('pong');
      return json({ ok: true, routes: ['/api/ping', 'GET/POST /api/dialogue', 'POST /api/sql (SELECT only)'] });
    } catch (err: any) {
      return json({ error: String(err?.message ?? err) }, 500);
    }
  }
};

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

async function ensureTables(env: any) {
  await env.dse_trend.prepare(`
    CREATE TABLE IF NOT EXISTS dse_trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      value INTEGER NOT NULL,
      source TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();
  await env.dse_trend.prepare(`
    CREATE TABLE IF NOT EXISTS dialogues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      role TEXT,
      message TEXT,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  // Ensure sheet tables exist (sheet1..sheet3). These mirror the SQL in migrations/001_create_sheet_tables.sql
  await env.dse_trend.prepare(`
    CREATE TABLE IF NOT EXISTS sheet1 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT,
      day_male INTEGER,
      day_female INTEGER,
      day_total INTEGER,
      all_male INTEGER,
      all_female INTEGER,
      all_total INTEGER
    );
  `).run();
  await env.dse_trend.prepare(`
    CREATE TABLE IF NOT EXISTS sheet2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT,
      day_male INTEGER,
      day_female INTEGER,
      day_total INTEGER,
      all_male INTEGER,
      all_female INTEGER,
      all_total INTEGER
    );
  `).run();
  await env.dse_trend.prepare(`
    CREATE TABLE IF NOT EXISTS sheet3 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT,
      day_male INTEGER,
      day_female INTEGER,
      day_total INTEGER,
      all_male INTEGER,
      all_female INTEGER,
      all_total INTEGER
    );
  `).run();

  // Seed sheets with content from migrations/002_add_content.sql if tables are empty.
  // Only insert for sheet1..sheet3 to avoid large payloads for sheet4/5.
  async function seedIfEmpty(table: string, inserts: string[]) {
    const countRes = await env.dse_trend.prepare(`SELECT COUNT(1) as cnt FROM ${table}`).all();
    const cnt = Array.isArray(countRes.results) && countRes.results[0] ? (countRes.results[0].cnt ?? countRes.results[0].COUNT ?? 0) : 0;
    if (!cnt) {
      for (const ins of inserts) {
        try { await env.dse_trend.prepare(ins).run(); } catch (e) { /* continue on errors */ }
      }
    }
  }

  // INSERT statements extracted from migrations/002_add_content.sql for sheet1..sheet3
  const sheet1Inserts = [
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(a) 於中國語文科、英國語文科及數學科取得 2 級或以上，以及公民與社會發展科取得「達標」 Level 2+ in Chinese Language, English Language and Mathematics, and ‘Attained’ in Citizenship and Social Development', 2, 14261, 14768, 29029, 15246, 15634);`,
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(b) 於五科甲類學科中取得 2 級或以上 Level 2+ in five Category A subjects', 2, 15827, 16090, 31917, 17018, 17079);`,
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(c) 於五科甲類學科／乙類學科#中取得2 級或以上 Level 2+ in five Category A / B subjects #', 2, 15881, 16200, 32081, 17077, 17195);`,
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(d) 於五科甲類學科中取得 2 級或以上，其中包括中國語文科及英國語文科 Level 2+ in five Category A subjects, including Chinese Language and English Language', 2, 14488, 15130, 29618, 15524, 16028);`,
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(e) 於五科甲類學科／乙類學科# 中取得2 級或以上，其中包括中國語文科及英國語文科 Level 2+ in five Category A / B subjects #, including Chinese Language and English Language', 2, 14499, 15175, 29674, 15535, 16073);`,
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(f) 於五科甲類學科中取得 2 級或以上， 其中包括中國語文科、英國語文科及數學科 Level 2+ in five Category A subjects, including Chinese Language, English Language and Mathematics', 2, 14168, 14604, 28772, 15155, 15465);`,
    `INSERT INTO sheet1 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(g) 於五科甲類學科／乙類學科# 中取得2 級或以上，其中包括中國語文科、英國語文科及數學科 Level 2+ in five Category A / B subjects #, including Chinese Language, English Language and Mathematics', 2, 14175, 14623, 28798, 15162, 15484);`
  ];

  const sheet2Inserts = [
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('五科取得5* 級或以上', 5, 5, 241, 234, 475, 245);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('五科取得5 級或以上', 5, 5, 857, 899, 1756, 877);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('五科取得4 級或以上', 4, 4, 3220, 3495, 6715, 3328);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('五科取得3 級或以上', 3, 3, 7756, 8300, 16056, 8109);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('五科取得2 級或以上', 2, 2, 15881, 16200, 32081, 17077);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('五科取得1 級或以上', 1, 1, 17939, 18112, 36051, 19464);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('四科取得1 級或以上', 1, 1, 18834, 18750, 37584, 20502);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('三科取得1 級或以上', 1, 1, 19348, 19122, 38470, 21091);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('兩科取得1 級或以上', 1, 1, 19672, 19358, 39030, 21467);`,
    `INSERT INTO sheet2 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('一科取得1 級或以上', 1, 1, 19890, 19485, 39375, 21726);`
  ];

  const sheet3Inserts = [
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(a) 於核心科目中取得「332A」或更佳成績 Core subjects at 332A or better', 332, 8364, 10012, 18376, 8781, 10481);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(b) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 2 級或以上# 成績 Core subjects at 332A or better, with one elective at level 2+#', 332, 8340, 9976, 18316, 8744, 10438);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(c) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 2 級或以上# 成績 Core subjects at 332A or better, with two electives at level 2+#', 332, 8084, 9616, 17700, 8436, 10019);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(d) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 3 級或以上# 成績 Core subjects at 332A or better, with one elective at level 3+#', 332, 8123, 9489, 17612, 8510, 9912);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(e) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 3 級或以上# 成績 Core subjects at 332A or better, with two electives at level 3+#', 332, 7356, 8336, 15692, 7666, 8672);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(f) 於核心科目中取得「333A」或更佳成績，並於一個選修科目取得 3 級或以上# 成績 Core subjects at 333A or better, with one elective at level 3+#', 333, 7636, 8511, 16147, 7996, 8894);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(g) 於核心科目中取得「333A」或更佳成績，並於兩個選修科目取得 3 級或以上# 成績 Core subjects at 333A or better, with two electives at level 3+#', 333, 7039, 7695, 14734, 7333, 8011);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(h) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 4 級或以上# 成績 Core subjects at 332A or better, with one elective at level 4+#', 332, 6810, 7497, 14307, 7119, 7821);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(i) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 4 級或以上# 成績 Core subjects at 332A or better, with two electives at level 4+#', 332, 5201, 5262, 10463, 5404, 5487);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(j) 於核心科目中取得「332A」或更佳成績，並於一個選修科目取得 5 級或以上成績 Core subjects at 332A or better, with one elective at level 5+', 332, 4020, 3616, 7636, 4207, 3772);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(k) 於核心科目中取得「332A」或更佳成績，並於兩個選修科目取得 5 級或以上成績 Core subjects at 332A or better, with two electives at level 5+', 332, 2424, 1897, 4321, 2523, 1965);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(l) 於核心科目中取得「332A」或更佳成績，數學延伸部分取得', 332, NULL, NULL, NULL, NULL, NULL);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('2 級或以上成績，並於一個選修科目取得 2 級或以上# 成績', 2, 3156, 1941, 5097, 3313, 2074);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(m) 於核心科目中取得「332A」或更佳成績，數學延伸部分取得', 332, NULL, NULL, NULL, NULL, NULL);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('3 級或以上成績，並於一個選修科目取得 2 級或以上# 成績', 3, 2890, 1689, 4579, 3034, 1798);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('(n) 於核心科目中取得「332A」或更佳成績，數學延伸部分取得', 332, NULL, NULL, NULL, NULL, NULL);`,
    `INSERT INTO sheet3 (label, day_male, day_female, day_total, all_male, all_female, all_total) VALUES ('3 級或以上成績，並於一個選修科目取得 3 級或以上# 成績', 3, 2878, 1675, 4553, 3021, 1783);`
  ];

  await seedIfEmpty('sheet1', sheet1Inserts);
  await seedIfEmpty('sheet2', sheet2Inserts);
  await seedIfEmpty('sheet3', sheet3Inserts);
}