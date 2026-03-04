import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { callClaude } from '../lib/claude'
import { buildWeeklyProgramPrompt, buildWeeklyRecapPrompt } from '../lib/prompts'
import { useUserProfile } from '../hooks/useUserProfile'
import WorkoutCard from '../components/WorkoutCard'
import WeeklyRecap from '../components/WeeklyRecap'

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export default function Weekly() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const [program, setProgram] = useState(null)
  const [recap, setRecap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    async function fetchWeekly() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const weekStart = getWeekStart()

        const { data: existing } = await supabase
          .from('weekly_programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_start', weekStart)
          .single()

        if (!cancelled) {
          if (existing) {
            setProgram(existing.program_json)
            setRecap(existing.recap_json)
          }
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    fetchWeekly()
    return () => { cancelled = true }
  }, [profile])

  const generateProgram = async () => {
    setGenerating(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch last 7 days of logs
      const { data: last7Logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(14) // 7 days x 2 types

      // Fetch previous program
      const { data: prevProgram } = await supabase
        .from('weekly_programs')
        .select('program_json')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .single()

      // Generate program
      const programPrompt = buildWeeklyProgramPrompt({
        profile,
        last7Logs: last7Logs || [],
        previousProgram: prevProgram?.program_json || null,
      })
      const programResponse = await callClaude(programPrompt, 'Generate this week\'s training program.')
      const programJson = JSON.parse(programResponse)
      setProgram(programJson)

      // Generate recap
      const recapPrompt = buildWeeklyRecapPrompt({
        last7Logs: last7Logs || [],
        weeklyProgram: programJson,
      })
      const recapResponse = await callClaude(recapPrompt, 'Generate the weekly recap.')
      setRecap(recapResponse)

      // Save
      const weekStart = getWeekStart()
      await supabase.from('weekly_programs').upsert({
        user_id: user.id,
        week_start: weekStart,
        program_json: programJson,
        recap_json: recapResponse,
      }, { onConflict: 'user_id,week_start' })
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="min-h-screen bg-bg flex flex-col px-5 py-6 pb-20 animate-page-in">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="text-sm text-text-muted hover:text-text self-start mb-6"
      >
        ← Back
      </button>

      <h1 className="text-lg font-semibold text-text mb-6">Weekly Program</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !program ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-muted mb-6">No program generated for this week yet.</p>
          <button
            onClick={generateProgram}
            disabled={generating}
            className="w-full h-12 bg-white text-bg font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate this week\'s program'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {/* Recap */}
          <WeeklyRecap recap={recap} loading={generating} />

          {/* Day cards */}
          {DAYS.map((day) => {
            const dayPlan = program.find((d) => d.day === day)
            if (!dayPlan) return null

            if (dayPlan.type === 'rest') {
              return (
                <div key={day} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">{day}</span>
                    <span className="text-xs text-text-muted">Rest</span>
                  </div>
                </div>
              )
            }

            if (dayPlan.type === 'active_recovery') {
              return (
                <div key={day} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">{day}</span>
                    <span className="text-xs text-text-muted">Active Recovery</span>
                  </div>
                </div>
              )
            }

            return (
              <div key={day}>
                <p className="text-xs text-text-muted mb-2 ml-1">{day}</p>
                <WorkoutCard workout={dayPlan.workout} />
              </div>
            )
          })}

          {/* Regenerate */}
          <button
            onClick={generateProgram}
            disabled={generating}
            className="w-full h-10 text-text-muted text-sm hover:text-text transition-colors disabled:opacity-50"
          >
            {generating ? 'Regenerating...' : 'Regenerate program'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-error text-center mt-4">{error}</p>
      )}
    </div>
  )
}
