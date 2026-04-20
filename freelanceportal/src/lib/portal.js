import { supabase } from './supabase'

const TOKEN_BYTES = 32
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function bytesToBase64Url(bytes) {
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sha256Hex(value) {
  const encoded = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function getPortalTokenFromUrl(search) {
  return new URLSearchParams(search).get('token') || ''
}

export async function createPortalLink({ clientId = null, projectId = null, expiresInDays = 30 } = {}) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('You need to be signed in to create a portal link.')
  }

  const tokenBytes = new Uint8Array(TOKEN_BYTES)
  crypto.getRandomValues(tokenBytes)
  const token = bytesToBase64Url(tokenBytes)
  const token_hash = await sha256Hex(token)
  const expires_at = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
    : null

  const { error } = await supabase
    .from('portal_links')
    .insert({
      user_id: user.id,
      token_hash,
      client_id: clientId == null ? null : String(clientId),
      project_id: projectId == null ? null : String(projectId),
      expires_at,
    })

  if (error) throw error

  const url = new URL('/portal/overview', window.location.origin)
  url.searchParams.set('token', token)

  return { token, url: url.toString(), expires_at }
}

export async function loadPortalPayload(token) {
  const res = await fetch(`${API_BASE}/portal/payload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not load this portal.')
  return data
}

export async function acceptPortalProposal(token, proposalId, decision) {
  const res = await fetch(`${API_BASE}/portal/accept-proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, proposalId: String(proposalId), decision }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not update this proposal.')
  return data
}

export async function signPortalContract(token, contractId, signerName) {
  const res = await fetch(`${API_BASE}/portal/sign-contract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, contractId: String(contractId), signerName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not sign this contract.')
  return data
}

export async function sendPortalMessage(token, messageText) {
  const res = await fetch(`${API_BASE}/portal/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, messageText }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not send this message.')
  return data
}

export async function getPortalFileUrl(token, path) {
  const params = new URLSearchParams({ token, path })
  const res = await fetch(`${API_BASE}/portal/file?${params.toString()}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not open this file.')
  return data.url
}
