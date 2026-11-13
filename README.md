# 이세계아이돌 소장품 박물관 — Vercel 공용 도감 / 개인 소장 기록 분리 버전

관리자가 수정하는 굿즈·공지·카테고리·디자인 설정은 Supabase에 공용 저장하고,
소장 여부·위시·구성품 체크·개인 메모는 방문자의 브라우저에만 보관합니다.

**먼저 SETUP_SHARED_DATA.md를 읽고 Supabase 연결을 완료하세요.**
코드 업로드만으로 데이터베이스가 자동 생성되지는 않습니다.

## 배포 순서

1. 기존 사이트에서 JSON 백업을 받습니다. 브라우저 저장 데이터를 지우지 마세요.
2. Supabase 프로젝트의 SQL Editor에서 database/supabase.sql을 실행합니다.
3. 이 폴더 전체를 GitHub 저장소에 올립니다. api/, server/, shared/, src/, worker/, database/도 포함합니다.
4. Vercel에 서버 환경 변수를 등록합니다.
   - ADMIN_PASSWORD
   - ADMIN_SESSION_SECRET
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
5. Vercel에서 Redeploy합니다.
6. 기존 데이터를 보유한 브라우저에서 관리자 로그인 후 ‘현재 목록 공용 게시’를 누릅니다.

기존 관리자 비밀번호와 세션 비밀은 유지하면 됩니다.
SUPABASE_SERVICE_ROLE_KEY는 Legacy service_role JWT 키입니다. 일반 anon 키가 아닙니다.
어떤 서버 비밀 값에도 VITE_ 접두사를 붙이지 마세요. 실제 값은 이 ZIP에 포함하지 않았습니다.

## Vercel 설정

- Root Directory: 이 package.json과 vercel.json이 있는 폴더
- Framework: Vite
- Node.js: 24.x
- Install Command: npm ci
- Build Command: npm run build
- Output Directory: dist

## 실행과 검사

```bash
npm ci
npm run dev
npm run lint
npm run build
node --test tests/admin-auth.test.mjs tests/vercel-admin.test.mjs tests/catalog-api.test.mjs
node --import tsx --test tests/shared-catalog.test.ts tests/news-urls.test.ts tests/goods-calculator.test.ts tests/goods-kinds.test.ts
```

npm run dev는 화면 개발용입니다. 관리자 API와 공용 저장소까지 로컬에서 실행하려면
Vercel CLI의 vercel dev를 사용하고 서버 환경 변수를 연결하세요.

## 데이터 동작

- 일반 방문자는 접속 및 주기적 갱신으로 최신 공용 정보를 받습니다.
- 관리자의 공용 수정은 약 1.2초 뒤 자동 저장됩니다. 상태가 상단에 표시됩니다.
- 관리자 자신의 소장 체크나 메모는 공용 저장되지 않습니다.
- 동시에 여러 관리자가 수정하면 충돌을 감지하고 덮어쓰기를 중단합니다.
- 관리자는 편집 보호를 위해 ‘최신 공용 정보 불러오기’로 다른 관리자의 변경을 확인합니다.
- 개인 기록은 같은 브라우저·도메인에서 유지됩니다. 다른 기기 동기화는 포함하지 않습니다.
- 기존 브라우저의 개인 기록은 자동 이전합니다. 다른 도메인으로 이전할 때는 JSON 백업을 복원해야 합니다.
- 공용 데이터 1회 게시 한도는 3MiB입니다. 사진이 많으면 이미지 URL이나 별도 이미지 저장소를 사용하세요.

## 확인 범위

빌드·타입 검사와, 개인 정보 분리·기존 기록 이전·동시 수정 충돌·실패 복구를 검증하는 테스트가 포함되어 있습니다.
실제 Vercel/Supabase 프로젝트에 연결하기 전에는 운영 환경 동기화 검증이 완료된 것이 아닙니다.
