// Vercel serverless entrypoint.
// Routes are rewritten to this function in `vercel.json`.
const app = require('../server')

module.exports = (req, res) => app(req, res)

