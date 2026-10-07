const labels = { Student: '학생 관리', Class: '수업', Attendance: '출결', Consultation: '상담', Homework: '숙제', LevelTest: '레벨 테스트' };
const fieldLabels = { name: '이름', phone: '전화번호', guardianName: '보호자 이름', guardianPhone: '보호자 전화번호', teacher: '강사', studentId: '학생', classId: '수업', date: '날짜', status: '출결', memo: '상담 메모', title: '제목', dueDate: '마감일', result: '결과' };
const fields = { Class: ['name', 'teacher'], Attendance: ['studentId', 'date', 'status'], Consultation: ['studentId', 'date', 'memo'], Homework: ['classId', 'title', 'dueDate'], LevelTest: ['studentId', 'date', 'result'] };
const config = await fetch('api/config').then(r => r.json());
let current = 'Student', absentOnly = false, renderVersion = 0;
const lists = new Map();
function loadList(entity) {
    if (lists.has(entity)) return lists.get(entity);
    const request = fetch('api/' + entity).then(async response => {
        const data = await response.json();
        if (!response.ok) throw Error(data.error || '목록을 불러오지 못했어요');
        return data;
    });
    lists.set(entity, request);
    const clear = () => { if (lists.get(entity) === request) lists.delete(entity); };
    request.then(() => { if (!config.readOnly) clear(); }, clear);
    return request;
}
const $ = id => document.getElementById(id);
function el(tag, text) { const e = document.createElement(tag); if (text !== undefined)
    e.textContent = text; return e; }
$('academy-name').textContent = config.name;
if (config.readOnly) document.querySelector('.badge').textContent = '예시 앱 · 샘플 데이터 · 읽기 전용';
for (const feature of config.features) {
    const b = el('button', labels[feature]);
    b.onclick = () => { current = feature; render(); };
    b.dataset.feature = feature;
    $('nav').append(b);
}
async function render() {
    const version = ++renderVersion, feature = current;
    $('error').textContent = '불러오는 중…';
    try {
        const definitions = feature === 'Student' ? config.studentFields : fields[feature].map(name => ({ name, label: fieldLabels[name], required: ['studentId', 'classId', 'name', 'title'].includes(name), type: name.toLowerCase().includes('date') || name === 'date' ? 'date' : 'text' }));
        const [rows, students, classes] = await Promise.all([
            loadList(feature),
            definitions.some(f => f.name === 'studentId') ? loadList('Student') : [],
            definitions.some(f => f.name === 'classId') ? loadList('Class') : [],
        ]);
        if (version !== renderVersion) return;
        document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.feature === feature));
        $('title').textContent = labels[feature];
        $('form-title').textContent = feature === 'Student' ? '새 학생 등록' : labels[feature] + ' 등록';
        $('form').replaceChildren();
        $('filter').replaceChildren();
        $('error').textContent = '';
        for (const f of definitions) {
            const label = el('label', f.label);
            let options = f.options;
            if (f.name === 'result')
                options = config.levelOptions;
            if (f.name === 'status')
                options = ['present', 'absent', 'late'];
            if (f.name === 'studentId')
                options = students.map(s => ({ value: s.id, label: s.name }));
            if (f.name === 'classId')
                options = classes.map(s => ({ value: s.id, label: s.name }));
            const input = el(options ? 'select' : 'input');
            input.name = f.name;
            input.required = Boolean(f.required);
            if (options) {
                input.append(new Option('선택하세요', ''));
                for (const o of options)
                    input.append(new Option(typeof o === 'string' ? o : o.label, typeof o === 'string' ? o : o.value));
            }
            else {
                input.type = f.type;
                if (f.type === 'number') {
                    input.min = '1';
                    input.max = '12';
                }
            }
            label.append(input);
            $('form').append(label);
        }
        const submit = el('button', '등록');
        submit.type = 'submit';
        submit.className = 'primary';
        $('form').append(submit);
        if (config.readOnly) {
            for (const input of $('form').querySelectorAll('input, select, button')) input.disabled = true;
            submit.textContent = '예시 앱은 조회만 가능해요';
        }
        const onSubmit = async (e) => { e.preventDefault(); submit.disabled = true; try {
            const r = await fetch('api/' + feature, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData($('form')))) });
            const data = await r.json();
            if (!r.ok)
                throw Error(data.error);
            lists.clear();
            await render();
        }
        catch (error) {
            if ($('form').onsubmit === onSubmit) $('error').textContent = error.message;
        }
        finally {
            submit.disabled = false;
        } };
        $('form').onsubmit = onSubmit;
        if (feature === 'Attendance' && config.attendanceFilter) {
            const label = el('label', '결석 학생만 보기');
            const input = el('input');
            input.type = 'checkbox';
            input.checked = absentOnly;
            input.onchange = () => { absentOnly = input.checked; render(); };
            label.prepend(input);
            $('filter').append(label);
        }
        const tr = el('tr');
        for (const f of definitions)
            tr.append(el('th', f.label));
        $('head').replaceChildren(tr);
        $('rows').replaceChildren();
        for (const row of rows) {
            if (feature === 'Attendance' && absentOnly && row.status !== 'absent')
                continue;
            const tr = el('tr');
            for (const f of definitions) {
                let value = row[f.name];
                if (f.name === 'studentId')
                    value = students.find(s => s.id === value)?.name || value;
                if (f.name === 'classId')
                    value = classes.find(c => c.id === value)?.name || value;
                tr.append(el('td', value ?? '—'));
            }
            $('rows').append(tr);
        }
    } catch (error) {
        if (version === renderVersion) $('error').textContent = error.message;
    }
}
await render();
