const express = require('express')
const router = express.Router()
const { getSupabaseAdmin } = require('../lib/supabase')
const { createRateLimiter } = require('../lib/rateLimit')
const { HttpError } = require('../lib/httpError')

const portalRateLimit = createRateLimiter({
  name: 'portal-file',
  windowMs: 60_000,
  max: 120,
  keyFn: (req) => `portal-file:${req.ip}:${String(req.query.token || '').slice(0, 16)}`,
})

const portalRpcRateLimit = createRateLimiter({
  name: 'portal-rpc',
  windowMs: 60_000,
  max: 120,
  keyFn: (req) => `portal-rpc:${req.ip}:${String(req.body?.token || '').slice(0, 16)}`,
})

function _portalToken(body) {
  const token = String(body?.token || '')
  if (!token || token.length < 24) throw new HttpError(400, 'token is required', { expose: true })
  return token
}

async function _rpc(name, args) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw new HttpError(403, 'Invalid portal link', { expose: true, cause: error })
  if (data?.error) throw new HttpError(403, 'Invalid portal link', { expose: true })
  return data
}

router.post('/payload', portalRpcRateLimit, async (req, res, next) => {
  try {
    const token = _portalToken(req.body)
    const payload = await _rpc('get_portal_payload', { raw_token: token })
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

router.post('/accept-proposal', portalRpcRateLimit, async (req, res, next) => {
  try {
    const token = _portalToken(req.body)
    const proposalId = String(req.body?.proposalId || '')
    const decision = String(req.body?.decision || '')
    if (!proposalId) throw new HttpError(400, 'proposalId is required', { expose: true })
    if (!['accepted', 'declined'].includes(decision)) throw new HttpError(400, 'decision must be accepted or declined', { expose: true })
    const payload = await _rpc('portal_accept_proposal', { raw_token: token, proposal_id: proposalId, decision })
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

router.post('/sign-contract', portalRpcRateLimit, async (req, res, next) => {
  try {
    const token = _portalToken(req.body)
    const contractId = String(req.body?.contractId || '')
    const signerName = String(req.body?.signerName || '')
    if (!contractId) throw new HttpError(400, 'contractId is required', { expose: true })
    if (!signerName || signerName.trim().length < 2) throw new HttpError(400, 'signerName is required', { expose: true })
    const payload = await _rpc('portal_sign_contract', { raw_token: token, contract_id: contractId, signer_name: signerName })
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

router.post('/send-message', portalRpcRateLimit, async (req, res, next) => {
  try {
    const token = _portalToken(req.body)
    const messageText = String(req.body?.messageText || '')
    if (!messageText || messageText.trim().length === 0) throw new HttpError(400, 'messageText is required', { expose: true })
    if (messageText.length > 4000) throw new HttpError(400, 'messageText is too long', { expose: true })
    const payload = await _rpc('portal_send_message', { raw_token: token, message_text: messageText })
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

router.get('/file', portalRateLimit, async (req, res, next) => {
  try {
    const token = String(req.query.token || '')
    const path = String(req.query.path || '')

    if (!token || !path) {
      return res.status(400).json({ error: 'token and path are required' })
    }

    const supabase = getSupabaseAdmin()
    const { data: payload, error } = await supabase.rpc('get_portal_payload', { raw_token: token })
    if (error || payload?.error) return res.status(403).json({ error: 'Invalid portal link' })

    const allowed = (payload.files || []).some(file => file.storagePath === path || file.storage_path === path)
    if (!allowed) {
      return res.status(403).json({ error: 'File is not available through this portal' })
    }

    const { data, error: signedError } = await supabase
      .storage
      .from('velora-files')
      .createSignedUrl(path, 300)

    if (signedError) throw new HttpError(500, 'Could not open this file', { cause: signedError })

    res.json({ url: data.signedUrl })
  } catch (err) {
    console.error('[portal/file]', err.message)
    next(err)
  }
})

module.exports = router
