import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useUserProfile } from './hooks/useUserProfile'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Morning from './pages/Morning'
import Evening from './pages/Evening'
import Weekly from './pages/Weekly'
import BottomNav from './components/BottomNav'

function AuthGate({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
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
      <div className="min-h-screen bg-bg flex flex-col px-5 pt-safe pb-safe animate-page-in">
        {/* Brand — top half */}
        <div className="flex-1 flex flex-col justify-end pb-10">
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.15em] mb-5">Training Coach</p>
          <h1 className="text-6xl font-semibold text-text tracking-tight leading-none">
            The<br />Log
          </h1>
        </div>

        {/* Content — bottom half */}
        <div className="pb-10">
          <h2 className="text-xl font-semibold text-text mb-2">Check your email</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-1">Verification link sent to</p>
          <p className="text-sm font-semibold text-text mb-8">{email}</p>

          <button
            onClick={() => { setAwaitingVerification(false); setIsSignUp(false) }}
            className="w-full h-14 bg-white text-bg font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all mb-3"
          >
            Back to sign in
          </button>

          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full h-10 text-text-muted text-sm hover:text-text transition-colors disabled:opacity-50"
          >
            {resending ? 'Sending...' : "Didn't get it? Resend"}
          </button>

          {error && (
            <div className="bg-surface border border-border rounded-xl p-4 mt-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col px-5 pt-safe pb-safe animate-page-in">
      {/* Brand — owns the top half of the screen */}
      <div className="flex-1 flex flex-col justify-end pb-10">
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.15em] mb-5">Training Coach</p>
        <h1 className="text-6xl font-semibold text-text tracking-tight leading-none">
          The<br />Log
        </h1>
      </div>

      {/* Form — anchored to the bottom */}
      <div className="pb-10">
        <div className="flex rounded-xl overflow-hidden border border-border mb-4">
          <button
            onClick={() => { setIsSignUp(false); setError(null) }}
            className={`flex-1 h-11 text-sm font-semibold transition-colors ${!isSignUp ? 'bg-white text-bg' : 'bg-surface text-text-muted hover:text-text'}`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(null) }}
            className={`flex-1 h-11 text-sm font-semibold transition-colors ${isSignUp ? 'bg-white text-bg' : 'bg-surface text-text-muted hover:text-text'}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors"
          />
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-bg font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-surface border border-border rounded-xl p-4 mt-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OnboardingGuard({ children }) {
  const { profile, loading } = useUserProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile?.onboarding_done) return <Navigate to="/onboarding" replace />
  return children
}

function AppShell() {
  const location = useLocation()
  const hideNav = location.pathname === '/onboarding'

  return (
    <>
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
      {!hideNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </BrowserRouter>
  )
}
