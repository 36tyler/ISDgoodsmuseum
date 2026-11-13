# 공용 도감 + 브라우저별 소장 기록 연결 방법

이 버전은 Vercel에 배포하는 소스입니다. 코드 교체만으로 공용 저장소가 생기지는 않으며 아래 Supabase 설정이 필요합니다.

## 1. 기존 데이터 먼저 백업

현재 사용 중인 사이트에서 관리자 모드의 JSON 백업을 다운로드합니다.
같은 도메인·브라우저에 배포하면 기존 localStorage 소장 기록을 새 형식으로 자동 이전합니다.
브라우저 데이터나 사이트 저장 공간을 지우지 마세요.
다른 도메인으로 옮기면 localStorage가 공유되지 않습니다. 기존 사이트의 JSON 백업을 가져와 복원해야 합니다.

## 2. Supabase 프로젝트 만들기

1. https://supabase.com/dashboard 에 로그인합니다.
2. New project로 프로젝트를 만듭니다. 기존 프로젝트를 써도 됩니다.
3. 프로젝트의 SQL Editor를 엽니다.
4. 이 ZIP의 database/supabase.sql 전체를 붙여넣고 Run을 누릅니다.
5. archive_catalog 테이블이 생성되었는지 확인합니다. 테이블은 처음에는 비어 있는 것이 정상입니다.

이 SQL은 일반 브라우저 키(anon/authenticated)로 테이블을 직접 읽거나 수정하지 못하게 합니다.
공개 정보 조회와 관리자 쓰기는 Vercel API를 통해서만 처리합니다.

## 3. Vercel 환경 변수 등록

프로젝트 Settings → Environment Variables에서 Production과 필요한 Preview 환경에 등록합니다.

| 이름 | 값 |
| --- | --- |
| ADMIN_PASSWORD | 기존 관리자 비밀번호 |
| ADMIN_SESSION_SECRET | 기존의 긴 무작위 세션 서명 비밀 |
| SUPABASE_URL | Supabase 프로젝트 URL, https://xxxx.supabase.co 형태 |
| SUPABASE_SERVICE_ROLE_KEY | Supabase의 Legacy service_role JWT 키 |

Supabase 프로젝트의 Connect 또는 Settings → Data API에서 Project URL을 확인합니다.
Settings → API Keys → Legacy anon, service_role API keys에서 service_role 키를 확인합니다.
화면 버전에 따라 메뉴 이름이 다를 수 있습니다.

- service_role 키는 서버 전용입니다. anon/publishable 키를 넣으면 안 됩니다.
- 이 소스는 Legacy service_role JWT를 사용합니다. sb_secret_ 형식의 새 키와 혼동하지 마세요.
- 변수 이름 앞에 VITE_를 붙이지 마세요.
- 실제 키를 GitHub, 소스 파일, 채팅에 올리지 마세요.
- 두 관리자 환경 변수는 기존 값을 유지하면 됩니다.

## 4. 소스 교체와 재배포

api/, server/, shared/, src/, worker/, database/를 포함해 전체 폴더를 저장소에 반영합니다.
새 파일 api/catalog.js도 반드시 업로드합니다.

Vercel 설정:

- Framework: Vite
- Node.js: 24.x
- Install Command: npm ci
- Build Command: npm run build
- Output Directory: dist

환경 변수를 저장한 뒤 Redeploy합니다.

## 5. 첫 공용 게시

1. 관리자가 기존 데이터를 수정해 둔 같은 브라우저에서 새 사이트를 엽니다.
2. 관리자 모드로 로그인합니다.
3. 공용 저장소 연결이 끝나면 ‘현재 목록 공용 게시’ 버튼이 나옵니다.
4. 필요한 경우 기존 JSON 백업을 먼저 복원합니다.
5. ‘현재 목록 공용 게시’를 누르면 브라우저의 굿즈·공지·카테고리·설정만 공용 저장소에 게시됩니다.
6. ‘공용 정보가 최신 상태입니다’로 표시되는지 확인합니다.

이후 관리자 수정은 약 1.2초 뒤 자동 저장됩니다. 저장 상태와 실패 안내는 상단에 표시됩니다.
새 방문자는 접속할 때 최신 정보를 불러옵니다. 이미 열어 둔 화면은 약 1분~1분 15초마다 확인하며,
서버 캐시 때문에 반영에 약간의 지연이 더 있을 수 있습니다. 탭으로 돌아올 때도 최신 내용을 확인합니다.
관리자로 로그인한 화면은 편집 내용 보호를 위해 자동 갱신을 멈추며, 상단의 ‘최신 공용 정보 불러오기’로 확인합니다.
다른 관리자나 탭의 수정과 충돌하면 덮어쓰기를 중단합니다. 변경 내용을 백업한 뒤 최신 내용을 불러오세요.

## 개인 기록

- 소장 여부, 위시, 개인 메모, 구성품 체크, 개인 좋아요는 각 브라우저에만 저장합니다.
- 서버 전송 단계에서도 개인 필드를 제거합니다.
- 신규 방문자는 예시 데이터의 소장 체크나 개인 메모를 물려받지 않습니다.
- 구성품 순서가 바뀌어도 이름과 중복 순번을 기준으로 개인 체크를 유지합니다.
- 구성품이 새로 추가되면 그 구성품은 미체크 상태이며, 모두 체크해야 소장 완료가 됩니다.
- 브라우저 데이터를 지우면 개인 기록은 사라집니다. 계정 간·기기 간 동기화는 포함하지 않습니다.

## 사진 용량

한 번에 게시하는 공용 데이터는 최대 3MiB입니다. 사진이 많으면 이미지 URL을 이용하세요.
대용량 사진 업로드·공유는 별도 오브젝트 스토리지 연결이 필요합니다.

## 동작 확인

관리자 브라우저와 시크릿 창을 함께 열어 확인합니다.
관리자가 가격·공지 등을 바꾸면 시크릿 창에서도 갱신되어야 합니다.
두 창에서 서로 다르게 소장·위시·메모를 지정하면 각 창의 기록이 유지되어야 합니다.
시크릿 창을 닫으면 그 창의 개인 기록은 없어질 수 있습니다.

## 검사 명령

```bash
npm run lint
npm run build
node --test tests/admin-auth.test.mjs tests/vercel-admin.test.mjs tests/catalog-api.test.mjs
node --import tsx --test tests/shared-catalog.test.ts tests/goods-calculator.test.ts tests/goods-kinds.test.ts
```

실제 Supabase와 연결하기 전에는 단위 검사와 빌드까지만 검증할 수 있습니다.
