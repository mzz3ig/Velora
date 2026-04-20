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

module.exports = { getSupabaseAdmin, requireUser, requireAdmin }
