-- Supabase SQL Editor에서 한 번 실행합니다. 기존 데이터는 덮어쓰지 않습니다.
create table if not exists public.archive_catalog (
  id text primary key check (id = 'public'),
  revision bigint not null check (revision >= 1),
  document jsonb not null check (jsonb_typeof(document) = 'object')
);
alter table public.archive_catalog enable row level security;
revoke all on table public.archive_catalog from anon, authenticated;
grant select, insert, update on table public.archive_catalog to service_role;
-- 공개 읽기와 관리자 쓰기는 모두 Vercel API를 통합니다.
-- service_role 키를 브라우저 환경 변수(VITE_*)에 넣지 마세요.
