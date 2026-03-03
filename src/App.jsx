import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useUserProfile } from './hooks/useUserProfile'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Morning from './pages/Morning'
import Evening from './pages/Evening'
import Weekly from './pages/Weekly'

function AuthGate({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <AuthScreen />
  return children
}

function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (authError) setError(authError.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[#F0F0F0] text-center mb-2">The Log</h1>
        <p className="text-sm text-[#888888] text-center mb-8">Voice-first AI coaching</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 text-sm text-[#F0F0F0] placeholder-[#888888] outline-none focus:border-[#888888] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-12 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 text-sm text-[#F0F0F0] placeholder-[#888888] outline-none focus:border-[#888888] transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
          className="w-full mt-4 text-sm text-[#888888] hover:text-[#F0F0F0] transition-colors text-center"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>

        {error && (
          <p className="text-sm text-[#FF3B30] text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  )
}

function OnboardingGuard({ children }) {
  const { profile, loading } = useUserProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile?.onboarding_done) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/"
            element={
              <OnboardingGuard>
                <Home />
              </OnboardingGuard>
            }
          />
          <Route
            path="/morning"
            element={
              <OnboardingGuard>
                <Morning />
              </OnboardingGuard>
            }
          />
          <Route
            path="/evening"
            element={
              <OnboardingGuard>
                <Evening />
              </OnboardingGuard>
            }
          />
          <Route
            path="/weekly"
            element={
              <OnboardingGuard>
                <Weekly />
              </OnboardingGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}
