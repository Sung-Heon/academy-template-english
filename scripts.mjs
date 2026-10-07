import { readFileSync } from 'node:fs';
const c=JSON.parse(readFileSync('src/config.json','utf8'));
if (!c.studentFields.some(f=>f.name==='name' && f.required)) throw Error('Student name must be required');
for (const f of c.studentFields) if(!/^[a-zA-Z]+$/.test(f.name)) throw Error('Invalid field');
console.log('Template configuration lint passed');
