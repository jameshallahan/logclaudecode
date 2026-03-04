-- ==========================================================
-- The Log — Add body stats columns to user_profiles
-- ==========================================================
-- Run this in the Supabase SQL editor after setup.sql
-- ==========================================================

alter table user_profiles add column if not exists age integer;
alter table user_profiles add column if not exists height_cm numeric;
alter table user_profiles add column if not exists weight_kg numeric;
alter table user_profiles add column if not exists unit_preference text default 'metric';
