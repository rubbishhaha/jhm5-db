/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
 * - Run `npm run deploy` to publish your Worker
 *
 * Bind resources to your Worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

type Env = {
	ASSETS: any;
	dse_trend: any; // D1 binding
};

function json(body: unknown, status = 200){ return new Response(JSON.stringify(body), { status, headers: { 'Content-Type':'application/json' } }); }

async function runDDL(db: any, sql: string){ try{ return await db.prepare(sql).run(); }catch(e){ console.warn('DDL error', e); return null; } }

async function runAll(db: any, sql: string){ try{ return await db.prepare(sql).all(); }catch(e){ console.warn('SQL all error', e); return null; } }

export default {
	async fetch(request: Request, env: Env, ctx: any){
		const url = new URL(request.url);
		const pathname = url.pathname || '/';

		// API routes
		if(pathname === '/api/ping'){
			return new Response('pong');
		}

		if(pathname === '/api/sql' && request.method.toUpperCase() === 'POST'){
			try{
				const body: any = await request.json().catch(()=> ({}));
				const query = String(body.query || '').trim();
				if(!query || !/^\s*select/i.test(query)) return json({ error: 'only SELECT queries allowed' }, 400);
				const res = await runAll(env.dse_trend, query);
				// D1 returns { results: [...] } for .all()
				const rows = res && res.results ? res.results : (Array.isArray(res) ? res : []);
				return json({ rows });
			}catch(err){ console.error(err); return json({ error: String(err) }, 500); }
		}

		if(pathname === '/api/dialogue'){
			if(request.method.toUpperCase() === 'GET'){
				try{
					const r = await runAll(env.dse_trend, 'SELECT * FROM dialogues ORDER BY id DESC');
					const rows = r && r.results ? r.results : (Array.isArray(r) ? r : []);
					return json({ rows });
				}catch(e){ console.warn(e); return json({ rows: [] }); }
			}

			if(request.method.toUpperCase() === 'POST'){
				try{
					const body: any = await request.json().catch(()=> ({}));
					const session_id = body.session_id || null;
					const role = body.role || 'system';
					const message = body.message || '';
					const metadata = body.metadata ? JSON.stringify(body.metadata) : null;
					const stmt = env.dse_trend.prepare('INSERT INTO dialogues (session_id, role, message, metadata, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)');
					await stmt.run(session_id, role, message, metadata);
					return json({ ok: true });
				}catch(err){ console.error('insert dialogue', err); return json({ ok:false, error: String(err) }, 500); }
			}
		}

		// Admin helpers
		if(pathname === '/api/admin/cleanup' && request.method.toUpperCase() === 'POST'){
			try{
				// remove duplicate dse_trend dates, keep lowest id
				await runDDL(env.dse_trend, `DELETE FROM dse_trends WHERE id NOT IN (SELECT MIN(id) FROM dse_trends GROUP BY date)`);
				// create unique index on date
				try{ await runDDL(env.dse_trend, `CREATE UNIQUE INDEX IF NOT EXISTS idx_dse_trends_date ON dse_trends(date)`); }catch(e){}
				return json({ ok:true });
			}catch(err){ console.warn(err); return json({ ok:false, error: String(err) }, 500); }
		}

		if(pathname === '/api/admin/delete-test-message' && request.method.toUpperCase() === 'POST'){
			try{
				await runDDL(env.dse_trend, `DELETE FROM dialogues WHERE message LIKE '%Hello from automated test%'`);
				return json({ ok:true });
			}catch(err){ console.warn(err); return json({ ok:false, error: String(err) }, 500); }
		}

		// If not API, try serving static asset via Assets binding (if present)
		try{
			if(env && (env as any).ASSETS){
				return await (env as any).ASSETS.fetch(request);
			}
		}catch(e){ console.warn('asset fetch error', e); }

		return new Response('Not found', { status: 404 });
	},

	// scheduled handler (kept minimal)
	async scheduled(event: any, env: Env, ctx: any){
		console.log('scheduled trigger', event && event.cron ? event.cron : 'scheduled');
		// example: ensure dialogues table exists (non-destructive)
		try{
			await runDDL(env.dse_trend, `CREATE TABLE IF NOT EXISTS dialogues (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, role TEXT, message TEXT, metadata TEXT, created_at TEXT)`);
		}catch(e){ console.warn('ensure dialogues failed', e); }
	}
} satisfies ExportedHandler<Env>;
