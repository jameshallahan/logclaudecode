import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadAudioBlob(userId, logDate, type, blob) {
  const ext = blob.type?.includes('mp4') ? 'mp4'
    : blob.type?.includes('ogg') ? 'ogg'
    : blob.type?.includes('aac') ? 'aac'
    : 'webm'
  const path = `${userId}/${logDate}-${type}.${ext}`

  const { error } = await supabase.storage
    .from('audio-logs')
    .upload(path, blob, { contentType: blob.type || 'audio/webm', upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('audio-logs')
    .getPublicUrl(path)

  return urlData.publicUrl
}
