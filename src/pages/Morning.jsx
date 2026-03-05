import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, uploadAudioBlob } from '../lib/supabase'
import { callClaude } from '../lib/claude'
import { buildMorningPrompt, buildWorkoutPrompt } from '../lib/prompts'
import { useUserProfile } from '../hooks/useUserProfile'
import PromptCard from '../components/PromptCard'
import WorkoutCard from '../components/WorkoutCard'
import VoiceRecorder from '../components/VoiceRecorder'

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function parseSplit(splitString) {
  if (!splitString) return ['Full Body']
  const parts = splitString.split(/[/,]|\band\b/i).map((s) => s.trim()).filter(Boolean)
  return parts.length > 0 ? parts : ['Full Body']
}

function getNextSessionType(splitTypes, recentWorkouts) {
  if (splitTypes.length <= 1) return splitTypes[0]
  if (!recentWorkouts || recentWorkouts.length === 0) return splitTypes[0]

  const lastType = recentWorkouts[0]?.workout_json?.session_type
  if (!lastType) return splitTypes[0]

  const lowerSplits = splitTypes.map((s) => s.toLowerCase())
  const lastIndex = lowerSplits.indexOf(lastType.toLowerCase())
  if (lastIndex === -1) return splitTypes[0]
  return splitTypes[(lastIndex + 1) % splitTypes.length]
}

export default function Morning() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const [workout, setWorkout] = useState(null)
  const [morningText, setMorningText] = useState('')
  const [loading, setLoading] = useState(true)
  const [responded, setResponded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [existingResponse, setExistingResponse] = useState('')

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = getTodayDate()

        const { data: existingLog } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .eq('type', 'morning')
          .maybeSingle()

        if (existingLog) {
          const { data: todayWorkout } = await supabase
            .from('workouts')
            .select('workout_json')
            .eq('user_id', user.id)
            .eq('workout_date', today)
            .maybeSingle()

          if (cancelled) return
          setWorkout(todayWorkout?.workout_json || null)
          setExistingResponse(existingLog.transcript || '')
          try {
            const cached = JSON.parse(localStorage.getItem('morning_cache') || 'null')
            if (cached && cached.date === today) {
              setMorningText(cached.morningText)
            }
          } catch { /* ignore */ }
          setAlreadyDone(true)
          setLoading(false)
          return
        }

        let { data: existingWorkout } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .eq('workout_date', today)
          .single()

        if (!existingWorkout) {
          const splitTypes = parseSplit(profile.training_split)
          const { data: recentWorkouts } = await supabase
            .from('workouts')
            .select('workout_json')
            .eq('user_id', user.id)
            .order('workout_date', { ascending: false })
            .limit(3)

          const sessionType = getNextSessionType(splitTypes, recentWorkouts || [])

          const lastSession = (recentWorkouts || []).find(
            (w) => w.workout_json?.session_type?.toLowerCase() === sessionType.toLowerCase()
          ) || null

          const { data: lastEvening } = await supabase
            .from('daily_logs')
            .select('structured')
            .eq('user_id', user.id)
            .eq('type', 'evening')
            .order('log_date', { ascending: false })
            .limit(1)
            .single()

          const workoutPrompt = buildWorkoutPrompt({
            profile,
            sessionType,
            lastSession: lastSession?.workout_json || null,
            lastEveningLog: lastEvening?.structured || null,
          })

          const workoutResponse = await callClaude(workoutPrompt, 'Generate today\'s training session.')
          const workoutJson = JSON.parse(workoutResponse)

          const { data: saved } = await supabase
            .from('workouts')
            .insert({
              user_id: user.id,
              workout_date: today,
              workout_json: workoutJson,
            })
            .select()
            .single()

          existingWorkout = saved
        }

        if (cancelled) return
        setWorkout(existingWorkout?.workout_json || null)

        const { data: lastEvening } = await supabase
          .from('daily_logs')
          .select('structured')
          .eq('user_id', user.id)
          .eq('type', 'evening')
          .order('log_date', { ascending: false })
          .limit(1)
          .single()

        const { data: recentLogs } = await supabase
          .from('daily_logs')
          .select('structured, log_date')
          .eq('user_id', user.id)
          .eq('type', 'evening')
          .order('log_date', { ascending: false })
          .limit(7)

        const morningPrompt = buildMorningPrompt({
          profile,
          lastEveningLog: lastEvening?.structured || null,
          todaysWorkout: existingWorkout?.workout_json || null,
          recentPatterns: recentLogs?.map((l) => l.structured) || [],
        })

        const text = await callClaude(morningPrompt, 'Generate my morning coaching prompt.')
        if (!cancelled) {
          setMorningText(text)
          setLoading(false)
          try {
            localStorage.setItem('morning_cache', JSON.stringify({
              date: today,
              morningText: text,
              workout: existingWorkout?.workout_json || null,
            }))
          } catch { /* storage full — ignore */ }
        }
      } catch (err) {
        if (!cancelled) {
          try {
            const cached = JSON.parse(localStorage.getItem('morning_cache') || 'null')
            if (cached && cached.date === getTodayDate()) {
              setMorningText(cached.morningText)
              setWorkout(cached.workout)
              setLoading(false)
              return
            }
          } catch { /* bad cache — ignore */ }
          setError(err.message)
          setLoading(false)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [profile])

  const handleResponse = useCallback(async (transcript, audioBlob) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let audioUrl = null
      if (audioBlob) {
        try {
          audioUrl = await uploadAudioBlob(user.id, getTodayDate(), 'morning', audioBlob)
        } catch { /* don't block save if upload fails */ }
      }

      await supabase.from('daily_logs').insert({
        user_id: user.id,
        log_date: getTodayDate(),
        type: 'morning',
        transcript,
        structured: { morning_response: transcript },
        audio_url: audioUrl,
      })

      setResponded(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5 pb-20">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-error mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-bg flex flex-col px-5 pt-safe pb-20 animate-page-in">
        <div className="py-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Morning check-in</h3>
          <h1 className="text-xl font-semibold text-text mt-1">Already done</h1>
        </div>

        <div className="space-y-3">
          {morningText && <PromptCard title="Coach's note" text={morningText} loading={false} />}
          <WorkoutCard workout={workout} loading={false} />

          {existingResponse && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Your response</h3>
              <p className="text-sm text-text leading-relaxed">{existingResponse}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col px-5 pt-safe pb-20 animate-page-in">
      <div className="py-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Morning</h3>
        <h1 className="text-xl font-semibold text-text mt-1">Check-in</h1>
      </div>

      <div className="space-y-3 flex-1">
        <PromptCard title="Coach's note" text={morningText} loading={loading} />
        <WorkoutCard workout={workout} loading={loading} />

        {!loading && !responded && (
          <div className="pt-4">
            <p className="text-xs text-text-muted text-center mb-4">
              {saving ? 'Saving...' : 'Anything to flag before today\'s session?'}
            </p>
            <VoiceRecorder onTranscript={handleResponse} disabled={saving} />
          </div>
        )}

        {responded && (
          <div className="bg-surface border border-border rounded-xl p-5 text-center">
            <svg className="w-8 h-8 text-success mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-text">Logged. Have a good session.</p>
          </div>
        )}
      </div>
    </div>
  )
}
