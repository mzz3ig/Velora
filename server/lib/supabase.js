const { createClient } = require('@supabase/supabase-js')
const { requireEnv } = require('./env')
const { HttpError } = require('./httpError')

let _supabaseAdmin = null

function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin
  const url = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  _supabaseAdmin = createClient(url, serviceRoleKey)
  return _supabaseAdmin
}

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid session' })
    }

    req.user = data.user
    next()
  } catch (err) {
    next(err)
  }
}

function requireAdmin(req, _res, next) {
  const configured = (
    process.env.ADMIN_EMAILS
    || process.env.ADMIN_EMAIL
    || process.env.VITE_ADMIN_EMAIL
    || ''
  )
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  if (!configured.length) {
    return next(new HttpError(500, 'missing ADMIN_EMAILS', { expose: true, code: 'MISSING_ENV' }))
  }

  const email = String(req.user?.email || '').trim().toLowerCase()
  if (!email || !configured.includes(email)) {
    return next(new HttpError(403, 'Admin access required', { expose: true }))
  }

  next()
}

// ─── Billing helpers ───────────────────────────────────────────────────────

async function _getBillingState(userId) {
  const supabase = getSupabaseAdmin()
  const { data: row } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', userId)
    .eq('store_key', 'velora-settings')
    .maybeSingle()
  return row?.value?.state?.billing || null
}

// Returns { allowed, reason, billing }
async function checkSubscriptionAccess(userId) {
  const billing = await _getBillingState(userId)

  // No billing state means user just registered and hasn't started a subscription yet.
  // Grant access — they are still within their implicit trial window.
  if (!billing) return { allowed: true, reason: 'no_billing', billing: null }

  const status = billing.subscriptionStatus
  const trialEndsAt = billing.trialEndsAt ? new Date(billing.trialEndsAt) : null
  const now = new Date()

  if (status === 'active') return { allowed: true, reason: 'active', billing }

  if (status === 'trialing') {
    if (trialEndsAt && trialEndsAt < now) {
      return { allowed: false, reason: 'trial_expired', billing }
    }
    return { allowed: true, reason: 'trialing', billing }
  }

  if (status === 'past_due') return { allowed: true, reason: 'past_due', billing }

  if (status === 'canceled' || status === 'unpaid') {
    return { allowed: false, reason: status, billing }
  }

  // Unknown status — allow by default to avoid false lockouts
  return { allowed: true, reason: 'unknown_status', billing }
}

async function requireActiveSubscription(req, res, next) {
  try {
    const { allowed, reason } = await checkSubscriptionAccess(req.user.id)
    if (!allowed) {
      return res.status(402).json({ error: 'subscription_required', reason })
    }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { getSupabaseAdmin, requireUser, requireAdmin, requireActiveSubscription, checkSubscriptionAccess }
