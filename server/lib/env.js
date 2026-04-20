const { HttpError } = require('./httpError')

function missingEnv(keys) {
  return keys.filter((key) => !process.env[key] || String(process.env[key]).trim().length === 0)
}

function requireEnv(key) {
  const value = process.env[key]
  if (!value || String(value).trim().length === 0) {
    throw new HttpError(500, `missing ${key}`, { expose: true, code: 'MISSING_ENV' })
  }
  return value
}

module.exports = { missingEnv, requireEnv }

