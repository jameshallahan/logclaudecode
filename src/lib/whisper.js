const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

function getExtension(blob) {
  const mime = blob.type || ''
  if (mime.includes('mp4')) return 'mp4'
  if (mime.includes('aac')) return 'aac'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('wav')) return 'wav'
  return 'webm'
}

export async function transcribeAudio(blob) {
  const ext = getExtension(blob)
  const formData = new FormData()
  formData.append('file', blob, `recording.${ext}`)
  formData.append('model', 'whisper-1')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Whisper API error: ${error}`)
  }

  const data = await response.json()
  return data.text
}
