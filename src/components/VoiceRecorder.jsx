import { useState, useEffect, useRef } from 'react'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { transcribeAudio } from '../lib/whisper'

export default function VoiceRecorder({ onTranscript, disabled = false }) {
  const { isRecording, blob, error, start, stop } = useVoiceRecorder()
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const lastBlobRef = useRef(null)

  useEffect(() => {
    let interval
    if (isRecording) {
      setElapsed(0)
      interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  useEffect(() => {
    if (!blob) return
    lastBlobRef.current = blob

    let cancelled = false
    async function transcribe() {
      setTranscribing(true)
      setTranscribeError(null)
      try {
        const text = await transcribeAudio(blob)
        if (!cancelled) onTranscript(text, blob)
      } catch (err) {
        if (!cancelled) setTranscribeError(err.message)
      } finally {
        if (!cancelled) setTranscribing(false)
      }
    }
    transcribe()
    return () => { cancelled = true }
  }, [blob, onTranscript])

  const handleRetry = async () => {
    if (!lastBlobRef.current) return
    setTranscribing(true)
    setTranscribeError(null)
    try {
      const text = await transcribeAudio(lastBlobRef.current)
      onTranscript(text, lastBlobRef.current)
    } catch (err) {
      setTranscribeError(err.message)
    } finally {
      setTranscribing(false)
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stop : start}
        disabled={disabled || transcribing}
        className="relative flex items-center justify-center"
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isRecording
              ? 'bg-record scale-110'
              : transcribing
                ? 'bg-border'
                : 'bg-border hover:bg-surface-hover active:scale-95'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isRecording ? (
            <div className="w-6 h-6 rounded-sm bg-white" />
          ) : transcribing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"
                fill="currentColor"
              />
              <path
                d="M19 10v2a7 7 0 0 1-14 0v-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        {isRecording && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-record animate-pulse" />
        )}
      </button>

      {isRecording && (
        <p className="text-sm text-text-muted tabular-nums">{formatTime(elapsed)}</p>
      )}

      {transcribing && (
        <p className="text-sm text-text-muted">Transcribing...</p>
      )}

      {(error || transcribeError) && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-error">{error || transcribeError}</p>
          {transcribeError && (
            <button
              onClick={handleRetry}
              disabled={transcribing}
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Retry transcription
            </button>
          )}
        </div>
      )}
    </div>
  )
}
