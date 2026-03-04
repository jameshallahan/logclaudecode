export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { audio, mimeType, filename } = req.body

  if (!audio) {
    return res.status(400).json({ error: 'No audio provided' })
  }

  const buffer = Buffer.from(audio, 'base64')
  const blob = new Blob([buffer], { type: mimeType || 'audio/webm' })

  const formData = new FormData()
  formData.append('file', blob, filename || 'recording.webm')
  formData.append('model', 'whisper-1')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    return res.status(response.status).json({ error })
  }

  const data = await response.json()
  return res.status(200).json({ text: data.text })
}
