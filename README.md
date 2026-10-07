# Academy template

Academy Studio에서 배포할 수 있는 독립 학원 앱 템플릿입니다.

## 코드 받아서 수정하기
1. GitHub의 **Fork → Create fork**로 본인 계정에 공개 저장소를 만드세요.
2. 저장소를 clone하고 Node.js 22.19 이상에서 `npm ci`, `npm run dev`를 실행하세요. 로컬 주소는 http://127.0.0.1:3100 입니다.
3. Codex, Claude Code, OpenCode 등 원하는 코딩 도구로 수정하세요. AI는 먼저 AGENTS.md를 읽어야 합니다.
4. `npm run lint && npm run typecheck && npm test && npm run build`를 실행한 뒤 GitHub에 push하세요.
5. Academy Studio에서 템플릿 종류, 저장소 주소, 학원 이름, 앱 비밀번호를 입력하고 배포하세요.

## 자동 배포
제출 시 기본 브랜치의 커밋을 고정해 가져오고, 독립 Turso(libSQL) DB와 Vercel 앱을 만듭니다. 완료되면 사이트 주소가 표시됩니다. 앱 로그인 아이디는 `admin`, 비밀번호는 제출할 때 지정한 값입니다. 계정 로그인 비밀번호와 별개입니다.

수정 후 GitHub에 push하고 같은 저장소를 다시 제출하면 기존 DB를 유지하며 재배포합니다. push만으로 자동 배포되지는 않습니다. 배포 실패 시 기존 DB는 유지됩니다.

루트의 academy-template.json, package.json, src/server.ts, src/access.ts와 prisma/migrations 구조를 유지하세요. 비밀번호 보호 코드는 제거하지 마세요. DB 변경은 기존 마이그레이션 수정 대신 새 migration.sql을 추가하세요. 데이터 삭제와 컬럼 삭제는 하지 마세요.

공개 저장소에는 코드만 올리세요. 실제 학생 정보, SQLite 파일, .env, 비밀번호와 API 키는 포함하지 마세요. 로컬 개발에는 별도 샘플 SQLite를 사용합니다. `TURSO_DATABASE_URL`과 `TURSO_AUTH_TOKEN`은 플랫폼이 해당 앱 전용 DB로 설정합니다. 서버에서만 사용하며 `DATABASE_URL`보다 우선합니다. SQLite 호환 마이그레이션과 초기 샘플 데이터는 배포 전에 플랫폼이 준비하므로 앱 시작 시 원격 DB를 변경하지 않습니다. 기존 Neon 앱은 `DATABASE_URL`로 계속 연결합니다.

첫 버전은 루트에 앱이 있는 공개 저장소, 텍스트 소스 파일 500개/5MB 이하를 지원합니다. 이미지가 필요하면 SVG 또는 외부 URL을 사용하세요. 앱 설정은 src/config.json에 있습니다.

## Turso 예시 앱

[English Academy 예시 열기](https://academy-english-demo.vercel.app) — Turso 도쿄 DB를 사용하는 로그인 없는 읽기 전용 샘플입니다.

이 템플릿은 `TURSO_DATABASE_URL`과 `TURSO_AUTH_TOKEN`을 서버 환경변수로 지정하면 Turso(libSQL)에 연결합니다. 이 설정이 있으면 DATABASE_URL보다 우선하며, 시작할 때 원격 DB를 변경하지 않습니다. 카탈로그의 신규 자동 배포도 Turso를 사용합니다.

샘플 DB는 템플릿 루트에서 `node --experimental-strip-types scripts/create-demo.ts`로 만들 수 있습니다. 학생·수업·출결·상담·숙제·레벨 테스트 예시만 포함하며, 기존 파일은 덮어쓰지 않습니다. 생성한 SQLite 파일을 Turso의 도쿄 그룹에 `turso db create academy-english-demo --group <도쿄 그룹> --from-file ./english-demo.sqlite`로 올리세요. 그룹 리전은 Turso의 현재 location 목록에서 Tokyo를 확인해 선택하세요.

공개 예시는 `PUBLIC_DEMO=1`, `READ_ONLY=1`과 **읽기 전용 DB 토큰**(`turso db tokens create academy-english-demo --read-only`)을 함께 설정합니다. 모든 등록 요청이 차단되고 화면에도 읽기 전용임이 표시됩니다. Vercel 함수 리전은 서울(`icn1`)로 설정합니다. DB는 도쿄에 있습니다. DB 주소와 토큰은 Vercel의 서버 환경변수에만 저장하고 공개 저장소에는 넣지 마세요.

이전 버전을 fork했다면 신규 배포 전에 최신 템플릿의 Turso 드라이버, `@libsql/client` 의존성 및 lockfile, `academy-template.json`의 `"database": "turso"` 설정을 반영하세요. 기존 마이그레이션은 수정하지 말고 새 변경을 SQLite 호환 SQL로 추가하세요.
