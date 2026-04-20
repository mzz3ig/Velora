import { supabase } from './supabase'

const TOKEN_BYTES = 32

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
  const { data, error } = await supabase.rpc('get_portal_payload', { raw_token: token })
  if (error) throw error
  return data
}

export async function acceptPortalProposal(token, proposalId, decision) {
  const { data, error } = await supabase.rpc('portal_accept_proposal', {
    raw_token: token,
    proposal_id: String(proposalId),
    decision,
  })
  if (error) throw error
  return data
}

export async function signPortalContract(token, contractId, signerName) {
  const { data, error } = await supabase.rpc('portal_sign_contract', {
    raw_token: token,
    contract_id: String(contractId),
    signer_name: signerName,
  })
  if (error) throw error
  return data
}

export async function sendPortalMessage(token, messageText) {
  const { data, error } = await supabase.rpc('portal_send_message', {
    raw_token: token,
    message_text: messageText,
  })
  if (error) throw error
  return data
}
