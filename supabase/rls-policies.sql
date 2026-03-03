-- Run this in the Supabase SQL editor to enable RLS and set policies.
-- Each table is locked to the authenticated user's own rows.

-- ============================================
-- user_profiles
-- ============================================
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

-- ============================================
-- daily_logs
-- ============================================
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

-- ============================================
-- workouts
-- ============================================
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

-- ============================================
-- weekly_programs
-- ============================================
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
