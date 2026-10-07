# Academy template

Academy Studio에서 배포할 수 있는 독립 학원 앱 템플릿입니다.

## 코드 받아서 수정하기
1. GitHub의 **Use this template → Create a new repository**로 본인 계정에 공개 저장소를 만드세요.
2. 저장소를 clone하고 Node.js 22.19 이상에서 `npm ci`, `npm run dev`를 실행하세요. 로컬 주소는 http://127.0.0.1:3100 입니다.
3. Codex, Claude Code, OpenCode 등 원하는 코딩 도구로 수정하세요. AI는 먼저 AGENTS.md를 읽어야 합니다.
4. `npm run lint && npm run typecheck && npm test && npm run build`를 실행한 뒤 GitHub에 push하세요.
5. Academy Studio에서 템플릿 종류, 저장소 주소, 학원 이름, 앱 비밀번호를 입력하고 배포하세요.

## 자동 배포
제출 시 기본 브랜치의 커밋을 고정해 가져오고, 독립 Neon DB와 Vercel 앱을 만듭니다. 완료되면 사이트 주소가 표시됩니다. 앱 로그인 아이디는 `admin`, 비밀번호는 제출할 때 지정한 값입니다. 계정 로그인 비밀번호와 별개입니다.

수정 후 GitHub에 push하고 같은 저장소를 다시 제출하면 기존 DB를 유지하며 재배포합니다. push만으로 자동 배포되지는 않습니다. 배포 실패 시 기존 DB는 유지됩니다.

루트의 academy-template.json, package.json, src/server.ts, src/access.ts와 prisma/migrations 구조를 유지하세요. 비밀번호 보호 코드는 제거하지 마세요. DB 변경은 기존 마이그레이션 수정 대신 새 migration.sql을 추가하세요. 데이터 삭제와 컬럼 삭제는 하지 마세요.

공개 저장소에는 코드만 올리세요. 실제 학생 정보, SQLite 파일, .env, 비밀번호와 API 키는 포함하지 마세요. 로컬 개발에는 별도 샘플 SQLite를 사용합니다. DATABASE_URL은 플랫폼이 해당 앱 전용 DB로 설정합니다. PostgreSQL 마이그레이션은 배포 전에 플랫폼이 실행합니다.

첫 버전은 루트에 앱이 있는 공개 저장소, 텍스트 소스 파일 500개/5MB 이하를 지원합니다. 이미지가 필요하면 SVG 또는 외부 URL을 사용하세요. 앱 설정은 src/config.json에 있습니다.
