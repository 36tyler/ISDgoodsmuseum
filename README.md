# 이세계아이돌 소장품 박물관 — Vercel 배포용

기존 Cloudflare용 소스(v28)에 Vercel용 관리자 API와 배포 설정을 추가한 버전입니다.

## Vercel 배포

1. 이 폴더의 파일들을 GitHub 저장소에 올립니다. 기존 파일을 교체할 때 api/, server/, worker/, scripts/도 함께 반영합니다.
2. Vercel에서 해당 저장소를 가져옵니다.
3. Root Directory는 package.json과 vercel.json이 있는 폴더로 지정합니다.
4. Framework Preset: Vite / Node.js Version: 24.x
5. Build Command: npm run build / Output Directory: dist / Install Command: npm ci
6. Settings → Environment Variables에서 아래 두 값을 서버 환경 변수로 등록합니다.
   - ADMIN_PASSWORD: 사용할 관리자 비밀번호
   - ADMIN_SESSION_SECRET: 충분히 긴 무작위 문자열(예: 32바이트 이상)
7. 필요한 Production/Preview 환경을 선택하고 새로 배포합니다.

vercel.json에 빌드와 설치 설정이 들어 있습니다. 기존 Vercel 프로젝트에 수동 Override가 있다면 위 값과 일치시키세요.
환경 변수 이름에 VITE_를 붙이지 마세요. 실제 비밀번호와 세션 비밀은 이 ZIP에 포함하지 않았습니다.
환경 변수를 바꾼 후에는 다시 배포해야 적용됩니다.

## 로컬 검사

Node.js 24 LTS를 사용합니다.

```bash
npm ci
npm run lint
npm run build
node --test tests/admin-auth.test.mjs tests/vercel-admin.test.mjs
node --import tsx --test tests/goods-calculator.test.ts tests/goods-kinds.test.ts
```

화면 개발은 npm run dev로 가능합니다. 관리자 인증까지 로컬에서 실행하려면 Vercel CLI의 vercel dev를 사용하고 해당 프로젝트 환경 변수를 연결합니다.

## 달라진 부분

- vercel.json: Vite 빌드, npm ci, dist 출력 설정
- api/admin/login.js, logout.js, session.js: Vercel Node 함수
- server/vercel-admin.js: 기존 서버 인증을 Node 함수에 연결
- 기본 빌드는 vite build로 실행하여 정리 스크립트 누락 오류 방지
- Node.js 버전 24.x 지정
- package-lock.json을 사용하는 npm 설치로 통일
- API 함수는 dist 안에 복사하지 않습니다. Vercel이 api/에서 별도 배포합니다.
- 기존 worker/index.js의 인증 코드를 재사용하며 비밀번호를 프런트엔드에 포함하지 않습니다.

## 데이터

굿즈, 공지, 소장/위시, 설정은 기존처럼 브라우저 localStorage에 저장됩니다.
다른 도메인에서는 저장 데이터가 자동으로 따라오지 않으므로, 기존 사이트의 JSON 백업을 내보내 새 사이트에서 복원해야 합니다.

## 확인 범위

로컬 Vite 빌드와 Vercel API 어댑터 테스트를 확인했습니다.
실제 Vercel 계정에서의 배포 성공 여부는 해당 프로젝트의 빌드 로그로 확인해야 합니다.
