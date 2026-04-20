const { HttpError } = require('./httpError')

function _now() {
  return Date.now()
}

function createRateLimiter({ windowMs, max, keyFn, name }) {
  const buckets = new Map()

  function sweep() {
    const now = _now()
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }

  return function rateLimit(req, _res, next) {
    try {
      sweep()
      const key = keyFn(req)
      if (!key) return next()

      const now = _now()
      const resetAt = now + windowMs
      const bucket = buckets.get(key) || { count: 0, resetAt }

      if (bucket.resetAt <= now) {
        bucket.count = 0
        bucket.resetAt = resetAt
      }

      bucket.count += 1
      buckets.set(key, bucket)

      if (bucket.count > max) {
        return next(new HttpError(429, `rate limited${name ? ` (${name})` : ''}`, { expose: true, code: 'RATE_LIMITED' }))
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { createRateLimiter }

