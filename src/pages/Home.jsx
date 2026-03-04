import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '../hooks/useUserProfile'
import { useTodayLog } from '../hooks/useTodayLog'
import { useWeekLogs } from '../hooks/useWeekLogs'
import { supabase } from '../lib/supabase'
import WeekDots from '../components/WeekDots'

export default function Home() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useUserProfile()
  const { morningDone, eveningDone, streak, loading: logLoading } = useTodayLog()
  const { days, todayIndex, loading: weekLoading } = useWeekLogs()

  const loading = profileLoading || logLoading || weekLoading

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getNextAction = () => {
    if (!morningDone) return { label: 'Start morning check-in', path: '/morning' }
    if (!eveningDone) return { label: 'Start evening log', path: '/evening' }
    return null
  }

  const nextAction = getNextAction()
  const tasksComplete = morningDone && eveningDone

  return (
    <div className="min-h-screen bg-bg flex flex-col px-5 pt-safe pb-20 animate-page-in">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs text-text-muted">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-xl font-semibold text-text mt-1">
            {greeting()}{profile?.name ? `, ${profile.name}` : ''}
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-text-muted hover:text-text transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Week dots + streak */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">This week</h3>
          {streak > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-text">{streak}</span>
              <span className="text-xs text-text-muted">day streak</span>
            </div>
          )}
        </div>
        <WeekDots days={days} todayIndex={todayIndex} />
      </div>

      <div className="h-6" />

      {/* Today's status — 2-column stat grid */}
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Today</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/morning')}
          className="bg-surface border border-border rounded-xl p-4 text-left active:scale-[0.98] transition-all"
        >
          <p className="text-xs text-text-muted mb-1">Morning</p>
          <p className={`text-lg font-semibold ${morningDone ? 'text-success' : 'text-text'}`}>
            {morningDone ? 'Done' : 'Pending'}
          </p>
        </button>

        <button
          onClick={() => navigate('/evening')}
          className="bg-surface border border-border rounded-xl p-4 text-left active:scale-[0.98] transition-all"
        >
          <p className="text-xs text-text-muted mb-1">Evening</p>
          <p className={`text-lg font-semibold ${eveningDone ? 'text-success' : 'text-text'}`}>
            {eveningDone ? 'Done' : 'Pending'}
          </p>
        </button>
      </div>

      <div className="h-6" />

      {/* Primary CTA */}
      {nextAction && (
        <button
          onClick={() => navigate(nextAction.path)}
          className="w-full h-14 bg-white text-bg font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
        >
          {nextAction.label}
        </button>
      )}

      {tasksComplete && (
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-sm text-text-muted">You're done for today. Rest up.</p>
        </div>
      )}
    </div>
  )
}
