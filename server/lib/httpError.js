class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.expose = options.expose ?? (status >= 400 && status < 500)
    this.code = options.code
    this.cause = options.cause
  }
}

function isHttpError(err) {
  return Boolean(err && typeof err === 'object' && err.name === 'HttpError' && Number.isInteger(err.status))
}

function toPublicMessage(err) {
  if (isHttpError(err) && err.expose && err.message) return err.message
  return 'Internal server error'
}

module.exports = { HttpError, isHttpError, toPublicMessage }

