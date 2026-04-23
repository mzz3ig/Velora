import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Authentication required')
  return { Authorization: `Bearer ${token}` }
}

export async function uploadFile(file) {
  const headers = await authHeaders()
  const filename = encodeURIComponent(file.name || 'file')
  const res = await fetch(`${API_BASE}/storage/upload?filename=${filename}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Upload failed')
  return { path: data.path }
}

export async function deleteStorageFile(path) {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/storage/delete`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Delete failed')
  return data
}

export function getPublicUrl(path) {
  return getSignedUrl(path)
}

export async function getSignedUrl(path, expiresIn = 3600) {
  const headers = await authHeaders()
  const params = new URLSearchParams({ path, expiresIn: String(expiresIn) })
  const res = await fetch(`${API_BASE}/storage/url?${params.toString()}`, { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Could not create signed url')
  return data.url
}
