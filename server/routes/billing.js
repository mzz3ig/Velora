const express = require('express')
const router = express.Router()
const { requireUser, checkSubscriptionAccess } = require('../lib/supabase')

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

module.exports = router
