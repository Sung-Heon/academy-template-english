import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { migrateLocal } from './migrations.ts';

export async function openDatabase() {
    const uri = process.env.DATABASE_URL;
    if (uri?.startsWith('postgresql://') || uri?.startsWith('postgres://')) {
        const { neon } = process.env.NEON_DRIVER_PATH ? await import(process.env.NEON_DRIVER_PATH) : await import('@neondatabase/serverless');
        const sql = neon(uri);
        return {
            query: async (text: string, values: SQLInputValue[] = []): Promise<Record<string, unknown>[]> => {
                try { return await sql.query(text, values); }
                catch { throw Error('Database request failed'); }
            },
            close: () => {},
        };
    }
    const db = new DatabaseSync(process.env.DATABASE_FILE || 'academy.sqlite');
    db.exec('PRAGMA foreign_keys=ON');
    migrateLocal(db, process.cwd());
    return {
        query: async (text: string, values: SQLInputValue[] = []): Promise<Record<string, unknown>[]> => db.prepare(text.replace(/\$\d+/g, '?')).all(...values),
        close: () => db.close(),
    };
}
