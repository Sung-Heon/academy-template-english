import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { validate, type AppConfig } from './validation.ts';
import { openDatabase } from './database.ts';
import { authorize } from './access.ts';
const config: AppConfig = JSON.parse(readFileSync('src/config.json', 'utf8'));
const db = await openDatabase();
// Remote schemas and sample data are provisioned before deployment.
if (!process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL?.startsWith('postgres'))
    await db.query('INSERT INTO "Student" ("id","name","phone","guardianName","guardianPhone") VALUES ($1,$2,$3,$4,$5) ON CONFLICT ("id") DO NOTHING', ['sample-student', '김하늘 (샘플)', '010-0000-0000', '김보호', '010-0000-0001']);
interface AppRequest {
    id: string;
    path: string;
    method: string;
    body?: string;
    readOnly?: boolean;
}
interface AppResponse {
    id: string;
    status: number;
    type: string;
    body: string;
}
async function handle(req: AppRequest): Promise<AppResponse> {
    const json = (status: number, value: unknown): AppResponse => ({ id: req.id, status, type: 'application/json; charset=utf-8', body: JSON.stringify(value) });
    try {
        const path = new URL(req.path, 'http://localhost').pathname;
        if (path === '/health')
            return json(200, { ok: true });
        if (path === '/api/config')
            return json(200, { ...config, readOnly: Boolean(req.readOnly || process.env.READ_ONLY === '1') });
        if (path.startsWith('/api/')) {
            const entity = path.slice(5);
            if (!config.features.includes(entity))
                return json(404, { error: 'Not found' });
            if (req.method === 'GET')
                return json(200, await db.query(`SELECT * FROM "${entity}"`));
            if (req.method === 'POST') {
                if (req.readOnly || process.env.READ_ONLY === '1')
                    return json(403, { error: 'Read-only template demo' });
                if ((req.body?.length ?? 0) > 32768)
                    return json(413, { error: 'Request too large' });
                const data = validate(entity, JSON.parse(req.body || '{}'), config);
                const keys = Object.keys(data);
                const id = randomUUID();
                if (data.studentId && !(await db.query('SELECT id FROM "Student" WHERE id=$1', [data.studentId])).length)
                    throw Error('학생을 선택하세요');
                if (data.classId && !(await db.query('SELECT id FROM "Class" WHERE id=$1', [data.classId])).length)
                    throw Error('수업을 선택하세요');
                await db.query(`INSERT INTO "${entity}" (id,${keys.map(k => `"${k}"`).join(',')}) VALUES ($1,${keys.map((_, i) => '$' + (i + 2)).join(',')})`, [id, ...Object.values(data)]);
                return json(201, { id, ...data });
            }
            return json(405, { error: 'Method not allowed' });
        }
        const file = path === '/' ? 'index.html' : path.slice(1);
        if (!['index.html', 'app.js', 'style.css'].includes(file) || !existsSync(join('public', file)))
            return json(404, { error: 'Not found' });
        return { id: req.id, status: 200, type: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8', body: readFileSync(join('public', file), 'utf8') };
    }
    catch (e) {
        return json(400, { error: e instanceof Error ? e.message : 'Invalid request' });
    }
}
// The Builder uses a private IPC channel; standalone apps use HTTP.
if (process.send) {
    process.on('message', async (req: AppRequest) => process.send?.(await handle(req)));
    process.send({ ready: true });
    process.on('disconnect', () => { db.close(); process.exit(0); });
}
else {
    const server = createServer(async (req, res) => {
        const access = authorize(req.headers, req.method || 'GET');
        if (access !== 200) { res.writeHead(access, { 'WWW-Authenticate': 'Basic realm="Academy", charset="UTF-8"', 'Cache-Control': 'no-store' }); res.end(access === 503 ? 'App password not configured' : 'Authentication required'); return; }
        let body = ''; for await (const chunk of req) {
        body += chunk;
        if (body.length > 32768) {
            res.writeHead(413);
            res.end();
            return;
        }
    } const result = await handle({ id: 'http', path: req.url || '/', method: req.method || 'GET', body }); res.writeHead(result.status, { 'Content-Type': result.type, 'Cache-Control': 'no-store' }); res.end(result.body); });
    server.listen(Number(process.env.PORT || 3100), process.env.VERCEL === '1' ? '0.0.0.0' : '127.0.0.1', () => console.log('Academy listening on http://127.0.0.1:' + String((server.address() as {
        port: number;
    }).port)));
    process.on('SIGTERM', () => server.close(() => { db.close(); process.exit(0); }));
}
