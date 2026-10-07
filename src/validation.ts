export interface Field {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
}
export interface AppConfig {
    name: string;
    features: string[];
    studentFields: Field[];
    levelOptions: string[];
    attendanceFilter: boolean;
    consultationDate: boolean;
}
export const entityFields: Record<string, string[]> = { Class: ['name', 'teacher'], Attendance: ['studentId', 'date', 'status'], Consultation: ['studentId', 'date', 'memo'], Homework: ['classId', 'title', 'dueDate'], LevelTest: ['studentId', 'date', 'result'] };
export function validate(entity: string, input: Record<string, unknown>, config: AppConfig): Record<string, string | number | null> {
    const fields: Field[] = entity === 'Student' ? config.studentFields : (entityFields[entity] ?? []).map(name => ({ name, label: name, type: 'text', required: ['studentId', 'classId', 'name', 'title'].includes(name) }));
    const output: Record<string, string | number | null> = {};
    for (const key of Object.keys(input))
        if (!fields.some(f => f.name === key))
            throw Error('Unknown field');
    for (const field of fields) {
        const value = input[field.name];
        if (field.required && (typeof value !== 'string' || !value.trim()))
            throw Error(field.label + '을 입력하세요');
        if (value === undefined || value === null || value === '') {
            output[field.name] = null;
            continue;
        }
        if (field.type === 'number') {
            const number = Number(value);
            if (!Number.isInteger(number) || number < 1 || number > 12)
                throw Error('학년은 1~12 사이입니다');
            output[field.name] = number;
        }
        else {
            if (typeof value !== 'string' || value.length > 4000)
                throw Error('Invalid field');
            if (field.type === 'select' && !field.options?.includes(value))
                throw Error('허용되지 않은 선택입니다');
            output[field.name] = value.trim();
        }
    }
    if (entity === 'LevelTest' && !config.levelOptions.includes(String(output.result)))
        throw Error('Invalid level');
    if (entity === 'Attendance' && !['present', 'absent', 'late'].includes(String(output.status)))
        throw Error('Invalid attendance');
    return output;
}
