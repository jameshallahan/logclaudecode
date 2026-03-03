import { useState, useRef, useCallback } from 'react'

const MAX_RECORDING_MS = 3 * 60 * 1000 // 3 minutes

function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
  ]
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return ''
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [blob, setBlob] = useState(null)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  const start = useCallback(async () => {
    try {
      setError(null)
      setBlob(null)
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : undefined
      const mediaRecorder = new MediaRecorder(stream, options)
      const actualMime = mediaRecorder.mimeType || mimeType || 'audio/webm'

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: actualMime })
        setBlob(recordedBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)

      // Auto-stop after 3 minutes
      timerRef.current = setTimeout(() => {
        stop()
      }, MAX_RECORDING_MS)
    } catch (err) {
      setError(err.message || 'Failed to access microphone')
    }
  }, [stop])

  return { isRecording, blob, error, start, stop }
}
