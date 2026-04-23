const crypto = require('crypto')
const express = require('express')
const router = express.Router()
const { getSupabaseAdmin, requireUser } = require('../lib/supabase')
const { HttpError } = require('../lib/httpError')
const { createRateLimiter } = require('../lib/rateLimit')
const { BUCKET, MAX_BYTES, ensureBucketExists } = require('../lib/storageBucket')

const storageRateLimit = createRateLimiter({
  name: 'storage',
  windowMs: 60_000,
  max: 60,
  keyFn: (req) => `storage:${req.user?.id || req.ip}`,
})

function sanitizeFilename(value) {
  const raw = String(value || '').trim()
  if (!raw) return 'file'
  // keep it simple and safe for paths
  return raw
    .replace(/[^\w.\-()+ ]+/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 160)
}

// Upload is binary (raw bytes), not JSON.
// Frontend sends: POST /storage/upload?filename=... with body=file bytes.
router.post(
  '/upload',
  requireUser,
  storageRateLimit,
  express.raw({ type: '*/*', limit: `${MAX_BYTES}b` }),
  async (req, res, next) => {
    try {
      const filename = sanitizeFilename(req.query.filename)
      const contentType = String(req.headers['content-type'] || '').trim() || 'application/octet-stream'
      const bytes = req.body

      if (!bytes || !Buffer.isBuffer(bytes) || bytes.length === 0) {
        throw new HttpError(400, 'File body is required', { expose: true })
      }
      if (bytes.length > MAX_BYTES) {
        throw new HttpError(413, 'File too large', { expose: true })
      }

      await ensureBucketExists()

      const rand = crypto.randomBytes(8).toString('hex')
      const userId = req.user.id
      const path = `${userId}/${Date.now()}-${rand}-${filename}`

      const supabase = getSupabaseAdmin()
      const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      })
      if (error) throw new HttpError(500, 'Upload failed', { cause: error })

      res.json({ path })
    } catch (err) {
      next(err)
    }
  }
)

router.post('/delete', requireUser, storageRateLimit, async (req, res, next) => {
  try {
    const path = String(req.body?.path || '').trim()
    if (!path) throw new HttpError(400, 'path is required', { expose: true })

    await ensureBucketExists()

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new HttpError(500, 'Delete failed', { cause: error })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/url', requireUser, storageRateLimit, async (req, res, next) => {
  try {
    const path = String(req.query.path || '').trim()
    const expiresIn = Math.max(30, Math.min(Number(req.query.expiresIn || 3600), 24 * 3600))
    if (!path) throw new HttpError(400, 'path is required', { expose: true })

    await ensureBucketExists()

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
    if (error) throw new HttpError(500, 'Could not create signed url', { cause: error })

    res.json({ url: data.signedUrl, expiresIn })
  } catch (err) {
    next(err)
  }
})

module.exports = router
