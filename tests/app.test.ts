import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../src/validation.ts';
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('src/config.json', 'utf8'));
test('requires a student name and accepts valid registration', () => {
    assert.throws(() => validate('Student', {}, config), /이름/);
    assert.equal(validate('Student', { name: '테스트 학생' }, config).name, '테스트 학생');
});
test('rejects unknown fields and invalid grade', () => {
    assert.throws(() => validate('Student', { name: '학생', admin: true }, config), /field/);
    if (config.studentFields.some((f: {
        name: string;
    }) => f.name === 'grade'))
        assert.throws(() => validate('Student', { name: '학생', grade: 'oops' }, config), /학년/);
});
test('domain records require their student or class relationship', () => {
    assert.throws(() => validate('Consultation', { memo: '상담' }, config), /studentId/);
    if (config.features.includes('Homework'))
        assert.throws(() => validate('Homework', { title: '단어 숙제' }, config), /classId/);
});
