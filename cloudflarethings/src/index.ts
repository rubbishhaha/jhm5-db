export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // If request is not under /api, let the assets binding serve static files
      if (!path.startsWith('/api')) {
        if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          return env.ASSETS.fetch(request);
        }
        return new Response('Not Found', { status: 404 });
      }

      // API routes (prefix /api)
      if (path === '/api/ping') return new Response('pong');

      // ensure tables exist (idempotent)
      await ensureTables(env);

      // POST /api/dialogue -> insert a dialogue row
      if (path === '/api/dialogue' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const session_id = body?.session_id ?? null;
        const role = body?.role ?? 'user';
        const message = body?.message ?? '';
        const metadata = body?.metadata ? JSON.stringify(body.metadata) : null;

        const res = await env.dse_trend.prepare(
          'INSERT INTO dialogues (session_id, role, message, metadata) VALUES (?, ?, ?, ?)'
        ).bind(session_id, role, message, metadata).run();

        return new Response(JSON.stringify({ ok: true, lastInsertId: res?.lastInsertRowId ?? null }), { headers: { 'content-type': 'application/json' } });
      }

      // GET /api/dialogue -> list dialogues (optionally by session_id)
      if (path === '/api/dialogue' && request.method === 'GET') {
        const session_id = url.searchParams.get('session_id');
        let rows: any[] = [];
        if (session_id) {
          const r = await env.dse_trend.prepare('SELECT * FROM dialogues WHERE session_id = ? ORDER BY created_at ASC').bind(session_id).all();
          rows = r.results;
        } else {
          const r = await env.dse_trend.prepare('SELECT * FROM dialogues ORDER BY created_at DESC LIMIT 200').all();
          rows = r.results;
        }
        return new Response(JSON.stringify({ rows }), { headers: { 'content-type': 'application/json' } });
      }

      // POST /api/dse -> insert multiple DSE rows
      if (path === '/api/dse' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const rows = Array.isArray(body?.rows) ? body.rows : [];
  const db = env.dse_trend;
        await db.prepare('BEGIN').run();
        try {
          for (const r of rows) {
            await db.prepare('INSERT INTO dse_trends (date, value, source) VALUES (?, ?, ?)')
              .bind(r.date, r.value, r.source ?? null)
              .run();
          }
          await db.prepare('COMMIT').run();
        } catch (e) {
          await db.prepare('ROLLBACK').run();
          throw e;
        }
        return new Response(JSON.stringify({ inserted: rows.length }), { headers: { 'content-type': 'application/json' } });
      }

      // POST /api/sql -> run a safe SELECT query (body { query: "SELECT ..." })
      if (path === '/api/sql' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const query = (body?.query || '').trim();
        if (!query || !/^select\b/i.test(query) || /;/.test(query)) {
          return new Response(JSON.stringify({ error: 'Only single SELECT queries without semicolons are allowed' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        const res = await env.dse_trend.prepare(query).all();
        return new Response(JSON.stringify({ rows: res.results || [] }), { headers: { 'content-type': 'application/json' } });
      }

      // default help for API
      return new Response(JSON.stringify({ ok: true, routes: ['/api/ping', 'GET/POST /api/dialogue', 'POST /api/dse (JSON rows)', 'POST /api/sql (SELECT only)'] }), { headers: { 'content-type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err?.message ?? err) }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  }
};

async function ensureTables(env: any) {
  // create tables if not exists (safe to call per-request)
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
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();
}
 