# The Log — Claude Code Memory

## What This Is
Voice-first PWA for AI coaching. Users onboard via voice interview, then get personalised morning prompts and evening logs daily.

## Stack
- React + Vite, Tailwind CSS v4
- Supabase (auth, DB, storage)
- OpenAI Whisper (voice transcription)
- Anthropic Claude (AI coaching, model: claude-sonnet-4-20250514)
- PWA via vite-plugin-pwa

## Key Architecture Decisions
- All user input in core loops is voice — no typing
- API keys are client-side (VITE_ prefixed env vars) — single authenticated user, no backend proxy in Phase 1
- Auth guard redirects to /onboarding if onboarding_done is false
- Morning prompt + workout are generated fresh each day, cached once loaded
- Evening log uses 7 sequential voice prompts, then Claude parses into structured JSON

## Database Tables
- user_profiles — built from onboarding, keyed by auth.users id
- daily_logs — morning + evening logs per day with structured JSONB
- workouts — daily prescribed sessions with workout_json JSONB
- weekly_programs — 7-day programs + recap

## File Structure
- /src/lib/ — supabase, whisper, claude, prompts (all prompt builders)
- /src/hooks/ — useVoiceRecorder, useUserProfile, useTodayLog
- /src/components/ — VoiceRecorder, PromptCard, WorkoutCard, LogCard, WeeklyRecap
- /src/pages/ — Onboarding, Home, Morning, Evening, Weekly

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Environment Variables Required
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_OPENAI_API_KEY
VITE_ANTHROPIC_API_KEY
```
