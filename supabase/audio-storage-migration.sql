-- ==========================================================
-- Audio Storage Migration
-- ==========================================================
-- Run this in the Supabase SQL editor after setup.sql.
-- Adds audio_url column to daily_logs and creates the
-- audio-logs storage bucket with per-user RLS.
-- ==========================================================

-- Add audio_url column to daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS audio_url text;

-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-logs', 'audio-logs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-logs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to read their own audio
CREATE POLICY "Users can read own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio-logs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
