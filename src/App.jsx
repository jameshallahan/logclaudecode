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
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setError(signUpError.message)
      } else {
        setAwaitingVerification(true)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(signInError.message)
    }
    setLoading(false)
  }

  const handleResendVerification = async () => {
    setResending(true)
    setError(null)
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email })
    if (resendError) setError(resendError.message)
    setResending(false)
  }

  if (awaitingVerification) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#F0F0F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#F0F0F0] mb-2">Check your email</h1>
          <p className="text-sm text-[#888888] leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="text-sm text-[#F0F0F0] font-semibold mb-6">{email}</p>
          <p className="text-sm text-[#888888] leading-relaxed mb-8">
            Click the link to verify your account, then come back here and sign in.
          </p>

          <button
            onClick={() => { setAwaitingVerification(false); setIsSignUp(false) }}
            className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all mb-3"
          >
            Back to sign in
          </button>

          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full h-10 text-[#888888] text-sm hover:text-[#F0F0F0] transition-colors disabled:opacity-50"
          >
            {resending ? 'Sending...' : "Didn't get it? Resend"}
          </button>

          {error && (
            <p className="text-sm text-[#FF3B30] text-center mt-4">{error}</p>
          )}
        </div>
      </div>
    )
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
