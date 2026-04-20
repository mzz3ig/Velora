const express = require('express')
const router = express.Router()
const { getSupabaseAdmin, requireUser, requireAdmin } = require('../lib/supabase')
const { HttpError } = require('../lib/httpError')

router.use(requireUser, requireAdmin)

async function _getStateRows({ limit, order = 'desc' }) {
  const supabase = getSupabaseAdmin()
  const normalizedLimit = Math.max(1, Math.min(Number(limit || 5000), 20000))
  const ascending = String(order).toLowerCase() === 'asc'

  const { data, error } = await supabase
    .from('velora_state')
    .select('user_id, store_key, updated_at')
    .order('updated_at', { ascending })
    .limit(normalizedLimit)

  if (error) throw new HttpError(500, 'Failed to read platform state metadata', { cause: error })
  return data || []
}

router.get('/me', async (req, res) => {
  res.json({ email: req.user.email, userId: req.user.id })
})

router.get('/state', async (req, res, next) => {
  try {
    const rows = await _getStateRows({ limit: req.query.limit, order: req.query.order })
    res.json({ rows })
  } catch (err) {
    next(err)
  }
})

router.get('/state/sample', async (req, res, next) => {
  try {
    const rows = await _getStateRows({ limit: req.query.limit || 5, order: 'desc' })
    res.json({ rows })
  } catch (err) {
    next(err)
  }
})

module.exports = router

