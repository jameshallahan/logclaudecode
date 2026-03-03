-- ==========================================================
-- The Log — Complete Supabase Setup
-- ==========================================================
-- Copy-paste this entire file into the Supabase SQL editor
-- and run it once. It creates all tables, then enables RLS
-- with per-user policies.
-- ==========================================================

-- ===================== SCHEMA =====================

-- User profile built from onboarding interview
create table if not exists user_profiles (
  id              uuid primary key references auth.users,
  created_at      timestamp default now(),
  name            text,
  wake_time       text,
  sleep_time      text,
  goals           text,
  training_split  text,
  baseline        text,
  constraints     text,
  sleep_target    text,
  nutrition       text,
  obstacle        text,
  onboarding_done boolean default false
);

-- Morning and evening logs
create table if not exists daily_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references user_profiles(id),
  log_date     date,
  type         text check (type in ('morning', 'evening')),
  transcript   text,
  structured   jsonb,
  created_at   timestamp default now()
);

-- Individual prescribed workouts
create table if not exists workouts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references user_profiles(id),
  workout_date    date,
  generated_at    timestamp default now(),
  workout_json    jsonb,
  completed       boolean default false
);

-- Weekly program + recap
create table if not exists weekly_programs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references user_profiles(id),
  week_start      date,
  program_json    jsonb,
  recap_json      jsonb,
  generated_at    timestamp default now()
);

-- ===================== RLS POLICIES =====================

-- user_profiles
alter table user_profiles enable row level security;

create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- daily_logs
alter table daily_logs enable row level security;

create policy "Users can read own logs"
  on daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- workouts
alter table workouts enable row level security;

create policy "Users can read own workouts"
  on workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- weekly_programs
alter table weekly_programs enable row level security;

create policy "Users can read own programs"
  on weekly_programs for select
  using (auth.uid() = user_id);

create policy "Users can insert own programs"
  on weekly_programs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own programs"
  on weekly_programs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
