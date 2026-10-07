import type { AcademyConfig } from './model.ts';
export const config: AcademyConfig = {
  "id": "english-academy",
  "name": "English Academy",
  "primary": "Student",
  "tagline": "영어로 넓히는, 우리 아이의 세상.",
  "description": "학생 · 수업 · 출결 · 숙제 · 레벨 테스트",
  "eyebrow": "LEARN TODAY, GROW TOMORROW",
  "accent": "#245cc5",
  "tint": "#eef3fd",
  "entities": {
    "Student": {
      "label": "학생 관리",
      "description": "학생과 보호자의 연락처를 관리해요.",
      "icon": "♙",
      "layout": "table",
      "fields": [
        {
          "name": "name",
          "label": "이름",
          "type": "text",
          "required": true
        },
        {
          "name": "phone",
          "label": "전화번호",
          "type": "text",
          "required": false
        },
        {
          "name": "guardianName",
          "label": "보호자 이름",
          "type": "text",
          "required": false
        },
        {
          "name": "guardianPhone",
          "label": "보호자 전화번호",
          "type": "text",
          "required": false
        }
      ]
    },
    "Class": {
      "label": "수업 관리",
      "description": "수업과 담당 선생님을 기록해요.",
      "icon": "▤",
      "layout": "cards",
      "fields": [
        {
          "name": "name",
          "label": "수업명",
          "type": "text",
          "required": true
        },
        {
          "name": "teacher",
          "label": "담당 선생님",
          "type": "text",
          "required": false
        }
      ]
    },
    "Attendance": {
      "label": "출결 관리",
      "description": "학생별 출석과 결석을 기록해요.",
      "icon": "✓",
      "layout": "table",
      "fields": [
        {
          "name": "studentId",
          "label": "학생",
          "type": "text",
          "required": true,
          "relation": "Student"
        },
        {
          "name": "date",
          "label": "날짜",
          "type": "date"
        },
        {
          "name": "status",
          "label": "출결",
          "type": "select",
          "required": true,
          "options": [
            {
              "value": "present",
              "label": "출석"
            },
            {
              "value": "absent",
              "label": "결석"
            },
            {
              "value": "late",
              "label": "지각"
            }
          ]
        }
      ]
    },
    "Consultation": {
      "label": "상담 기록",
      "description": "학생의 성장과 보호자 상담을 기록해요.",
      "icon": "↔",
      "layout": "cards",
      "fields": [
        {
          "name": "studentId",
          "label": "학생",
          "type": "text",
          "required": true,
          "relation": "Student"
        },
        {
          "name": "date",
          "label": "날짜",
          "type": "date"
        },
        {
          "name": "memo",
          "label": "상담 내용",
          "type": "textarea"
        }
      ]
    },
    "Homework": {
      "label": "숙제 관리",
      "description": "수업별 과제와 제출 기한을 정해요.",
      "icon": "▤",
      "layout": "cards",
      "fields": [
        {
          "name": "classId",
          "label": "수업",
          "type": "text",
          "required": true,
          "relation": "Class"
        },
        {
          "name": "title",
          "label": "과제",
          "type": "text",
          "required": true
        },
        {
          "name": "dueDate",
          "label": "마감일",
          "type": "date"
        }
      ]
    },
    "LevelTest": {
      "label": "레벨 테스트",
      "description": "학생별 테스트 결과를 기록해요.",
      "icon": "◈",
      "layout": "table",
      "fields": [
        {
          "name": "studentId",
          "label": "학생",
          "type": "text",
          "required": true,
          "relation": "Student"
        },
        {
          "name": "date",
          "label": "날짜",
          "type": "date"
        },
        {
          "name": "result",
          "label": "레벨",
          "type": "select",
          "required": true,
          "options": [
            {
              "value": "A",
              "label": "A"
            },
            {
              "value": "B",
              "label": "B"
            },
            {
              "value": "C",
              "label": "C"
            },
            {
              "value": "D",
              "label": "D"
            },
            {
              "value": "E",
              "label": "E"
            },
            {
              "value": "F",
              "label": "F"
            }
          ]
        }
      ]
    }
  },
  "metrics": [
    {
      "entity": "Student",
      "label": "학생 관리"
    },
    {
      "entity": "Class",
      "label": "수업 관리"
    },
    {
      "entity": "Attendance",
      "label": "출결 관리"
    },
    {
      "entity": "Consultation",
      "label": "상담 기록"
    }
  ],
  "timestamps": true
};
