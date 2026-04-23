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

async function _loadFormsStore(ownerId) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', ownerId)
    .eq('store_key', 'velora-forms')
    .maybeSingle()

  if (error) throw new HttpError(500, 'Could not load forms', { cause: error })
  return data?.value || { state: { forms: [] }, version: 0 }
}

function _findActiveForm(store, formId) {
  const forms = store?.state?.forms || store?.state?.state?.forms || []
  const match = (forms || []).find((f) => String(f.id) === String(formId))
  if (!match) return null
  if (String(match.status || 'draft') !== 'active') return null
  return match
}

function _isMissingRpc(err) {
  // PostgREST "function not found"
  return String(err?.code || '') === 'PGRST202'
}

router.get('/form/payload', publicFormRateLimit, async (req, res, next) => {
  try {
    const ownerId = _ownerId(req.query.ownerId)
    const formId = _formId(req.query.formId)
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('public_form_payload', { owner_id: ownerId, form_id: formId })

    if (!error && data && !data?.error) {
      return res.json(data)
    }

    if (error && !_isMissingRpc(error)) {
      throw new HttpError(500, 'Could not load this form', { cause: error })
    }

    // Fallback (works even if RPCs weren't applied yet).
    const store = await _loadFormsStore(ownerId)
    const form = _findActiveForm(store, formId)
    if (!form) throw new HttpError(404, 'Form not found', { expose: true })
    res.json({ id: String(form.id), name: form.name || 'Untitled form', fields: form.fields || [] })
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

    if (!error && data && !data?.error) {
      return res.json(data)
    }

    if (error && !_isMissingRpc(error)) {
      throw new HttpError(500, 'Could not submit this form', { cause: error })
    }

    // Fallback (works even if RPCs weren't applied yet).
    const store = await _loadFormsStore(ownerId)
    const forms = store?.state?.forms || []
    const idx = forms.findIndex((f) => String(f.id) === String(formId))
    if (idx < 0 || String(forms[idx]?.status || 'draft') !== 'active') {
      throw new HttpError(404, 'Form not found', { expose: true })
    }

    const submission = {
      id: Date.now(),
      data: response,
      submittedAt: new Date().toISOString(),
    }

    const nextForms = [...forms]
    const current = nextForms[idx] || {}
    nextForms[idx] = {
      ...current,
      submissions: [...(current.submissions || []), submission],
    }

    const nextStore = {
      ...(store || {}),
      state: { ...(store.state || {}), forms: nextForms },
    }

    await supabase
      .from('velora_state')
      .upsert(
        { user_id: ownerId, store_key: 'velora-forms', value: nextStore, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,store_key' }
      )

    // Best-effort notification (RPC exists in your schema, but we don't hard-fail if it doesn't).
    try {
      await supabase.rpc('portal_add_notification', {
        owner_id: ownerId,
        notification_type: 'client',
        notification_text: 'New public form submission',
      })
    } catch {
      // ignore
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
