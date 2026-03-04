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
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [units, setUnits] = useState('metric') // metric | imperial
  const [height, setHeight] = useState('') // cm if metric
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weight, setWeight] = useState('') // kg if metric, lbs if imperial
  const [questionIndex, setQuestionIndex] = useState(0)
  const [transcripts, setTranscripts] = useState({})
  const [profileSummary, setProfileSummary] = useState('')
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [correctionMode, setCorrectionMode] = useState(false)

  // Convert to metric for storage
  const getHeightCm = () => {
    if (units === 'metric') return parseFloat(height) || null
    const ft = parseFloat(heightFt) || 0
    const inches = parseFloat(heightIn) || 0
    return ft || inches ? Math.round((ft * 30.48) + (inches * 2.54)) : null
  }

  const getWeightKg = () => {
    const w = parseFloat(weight) || null
    if (!w) return null
    return units === 'metric' ? w : Math.round(w * 0.453592 * 10) / 10
  }

  const welcomeValid = name.trim() && age && weight && (units === 'metric' ? height : (heightFt || heightIn))

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
          name: name.trim(),
          age: parseInt(age) || null,
          height_cm: getHeightCm(),
          weight_kg: getWeightKg(),
          unit_preference: units,
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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 animate-page-in">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-text text-center mb-2">Welcome to The Log</h1>
          <p className="text-sm text-text-muted text-center leading-relaxed mb-6">
            A few quick details, then 7 voice questions to build your coaching profile.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="First name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors text-center"
            />

            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="13"
              max="120"
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors text-center"
            />

            {/* Unit toggle */}
            <div className="flex rounded-xl overflow-hidden border border-border">
              <button
                onClick={() => setUnits('metric')}
                className={`flex-1 h-10 text-sm font-semibold transition-colors ${units === 'metric' ? 'bg-white text-bg' : 'bg-surface text-text-muted'}`}
              >
                Metric
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`flex-1 h-10 text-sm font-semibold transition-colors ${units === 'imperial' ? 'bg-white text-bg' : 'bg-surface text-text-muted'}`}
              >
                Imperial
              </button>
            </div>

            {/* Height */}
            {units === 'metric' ? (
              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
                max="250"
                className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors text-center"
              />
            ) : (
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Feet"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  min="3"
                  max="8"
                  className="flex-1 h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors text-center"
                />
                <input
                  type="number"
                  placeholder="Inches"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  min="0"
                  max="11"
                  className="flex-1 h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors text-center"
                />
              </div>
            )}

            {/* Weight */}
            <input
              type="number"
              placeholder={units === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="30"
              max="500"
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-text placeholder-text-muted outline-none focus:border-text-muted transition-colors text-center"
            />
          </div>

          <button
            onClick={() => setStep('questions')}
            disabled={!welcomeValid}
            className="w-full h-12 mt-6 bg-white text-bg font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all disabled:opacity-50"
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
      <div className="min-h-screen bg-bg flex flex-col animate-page-in">
        {/* Progress bar */}
        <div className="h-1 bg-surface">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((questionIndex + (hasTranscript ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div key={questionIndex} className="w-full max-w-sm animate-page-in">
            <p className="text-xs text-text-muted mb-4 text-center">
              {questionIndex + 1} of {QUESTIONS.length}
            </p>

            <h2 className="text-lg font-semibold text-text text-center mb-8 leading-relaxed">
              {QUESTIONS[questionIndex]}
            </h2>

            {hasTranscript ? (
              <div className="space-y-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-sm text-text leading-relaxed">{transcripts[currentKey]}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full h-12 bg-white text-bg font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
                >
                  {questionIndex < QUESTIONS.length - 1 ? 'Next' : 'Build my profile'}
                </button>
                <button
                  onClick={() => setTranscripts((prev) => {
                    const next = { ...prev }
                    delete next[currentKey]
                    return next
                  })}
                  className="w-full h-10 text-text-muted text-sm hover:text-text transition-colors"
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
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 animate-page-in">
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-text text-center mb-6">
          {step === 'saving' ? 'Setting up your profile...' : 'Your coaching profile'}
        </h2>

        {generating ? (
          <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
            <div className="space-y-2">
              <div className="h-3 bg-border rounded w-full" />
              <div className="h-3 bg-border rounded w-5/6" />
              <div className="h-3 bg-border rounded w-4/6" />
              <div className="h-3 bg-border rounded w-full" />
              <div className="h-3 bg-border rounded w-3/4" />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-surface border border-border rounded-xl p-5 mb-6">
              <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{profileSummary}</p>
            </div>

            {correctionMode ? (
              <div className="mb-4">
                <p className="text-xs text-text-muted text-center mb-4">Tell me what needs changing</p>
                <VoiceRecorder onTranscript={handleCorrectionTranscript} />
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={step === 'saving'}
                  className="w-full h-12 bg-white text-bg font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {step === 'saving' ? 'Saving...' : "Looks right \u2014 let\u2019s go"}
                </button>
                <button
                  onClick={() => setCorrectionMode(true)}
                  disabled={step === 'saving'}
                  className="w-full h-10 text-text-muted text-sm hover:text-text transition-colors"
                >
                  Something needs adjusting
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-error text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  )
}
