import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, uploadAudioBlob } from '../lib/supabase'
import { callClaude } from '../lib/claude'
import { buildEveningParsePrompt, buildEveningSynthesisPrompt } from '../lib/prompts'
import { useTodayLog } from '../hooks/useTodayLog'
import VoiceRecorder from '../components/VoiceRecorder'

const EVENING_PROMPTS = [
  "Did you train today? Walk me through the session — exercises, sets, reps, weights.",
  "Any soreness, tightness, or niggles worth noting?",
  "How was your nutrition today? Hit your targets?",
  "How was your energy — before, during, and after training?",
  "What's one win from today? Doesn't have to be training.",
  "Reading, learning, or anything interesting on your mind today?",
  "Anything else on your mind before we close out the day?",
]

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export default function Evening() {
  const navigate = useNavigate()
  const { streak } = useTodayLog()
  const [promptIndex, setPromptIndex] = useState(0)
  const [transcripts, setTranscripts] = useState([])
  const [synthesis, setSynthesis] = useState('')
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [existingSynthesis, setExistingSynthesis] = useState('')
  const [blobs, setBlobs] = useState([])
  const [checkingLog, setCheckingLog] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function checkExisting() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setCheckingLog(false); return }

        const { data: existingLog } = await supabase
          .from('daily_logs')
          .select('structured')
          .eq('user_id', user.id)
          .eq('log_date', getTodayDate())
          .eq('type', 'evening')
          .maybeSingle()

        if (!cancelled && existingLog) {
          setAlreadyDone(true)
          setExistingSynthesis(existingLog.structured?.synthesis || '')
        }
      } catch { /* no existing log */ }
      if (!cancelled) setCheckingLog(false)
    }
    checkExisting()
    return () => { cancelled = true }
  }, [])

  const handleTranscript = useCallback((text, audioBlob) => {
    setTranscripts((prev) => [...prev, text])
    if (audioBlob) setBlobs((prev) => [...prev, audioBlob])
  }, [])

  const handleNext = async () => {
    if (promptIndex < EVENING_PROMPTS.length - 1) {
      setPromptIndex((i) => i + 1)
    } else {
      await processEveningLog()
    }
  }

  const processEveningLog = async () => {
    setProcessing(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const allTranscripts = transcripts
        .map((t, i) => `Q${i + 1}: ${t}`)
        .join('\n\n')

      // Parse into structured JSON
      const parsePrompt = buildEveningParsePrompt({ allTranscripts })
      const parseResponse = await callClaude(parsePrompt, 'Parse this evening log.')
      const structured = JSON.parse(parseResponse)

      // Get tomorrow's workout for synthesis
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const { data: tomorrowWorkout } = await supabase
        .from('workouts')
        .select('workout_json')
        .eq('user_id', user.id)
        .eq('workout_date', tomorrowStr)
        .single()

      // Generate synthesis
      const synthPrompt = buildEveningSynthesisPrompt({
        structuredLog: structured,
        tomorrowsWorkout: tomorrowWorkout?.workout_json || null,
      })
      const synthResponse = await callClaude(synthPrompt, 'Close out the evening log.')
      setSynthesis(synthResponse)

      // Upload audio blobs
      const audioUrls = []
      for (let i = 0; i < blobs.length; i++) {
        try {
          const url = await uploadAudioBlob(user.id, getTodayDate(), `evening-${i + 1}`, blobs[i])
          audioUrls.push(url)
        } catch { /* don't block save if upload fails */ }
      }

      // Save to database
      await supabase.from('daily_logs').insert({
        user_id: user.id,
        log_date: getTodayDate(),
        type: 'evening',
        transcript: allTranscripts,
        structured: { ...structured, synthesis: synthResponse, audio_urls: audioUrls },
        audio_url: audioUrls[0] || null,
      })

      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (checkingLog) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 animate-page-in">
        <div className="w-full max-w-sm text-center">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 mb-6">
            <p className="text-sm text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">
              {existingSynthesis || "You've already logged this evening."}
            </p>
          </div>
          {streak > 0 && (
            <p className="text-sm text-[#888888] mb-6">{streak} day streak</p>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
          >
            Back to home
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
        <p className="text-sm text-[#FF3B30] mb-4">{error}</p>
        <button
          onClick={() => { setError(null); setProcessing(false) }}
          className="text-sm text-[#888888] hover:text-[#F0F0F0] mb-2"
        >
          Try again
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#888888] hover:text-[#F0F0F0]"
        >
          Back to home
        </button>
      </div>
    )
  }

  // Done state — show synthesis
  if (done) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 animate-page-in">
        <div className="w-full max-w-sm text-center">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 mb-6">
            <p className="text-sm text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">{synthesis}</p>
          </div>

          {(streak + 1) > 0 && (
            <p className="text-sm text-[#888888] mb-6">
              {streak + 1} day streak
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // Processing state
  if (processing) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#888888]">Processing your log...</p>
      </div>
    )
  }

  // Question flow
  const hasCurrentTranscript = transcripts.length > promptIndex

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col animate-page-in">
      {/* Progress bar */}
      <div className="h-1 bg-[#1A1A1A]">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((promptIndex + (hasCurrentTranscript ? 1 : 0)) / EVENING_PROMPTS.length) * 100}%` }}
        />
      </div>

      {/* Back button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#888888] hover:text-[#F0F0F0]"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div key={promptIndex} className="w-full max-w-sm animate-page-in">
          <p className="text-xs text-[#888888] mb-4 text-center">
            {promptIndex + 1} of {EVENING_PROMPTS.length}
          </p>

          <h2 className="text-lg font-semibold text-[#F0F0F0] text-center mb-8 leading-relaxed">
            {EVENING_PROMPTS[promptIndex]}
          </h2>

          {hasCurrentTranscript ? (
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
                <p className="text-sm text-[#F0F0F0] leading-relaxed">{transcripts[promptIndex]}</p>
              </div>
              <button
                onClick={handleNext}
                className="w-full h-12 bg-white text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all"
              >
                {promptIndex < EVENING_PROMPTS.length - 1 ? 'Next' : 'Finish log'}
              </button>
              <button
                onClick={() => { setTranscripts((prev) => prev.slice(0, -1)); setBlobs((prev) => prev.slice(0, -1)) }}
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
