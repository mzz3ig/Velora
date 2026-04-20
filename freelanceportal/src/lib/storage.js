import { supabase } from './supabase'

const BUCKET = 'velora-files'

export async function uploadFile(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  return { path }
}

export async function deleteStorageFile(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export function getPublicUrl(path) {
  return getSignedUrl(path)
}

export async function getSignedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
