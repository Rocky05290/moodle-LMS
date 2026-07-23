-- ============================================================
--  Cordoba Training Center — Supabase schema (Phase 2)
--  Run this in: Supabase Dashboard → SQL Editor → New query
--  Mirrors the app's data model (see app/src/data/mock.ts)
-- ============================================================

-- ---------- enums ----------
create type user_role as enum ('admin', 'trainer', 'learner', 'auditor', 'company');
create type attendance_code as enum ('P', 'L1', 'L2', 'L3', 'A');
create type batch_status as enum ('upcoming', 'active', 'completed');
create type assessment_kind as enum ('pre', 'act', 'mid', 'post');

-- ---------- profiles (extends Supabase auth.users) ----------
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  mobile      text,
  cpr         text,                       -- Bahrain national ID
  company     text,
  role        user_role not null default 'learner',
  created_at  timestamptz not null default now()
);

-- ---------- courses ----------
create table courses (
  id           bigint generated always as identity primary key,
  code         text not null,             -- CCNA / CCNP / SEC
  title        text not null,
  category     text,
  total_hours  int not null default 0,
  modules      jsonb not null default '[]',  -- [{num,title,desc}]
  created_at   timestamptz not null default now()
);

-- ---------- batches ----------
create table batches (
  id           bigint generated always as identity primary key,
  batch_code   text not null unique,      -- CTC-CCNA-2601
  course_id    bigint not null references courses (id) on delete restrict,
  trainer_id   uuid references profiles (id) on delete set null,
  start_date   date not null,
  end_date     date not null,
  start_time   time,
  end_time     time,
  total_hours  int not null default 0,
  status       batch_status not null default 'upcoming',
  created_at   timestamptz not null default now()
);

-- ---------- enrollments ----------
create table enrollments (
  id           bigint generated always as identity primary key,
  learner_id   uuid not null references profiles (id) on delete cascade,
  batch_id     bigint not null references batches (id) on delete cascade,
  progress     int not null default 0 check (progress between 0 and 100),
  created_at   timestamptz not null default now(),
  unique (learner_id, batch_id)
);

-- ---------- attendance ----------
create table attendance (
  id           bigint generated always as identity primary key,
  learner_id   uuid not null references profiles (id) on delete cascade,
  batch_id     bigint not null references batches (id) on delete cascade,
  session_date date not null,
  code         attendance_code not null,
  remarks      text,
  marked_by    uuid references profiles (id) on delete set null,
  marked_at    timestamptz not null default now(),
  unique (learner_id, batch_id, session_date)
);

-- ---------- grades ----------
create table grades (
  id           bigint generated always as identity primary key,
  learner_id   uuid not null references profiles (id) on delete cascade,
  batch_id     bigint not null references batches (id) on delete cascade,
  assessment   assessment_kind not null,
  score        numeric(5,2) not null check (score between 0 and 100),
  graded_by    uuid references profiles (id) on delete set null,
  graded_at    timestamptz not null default now(),
  unique (learner_id, batch_id, assessment)
);

-- ---------- holidays ----------
create table holidays (
  holiday_date date primary key,
  name         text not null
);

-- ---------- audit_log (for the Auditor role) ----------
create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references profiles (id) on delete set null,
  action      text not null,             -- e.g. "Changed grade"
  detail      text,                      -- e.g. "Mid 55 -> 61"
  reason      text,                      -- required for compliance
  created_at  timestamptz not null default now()
);

-- ---------- indexes ----------
create index on enrollments (batch_id);
create index on attendance (batch_id, session_date);
create index on grades (batch_id);
create index on batches (course_id);
create index on batches (trainer_id);

-- ============================================================
--  Helper: current user's role (used by policies)
-- ============================================================
create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

-- auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', 'New'),
    coalesce(new.raw_user_meta_data ->> 'last_name', 'User'),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'learner')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
--  Row-Level Security
--  Golden rule: the AUDITOR can SELECT everything but never write.
-- ============================================================
alter table profiles    enable row level security;
alter table courses     enable row level security;
alter table batches     enable row level security;
alter table enrollments enable row level security;
alter table attendance  enable row level security;
alter table grades      enable row level security;
alter table holidays    enable row level security;
alter table audit_log   enable row level security;

-- everyone signed in can READ reference/shared data
create policy read_all_courses     on courses     for select using (auth.uid() is not null);
create policy read_all_batches     on batches     for select using (auth.uid() is not null);
create policy read_all_holidays    on holidays    for select using (auth.uid() is not null);
create policy read_all_enrollments on enrollments for select using (auth.uid() is not null);
create policy read_all_attendance  on attendance  for select using (auth.uid() is not null);
create policy read_all_grades      on grades      for select using (auth.uid() is not null);
create policy read_all_audit       on audit_log   for select using (auth.uid() is not null);

-- profiles: you can read your own; admin/auditor read all
create policy read_own_profile on profiles for select
  using (id = auth.uid() or auth_role() in ('admin', 'auditor'));
create policy update_own_profile on profiles for update
  using (id = auth.uid() or auth_role() = 'admin');

-- ADMIN can do everything (write) on the operational tables
create policy admin_write_courses     on courses     for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy admin_write_batches     on batches     for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy admin_write_enrollments on enrollments for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
create policy admin_write_holidays    on holidays    for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- TRAINER can write attendance & grades for THEIR batches
create policy trainer_write_attendance on attendance for all
  using (auth_role() = 'admin' or exists (
    select 1 from batches b where b.id = attendance.batch_id and b.trainer_id = auth.uid()))
  with check (auth_role() = 'admin' or exists (
    select 1 from batches b where b.id = attendance.batch_id and b.trainer_id = auth.uid()));

create policy trainer_write_grades on grades for all
  using (auth_role() = 'admin' or exists (
    select 1 from batches b where b.id = grades.batch_id and b.trainer_id = auth.uid()))
  with check (auth_role() = 'admin' or exists (
    select 1 from batches b where b.id = grades.batch_id and b.trainer_id = auth.uid()));

-- anyone signed in may append to the audit log (immutable: no update/delete policy)
create policy append_audit on audit_log for insert with check (auth.uid() is not null);

-- NOTE: the AUDITOR role gets only the read_all_* SELECT policies above and
-- no write policy on any table — so it is physically read-only at the DB level. ✅
