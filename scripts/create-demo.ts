import { DatabaseSync } from 'node:sqlite';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { migrateLocal } from '../src/migrations.ts';

// Only creates a new local sample database. Never opens an existing database.
const filename = resolve(process.argv[2] || 'english-demo.sqlite');
writeFileSync(filename, '', { flag: 'wx', mode: 0o600 });
const db = new DatabaseSync(filename);
try {
    // Turso's database upload endpoint requires WAL and 4096-byte pages.
    db.exec('PRAGMA page_size=4096; PRAGMA journal_mode=WAL; PRAGMA auto_vacuum=0');
    migrateLocal(db, process.cwd());
    const samples: Record<string, { columns: string[]; rows: string[][] }> = {
        Student: { columns: ['id', 'name', 'phone', 'guardianName', 'guardianPhone'], rows: [
            ['demo-student-1', '김하늘 (예시)', '010-0000-0001', '김보호 (예시)', '010-0000-1001'],
            ['demo-student-2', '이서준 (예시)', '010-0000-0002', '이보호 (예시)', '010-0000-1002'],
            ['demo-student-3', '박지우 (예시)', '010-0000-0003', '박보호 (예시)', '010-0000-1003'],
            ['demo-student-4', '최유나 (예시)', '010-0000-0004', '최보호 (예시)', '010-0000-1004'],
            ['demo-student-5', '정도윤 (예시)', '010-0000-0005', '정보호 (예시)', '010-0000-1005'],
        ] },
        Class: { columns: ['id', 'name', 'teacher'], rows: [
            ['demo-class-1', 'Phonics 입문반', 'Alex (예시)'], ['demo-class-2', 'Reading 기초반', 'Jamie (예시)'], ['demo-class-3', 'Speaking 중급반', 'Taylor (예시)'],
        ] },
        Attendance: { columns: ['id', 'studentId', 'date', 'status'], rows: [
            ['demo-attendance-1', 'demo-student-1', '2026-10-07', 'present'], ['demo-attendance-2', 'demo-student-2', '2026-10-07', 'late'], ['demo-attendance-3', 'demo-student-3', '2026-10-07', 'absent'],
        ] },
        Consultation: { columns: ['id', 'studentId', 'date', 'memo'], rows: [
            ['demo-consultation-1', 'demo-student-1', '2026-10-06', '예시 상담: 파닉스 복습과 소리 내어 읽기 연습'], ['demo-consultation-2', 'demo-student-3', '2026-10-07', '예시 상담: 중급 회화반 수업 안내'],
        ] },
        Homework: { columns: ['id', 'classId', 'title', 'dueDate'], rows: [
            ['demo-homework-1', 'demo-class-1', '파닉스 워크북 10~12쪽', '2026-10-09'], ['demo-homework-2', 'demo-class-2', 'My Family 읽고 단어 10개 정리', '2026-10-10'], ['demo-homework-3', 'demo-class-3', '주말 계획 영어로 발표 준비', '2026-10-12'],
        ] },
        LevelTest: { columns: ['id', 'studentId', 'date', 'result'], rows: [
            ['demo-level-1', 'demo-student-1', '2026-10-01', 'A'], ['demo-level-2', 'demo-student-2', '2026-10-01', 'B'], ['demo-level-3', 'demo-student-3', '2026-10-02', 'D'],
        ] },
    };
    db.exec('BEGIN');
    for (const [table, { columns, rows }] of Object.entries(samples)) {
        const insert = db.prepare(`INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(',')}) VALUES (${columns.map(() => '?').join(',')})`);
        for (const row of rows) insert.run(...row);
    }
    db.exec('COMMIT');
    console.log(filename);
} finally { db.close(); }
