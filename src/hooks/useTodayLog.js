import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function useTodayLog() {
  const [morningDone, setMorningDone] = useState(false)
  const [eveningDone, setEveningDone] = useState(false)
  const [morningLog, setMorningLog] = useState(null)
  const [eveningLog, setEveningLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchTodayStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const today = getTodayDate()

        const { data: logs } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)

        if (!cancelled && logs) {
          const morning = logs.find((l) => l.type === 'morning')
          const evening = logs.find((l) => l.type === 'evening')
          setMorningDone(!!morning)
          setEveningDone(!!evening)
          setMorningLog(morning || null)
          setEveningLog(evening || null)
        }

        // Calculate streak
        const { data: allLogs } = await supabase
          .from('daily_logs')
          .select('log_date, type')
          .eq('user_id', user.id)
          .eq('type', 'evening')
          .order('log_date', { ascending: false })
          .limit(60)

        if (!cancelled && allLogs) {
          let count = 0
          const dates = [...new Set(allLogs.map((l) => l.log_date))].sort().reverse()
          const todayObj = new Date(today)

          for (let i = 0; i < dates.length; i++) {
            const expected = new Date(todayObj)
            expected.setDate(expected.getDate() - i)
            const expectedStr = expected.toISOString().split('T')[0]
            if (dates[i] === expectedStr) {
              count++
            } else {
              break
            }
          }
          setStreak(count)
        }

        if (!cancelled) setLoading(false)
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTodayStatus()
    return () => { cancelled = true }
  }, [])

  const refetch = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const today = getTodayDate()
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)

    if (logs) {
      const morning = logs.find((l) => l.type === 'morning')
      const evening = logs.find((l) => l.type === 'evening')
      setMorningDone(!!morning)
      setEveningDone(!!evening)
      setMorningLog(morning || null)
      setEveningLog(evening || null)
    }
    setLoading(false)
  }

  return { morningDone, eveningDone, morningLog, eveningLog, streak, loading, refetch }
}
