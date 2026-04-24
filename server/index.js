require('dotenv').config()
const express = require('express')
const cors = require('cors')
const stripeRouter = require('./routes/stripe')
const billingRouter = require('./routes/billing')
const portalRouter = require('./routes/portal')
const adminRouter = require('./routes/admin')
const publicRouter = require('./routes/public')
const storageRouter = require('./routes/storage')
const dataRouter = require('./routes/data')
const { missingEnv } = require('./lib/env')
const { toPublicMessage } = require('./lib/httpError')
const { getSupabaseAdmin } = require('./lib/supabase')
const { HttpError } = require('./lib/httpError')

const app = express()
const PORT = process.env.PORT || 4000

const REQUIRED_DATA_TABLES = [
  'workspaces',
  'workspace_members',
  'clients',
  'projects',
  'proposals',
  'contracts',
  'invoices',
  'invoice_items',
  'payments',
  'tasks',
  'time_entries',
  'expenses',
]

app.set('trust proxy', 1)

// CORS — allow only your frontend domain in production
const isProd = process.env.NODE_ENV === 'production'
const allowList = new Set()

function _addOrigins(value) {
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .forEach((origin) => allowList.add(origin))
}

if (!isProd) {
  _addOrigins('http://localhost:5173')
  _addOrigins('http://localhost:4173')
}
_addOrigins(process.env.FRONTEND_URL)
_addOrigins(process.env.FRONTEND_URLS)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowList.has(origin)) return cb(null, true)
    cb(new HttpError(403, 'CORS blocked', { expose: true }))
  },
  credentials: true,
}))

// JSON body parser for all routes EXCEPT /stripe/webhook
// (webhook needs raw body for Stripe signature verification)
app.use((req, res, next) => {
  if (req.path === '/stripe/webhook') return next()
  if (req.path === '/storage/upload') return next()
  express.json()(req, res, next)
})

// Health check
app.get('/health', async (req, res) => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FRONTEND_URL',
  ]
  const missing = missingEnv(required)

  const result = { ok: missing.length === 0, ts: new Date().toISOString(), missing }

  if (String(req.query.deep || '') === '1' && missing.length === 0) {
    const checks = {}
    try {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('velora_state').select('user_id').limit(1)
      checks.supabase = error ? { ok: false, error: 'supabase_query_failed' } : { ok: true }
    } catch {
      checks.supabase = { ok: false, error: 'supabase_unreachable' }
    }

    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase.rpc('portal_token_hash', { raw_token: 'healthcheck-token' })
      checks.pgcrypto = (error || !data) ? { ok: false, error: 'portal_token_hash_failed' } : { ok: true }
    } catch {
      checks.pgcrypto = { ok: false, error: 'portal_token_hash_failed' }
    }

    checks.dataTables = {}
    for (const table of REQUIRED_DATA_TABLES) {
      try {
        const supabase = getSupabaseAdmin()
        const { error } = await supabase.from(table).select('id').limit(1)
        checks.dataTables[table] = error
          ? { ok: false, error: error.code || 'table_check_failed' }
          : { ok: true }
      } catch {
        checks.dataTables[table] = { ok: false, error: 'table_check_failed' }
      }
    }

    result.checks = checks
    result.ok = result.ok
      && checks.supabase?.ok
      && checks.pgcrypto?.ok
      && Object.values(checks.dataTables).every((c) => c.ok)
  }

  res.status(result.ok ? 200 : 500).json(result)
})

// Stripe routes
app.use('/stripe', stripeRouter)
app.use('/billing', billingRouter)
app.use('/storage', storageRouter)
app.use('/data', dataRouter)
app.use('/portal', portalRouter)
app.use('/admin', adminRouter)
app.use('/public', publicRouter)

// Global error handler
app.use((err, req, res, _next) => {
  const status = Number(err?.status) || 500
  console.error('[error]', status, req.method, req.originalUrl, err?.message || err)
  res.status(status).json({ error: toPublicMessage(err) })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Velora API running on port ${PORT}`)
  })
}

module.exports = app
