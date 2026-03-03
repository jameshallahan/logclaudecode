import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { callClaude } from '../lib/claude'
import { buildOnboardingProfilePrompt } from '../lib/prompts'
import VoiceRecorder from '../components/VoiceRecorder'

const QUESTIONS = [
  "What are your main goals right now? What does success look like in 3-6 months?",
  "What does your current training look like? How many days a week, what kind of split?",
  "Where are you at right now? Key lifts, fitness level, body composition — whatever feels relevant.",
  "Any injuries, limitations, or things I should know about? Anything off limits?",
  "How's your sleep? What time do you wake up, go to bed? How many hours are you getting?",
  "What does your nutrition look like? Any specific approach, or just winging it?",
  "What's the biggest thing that gets in the way of your training or recovery?",
]

const QUESTION_KEYS = ['goals', 'training', 'baseline', 'constraints', 'sleep', 'nutrition', 'obstacle']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState('welcome') // welcome | questions | review | saving
  const [questionIndex, setQuestionIndex] = useState(0)
  const [transcripts, setTranscripts] = useState({})
  const [profileSummary, setProfileSummary] = useState('')
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [correctionMode, setCorrectionMode] = useState(false)

  const handleTranscript = useCallback((text) => {
    const key = QUESTION_KEYS[questionIndex]
    setTranscripts((prev) => ({ ...prev, [key]: text }))
  }, [questionIndex])

  const handleNext = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1)
    } else {
      generateProfile()
    }
  }

  const generateProfile = async () => {
    setStep('review')
    setGenerating(true)
    setError(null)
    try {
      const prompt = buildOnboardingProfilePrompt(transcripts)
      const summary = await callClaude(prompt, 'Generate my coaching profile from these interview answers.')
      setProfileSummary(summary)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCorrectionTranscript = async (text) => {
    setGenerating(true)
    setError(null)
    try {
      const summary = await callClaude(
        buildOnboardingProfilePrompt(transcripts),
        `Here is the current profile summary:\n\n${profileSummary}\n\nThe user wants these changes: "${text}"\n\nGenerate an updated profile summary incorporating their feedback. Same rules as before — second person, specific, 200 words max, end with "Is this right? Let me know if anything needs adjusting."`,
      )
      setProfileSummary(summary)
      setCorrectionMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirm = async () => {
    setStep('saving')
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: '',
          goals: transcripts.goals || '',
          training_split: transcripts.training || '',
          baseline: transcripts.baseline || '',
          constraints: transcripts.constraints || '',
          sleep_target: transcripts.sleep || '',
          nutrition: transcripts.nutrition || '',
          obstacle: transcripts.obstacle || '',
          onboarding_done: true,
        })

      if (upsertError) throw upsertError
      navigate('/')
    } catch (err) {
      setError(err.message)
      setStep('review')
    }
  }

  // Welcome screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-[#F0F0F0] mb-4">Welcome to The Log</h1>
          <p className="text-sm text-[#888888] leading-relaxed mb-8">
            I'm going to ask you 7 quick questions to understand who you are, how you train, and what you're working towards. Just talk — no typing needed.
          </p>
          <button
            onClick={() => setStep('questions')}
            className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
          >
            Let's go
          </button>
        </div>
      </div>
    )
  }

  // Question flow
  if (step === 'questions') {
    const currentKey = QUESTION_KEYS[questionIndex]
    const hasTranscript = !!transcripts[currentKey]

    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-[#1A1A1A]">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((questionIndex + (hasTranscript ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <p className="text-xs text-[#888888] mb-4 text-center">
              {questionIndex + 1} of {QUESTIONS.length}
            </p>

            <h2 className="text-lg font-semibold text-[#F0F0F0] text-center mb-8 leading-relaxed">
              {QUESTIONS[questionIndex]}
            </h2>

            {hasTranscript ? (
              <div className="space-y-4">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                  <p className="text-sm text-[#F0F0F0] leading-relaxed">{transcripts[currentKey]}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
                >
                  {questionIndex < QUESTIONS.length - 1 ? 'Next' : 'Build my profile'}
                </button>
                <button
                  onClick={() => setTranscripts((prev) => {
                    const next = { ...prev }
                    delete next[currentKey]
                    return next
                  })}
                  className="w-full h-10 text-[#888888] text-sm hover:text-[#F0F0F0] transition-colors"
                >
                  Re-record
                </button>
              </div>
            ) : (
              <VoiceRecorder onTranscript={handleTranscript} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Review + saving
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-[#F0F0F0] text-center mb-6">
          {step === 'saving' ? 'Setting up your profile...' : 'Your coaching profile'}
        </h2>

        {generating ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 animate-pulse">
            <div className="space-y-2">
              <div className="h-3 bg-[#2A2A2A] rounded w-full" />
              <div className="h-3 bg-[#2A2A2A] rounded w-5/6" />
              <div className="h-3 bg-[#2A2A2A] rounded w-4/6" />
              <div className="h-3 bg-[#2A2A2A] rounded w-full" />
              <div className="h-3 bg-[#2A2A2A] rounded w-3/4" />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 mb-6">
              <p className="text-sm text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">{profileSummary}</p>
            </div>

            {correctionMode ? (
              <div className="mb-4">
                <p className="text-xs text-[#888888] text-center mb-4">Tell me what needs changing</p>
                <VoiceRecorder onTranscript={handleCorrectionTranscript} />
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={step === 'saving'}
                  className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {step === 'saving' ? 'Saving...' : "Looks right \u2014 let\u2019s go"}
                </button>
                <button
                  onClick={() => setCorrectionMode(true)}
                  disabled={step === 'saving'}
                  className="w-full h-10 text-[#888888] text-sm hover:text-[#F0F0F0] transition-colors"
                >
                  Something needs adjusting
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-[#FF3B30] text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  )
}
