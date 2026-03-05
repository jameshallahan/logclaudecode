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

      const { data: last7Logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(14)

      const { data: prevProgram } = await supabase
        .from('weekly_programs')
        .select('program_json')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .single()

      const programPrompt = buildWeeklyProgramPrompt({
        profile,
        last7Logs: last7Logs || [],
        previousProgram: prevProgram?.program_json || null,
      })
      const programResponse = await callClaude(programPrompt, 'Generate this week\'s training program.')
      const programJson = JSON.parse(programResponse)
      setProgram(programJson)

      const recapPrompt = buildWeeklyRecapPrompt({
        last7Logs: last7Logs || [],
        weeklyProgram: programJson,
      })
      const recapResponse = await callClaude(recapPrompt, 'Generate the weekly recap.')
      setRecap(recapResponse)

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
    <div className="min-h-screen bg-bg flex flex-col px-5 pt-safe pb-20 animate-page-in">
      <div className="py-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Program</h3>
        <h1 className="text-xl font-semibold text-text mt-1">This week</h1>
      </div>

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
            className="w-full h-14 bg-white text-bg font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate this week\'s program'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <WeeklyRecap recap={recap} loading={generating} />

          {DAYS.map((day) => {
            const dayPlan = program.find((d) => d.day === day)
            if (!dayPlan) return null

            if (dayPlan.type === 'rest' || dayPlan.type === 'active_recovery') {
              return (
                <div key={day} className="border border-border rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-text-muted">{day}</span>
                  <span className="text-xs text-text-dim uppercase tracking-wider">
                    {dayPlan.type === 'rest' ? 'Rest' : 'Active Recovery'}
                  </span>
                </div>
              )
            }

            return (
              <div key={day}>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{day}</h3>
                <WorkoutCard workout={dayPlan.workout} />
              </div>
            )
          })}

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
        <div className="bg-surface border border-border rounded-xl p-4 mt-4">
          <p className="text-sm text-error text-center">{error}</p>
        </div>
      )}
    </div>
  )
}
