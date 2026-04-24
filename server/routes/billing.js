const express = require('express')
const router = express.Router()
const { requireUser, checkSubscriptionAccess } = require('../lib/supabase')
const email = require('../lib/email')

// GET /billing/status
// Returns current billing state and whether the user has access.
// The frontend calls this on app load to decide whether to show the paywall.
router.get('/status', requireUser, async (req, res, next) => {
  try {
    const { allowed, reason, billing } = await checkSubscriptionAccess(req.user.id)

    const trialEndsAt = billing?.trialEndsAt ? new Date(billing.trialEndsAt) : null
    const now = new Date()
    const trialDaysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)))
      : null

    res.json({
      allowed,
      reason,
      subscriptionStatus: billing?.subscriptionStatus || null,
      plan: billing?.plan || null,
      trialEndsAt: billing?.trialEndsAt || null,
      trialDaysLeft,
      currentPeriodEnd: billing?.currentPeriodEnd || null,
      cancelAtPeriodEnd: billing?.cancelAtPeriodEnd || false,
      paymentState: billing?.paymentState || null,
    })
  } catch (err) {
    next(err)
  }
})

// GET /billing/email/status — check if email is configured
router.get('/email/status', requireUser, (req, res) => {
  res.json({ configured: email.isConfigured() })
})

// POST /billing/email/test — send a test email to the authenticated user
router.post('/email/test', requireUser, async (req, res, next) => {
  try {
    if (!email.isConfigured()) {
      return res.status(503).json({ error: 'Email provider not configured. Set RESEND_API_KEY.' })
    }
    await email.sendWelcome({ to: req.user.email, firstName: req.user.email.split('@')[0] })
    res.json({ ok: true, to: req.user.email })
  } catch (err) {
    next(err)
  }
})

module.exports = router
