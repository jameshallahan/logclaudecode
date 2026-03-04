import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '../hooks/useUserProfile'
import { useTodayLog } from '../hooks/useTodayLog'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useUserProfile()
  const { morningDone, eveningDone, streak, loading: logLoading } = useTodayLog()

  const loading = profileLoading || logLoading

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col px-6 pt-safe animate-page-in">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs text-[#888888]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-xl font-semibold text-[#F0F0F0] mt-1">
            {greeting()}{profile?.name ? `, ${profile.name}` : ''}
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-[#888888] hover:text-[#F0F0F0] transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Status cards */}
      <div className="space-y-3 flex-1">
        {/* Streak */}
        {streak > 0 && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-[#888888]">Current streak</span>
            <span className="text-lg font-semibold text-[#F0F0F0]">{streak} day{streak !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Today's progress */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Today</h3>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#F0F0F0]">Morning check-in</span>
            <span className={`text-xs font-semibold ${morningDone ? 'text-green-400' : 'text-[#888888]'}`}>
              {morningDone ? 'Done' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#F0F0F0]">Evening log</span>
            <span className={`text-xs font-semibold ${eveningDone ? 'text-green-400' : 'text-[#888888]'}`}>
              {eveningDone ? 'Done' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Main CTA */}
        {nextAction && (
          <button
            onClick={() => navigate(nextAction.path)}
            className="w-full h-14 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
          >
            {nextAction.label}
          </button>
        )}

        {!nextAction && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 text-center">
            <p className="text-sm text-[#888888]">You're done for today. Rest up.</p>
          </div>
        )}

        {/* Weekly link */}
        <button
          onClick={() => navigate('/weekly')}
          className="w-full h-12 border border-[#2A2A2A] text-[#F0F0F0] font-semibold rounded-xl hover:bg-[#1A1A1A] active:scale-[0.98] transition-all"
        >
          View weekly program
        </button>
      </div>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  )
}
