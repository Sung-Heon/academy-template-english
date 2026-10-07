CREATE TABLE "Student" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "phone" TEXT, "guardianName" TEXT, "guardianPhone" TEXT);
CREATE TABLE "Class" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "teacher" TEXT);
CREATE TABLE "Attendance" ("id" TEXT PRIMARY KEY, "studentId" TEXT, "date" TEXT, "status" TEXT);
CREATE TABLE "Consultation" ("id" TEXT PRIMARY KEY, "studentId" TEXT, "date" TEXT, "memo" TEXT);
CREATE TABLE "Homework" ("id" TEXT PRIMARY KEY, "classId" TEXT, "title" TEXT, "dueDate" TEXT);
CREATE TABLE "LevelTest" ("id" TEXT PRIMARY KEY, "studentId" TEXT, "date" TEXT, "result" TEXT);
