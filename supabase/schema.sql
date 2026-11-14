-- Finders 사용자 테스트 데이터 (Supabase 무료 플랜용)
-- Supabase 대시보드 > SQL Editor에 그대로 붙여 넣고 Run 하세요. 여러 번 실행해도 안전해요.
--
-- 구조: 기록을 덮어쓰지 않고 이벤트를 한 줄씩 쌓아요(추가 전용).
--   같은 테스터의 기록은 test_id로 묶어요. 로그인이 없어서 브라우저마다 익명 test_id를 만들어요.
-- 보안: 브라우저(publishable 키)는 "추가"만 할 수 있고, 조회·수정·삭제는 못 해요.
--   데이터 확인은 대시보드(Table Editor, SQL Editor)에서만 해요.

create table if not exists public.test_events (
  id bigint generated always as identity primary key,
  test_id uuid not null,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  flow_version text,
  created_at timestamptz not null default now(),
  -- 잘못되거나 지나치게 큰 요청이 쌓이지 않게 막아요.
  constraint test_events_event_format check (event ~ '^[a-z0-9_]{1,64}$'),
  constraint test_events_payload_size check (pg_column_size(payload) <= 8192),
  constraint test_events_flow_version_len check (flow_version is null or char_length(flow_version) <= 64)
);

create index if not exists test_events_test_id_idx on public.test_events (test_id, created_at);

-- RLS: 켜 두면 정책으로 허용한 것만 가능해요.
alter table public.test_events enable row level security;

-- 익명(anon) 브라우저는 추가만 가능. 조회·수정·삭제 정책은 일부러 만들지 않아요.
drop policy if exists "anon can insert test events" on public.test_events;
create policy "anon can insert test events"
  on public.test_events
  for insert
  to anon
  with check (true);

revoke all on public.test_events from anon, authenticated;
grant insert on public.test_events to anon;

-- 분석용 예시 (대시보드 SQL Editor에서 실행)
-- 테스터별 퀵메뉴 [완료] 기록:
--   select test_id, payload->'selected_menu_ids' as picks, created_at
--   from public.test_events where event = 'quickmenu_done' order by created_at;
