import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export function useWeekLogs() {
  const [days, setDays] = useState([false, false, false, false, false, false, false])
  const [todayIndex, setTodayIndex] = useState(-1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const today = new Date()
        const monday = getMonday(today)

        // todayIndex: 0 = Monday, 6 = Sunday
        const dayOfWeek = today.getDay()
        const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        if (!cancelled) setTodayIndex(idx)

        // Build date range for this week
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)

        const { data: logs } = await supabase
          .from('daily_logs')
          .select('log_date, type')
          .eq('user_id', user.id)
          .gte('log_date', formatDate(monday))
          .lte('log_date', formatDate(sunday))

        if (!cancelled && logs) {
          // A day counts as "logged" if it has an evening log
          const loggedDates = new Set(
            logs.filter(l => l.type === 'evening').map(l => l.log_date)
          )

          const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday)
            d.setDate(d.getDate() + i)
            return loggedDates.has(formatDate(d))
          })

          setDays(weekDays)
        }

        if (!cancelled) setLoading(false)
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return { days, todayIndex, loading }
}
