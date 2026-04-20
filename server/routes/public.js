const express = require('express')
const router = express.Router()
const { getSupabaseAdmin } = require('../lib/supabase')
const { createRateLimiter } = require('../lib/rateLimit')
const { HttpError } = require('../lib/httpError')

const publicFormRateLimit = createRateLimiter({
  name: 'public-form',
  windowMs: 60_000,
  max: 60,
  keyFn: (req) => `public-form:${req.ip}:${String(req.body?.ownerId || req.query?.ownerId || '')}:${String(req.body?.formId || req.query?.formId || '')}`,
})

function _ownerId(value) {
  const ownerId = String(value || '').trim()
  if (!ownerId) throw new HttpError(400, 'ownerId is required', { expose: true })
  return ownerId
}

function _formId(value) {
  const formId = String(value || '').trim()
  if (!formId) throw new HttpError(400, 'formId is required', { expose: true })
  return formId
}

router.get('/form/payload', publicFormRateLimit, async (req, res, next) => {
  try {
    const ownerId = _ownerId(req.query.ownerId)
    const formId = _formId(req.query.formId)
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('public_form_payload', { owner_id: ownerId, form_id: formId })
    if (error || data?.error) throw new HttpError(404, 'Form not found', { expose: true })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.post('/form/submit', publicFormRateLimit, async (req, res, next) => {
  try {
    const ownerId = _ownerId(req.body?.ownerId)
    const formId = _formId(req.body?.formId)
    const response = req.body?.response
    if (!response || typeof response !== 'object') throw new HttpError(400, 'response is required', { expose: true })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('public_submit_form', { owner_id: ownerId, form_id: formId, response_data: response })
    if (error || data?.error) throw new HttpError(400, 'Could not submit this form', { expose: true })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

module.exports = router

