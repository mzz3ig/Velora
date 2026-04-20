const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const { getSupabaseAdmin, requireUser } = require('../lib/supabase')
const { requireEnv } = require('../lib/env')
const { HttpError } = require('../lib/httpError')
const { createRateLimiter } = require('../lib/rateLimit')

let _stripe = null
function getStripe() {
  if (_stripe) return _stripe
  _stripe = Stripe(requireEnv('STRIPE_SECRET_KEY'), { apiVersion: '2026-02-25.clover' })
  return _stripe
}

const PLAN_PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  studio: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_STUDIO_YEARLY,
  },
}

const PRICE_LOOKUP = Object.entries(PLAN_PRICES).reduce((acc, [plan, intervals]) => {
  Object.entries(intervals).forEach(([interval, priceId]) => {
    if (priceId) acc[priceId] = { plan, interval }
  })
  return acc
}, {})

function _resolveCheckoutPrice({ plan, interval, priceId }) {
  if (priceId) {
    const match = PRICE_LOOKUP[priceId]
    if (!match) return null
    return { ...match, priceId }
  }

  const normalizedPlan = String(plan || '').toLowerCase()
  const normalizedInterval = String(interval || 'monthly').toLowerCase()
  const resolvedPriceId = PLAN_PRICES[normalizedPlan]?.[normalizedInterval]
  if (!resolvedPriceId) return null

  return {
    plan: normalizedPlan,
    interval: normalizedInterval,
    priceId: resolvedPriceId,
  }
}

const stripeWriteRateLimit = createRateLimiter({
  name: 'stripe-write',
  windowMs: 60_000,
  max: 30,
  keyFn: (req) => `stripe-write:${req.user?.id || req.ip}`,
})

async function _getInvoiceForUser(userId, invoiceId) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', userId)
    .eq('store_key', 'velora-invoices')
    .maybeSingle()

  if (error) throw new HttpError(500, 'Failed to load invoice state', { cause: error })

  const invoices = data?.value?.state?.invoices || []
  const invoice = invoices.find((inv) => String(inv.id) === String(invoiceId))
  if (!invoice) throw new HttpError(404, 'Invoice not found', { expose: true })
  return invoice
}

function _invoiceAmountCents(invoice) {
  const amount = Number(invoice?.amount || 0)
  const discount = Number(invoice?.discount || 0)
  const tax = Number(invoice?.tax || 0)

  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) return 0
  if (!Number.isFinite(tax) || tax < 0 || tax > 100) return 0

  const discounted = amount * (1 - discount / 100)
  const net = discounted * (1 + tax / 100)
  return Math.round(net * 100)
}

// ─── POST /stripe/create-checkout ─────────────────────────────────────────
// Called by the freelancer's app when they click "Get payment link" on an invoice.
// Creates a Stripe Checkout session and returns the URL to embed/share with the client.
router.post('/create-checkout', requireUser, stripeWriteRateLimit, async (req, res, next) => {
  try {
    const { invoiceId, currency = 'eur', description, clientEmail } = req.body
    const userId = req.user.id

    if (!invoiceId) {
      return res.status(400).json({ error: 'invoiceId is required' })
    }

    const invoice = await _getInvoiceForUser(userId, invoiceId)
    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Invoice is already paid' })
    }

    const amountInCents = _invoiceAmountCents(invoice)
    if (amountInCents < 50) {
      return res.status(400).json({ error: 'Amount must be at least €0.50' })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description || `Invoice ${invoiceId}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: clientEmail || undefined,
      metadata: {
        invoice_id: invoiceId,
        user_id: userId,
      },
      success_url: `${process.env.FRONTEND_URL}/app/invoices?paid=${invoiceId}`,
      cancel_url: `${process.env.FRONTEND_URL}/app/invoices`,
    })

    // Store the checkout session ID against the invoice in Supabase velora_state
    // so we can look it up when the webhook fires.
    await _storeCheckoutSession(userId, invoiceId, session.id, session.url)

    res.json({ url: session.url, sessionId: session.id, amountInCents })
  } catch (err) {
    console.error('[create-checkout]', err.message)
    next(err)
  }
})

// ─── POST /stripe/create-portal ────────────────────────────────────────────
// Called by the freelancer's Settings > Billing tab.
// Returns a Stripe Customer Portal URL so they can manage their Velora subscription.
router.post('/create-portal', requireUser, stripeWriteRateLimit, async (req, res, next) => {
  try {
    const { returnUrl } = req.body || {}
    const expectedCustomerId = await _getCustomerIdForUser(req.user.id)
    if (!expectedCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer exists for this account yet' })
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: expectedCustomerId,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/app/settings`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('[create-portal]', err.message)
    next(err)
  }
})

// ─── POST /stripe/create-subscription ─────────────────────────────────────
// Called when a new user signs up and selects a plan.
// Creates a Stripe Customer + Checkout session for the subscription.
router.post('/create-subscription', requireUser, stripeWriteRateLimit, async (req, res, next) => {
  try {
    const { priceId, plan, interval = 'monthly', trialDays = 14 } = req.body
    const userId = req.user.id
    const email = req.user.email

    if (!email) {
      return res.status(400).json({ error: 'Signed-in user email is required' })
    }

    const resolvedPrice = _resolveCheckoutPrice({ plan, interval, priceId })
    if (!resolvedPrice) {
      return res.status(400).json({ error: 'Invalid plan, interval, or priceId' })
    }

    const stripe = getStripe()
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({ email, limit: 1 })
    let customer = existingCustomers.data[0]

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      })
    } else if (customer.metadata?.user_id !== userId) {
      customer = await stripe.customers.update(customer.id, {
        metadata: { ...customer.metadata, user_id: userId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: resolvedPrice.priceId, quantity: 1 }],
      subscription_data: {
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
        metadata: {
          user_id: userId,
          plan: resolvedPrice.plan,
          interval: resolvedPrice.interval,
        },
      },
      metadata: {
        user_id: userId,
        plan: resolvedPrice.plan,
        interval: resolvedPrice.interval,
      },
      success_url: `${process.env.FRONTEND_URL}/app/dashboard?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
    })

    res.json({ url: session.url, customerId: customer.id, plan: resolvedPrice.plan, interval: resolvedPrice.interval })
  } catch (err) {
    console.error('[create-subscription]', err.message)
    next(err)
  }
})

// ─── POST /stripe/webhook ──────────────────────────────────────────────────
// Stripe calls this URL when payment events happen.
// IMPORTANT: must use raw body (not JSON parsed) for signature verification.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(req.body, sig, requireEnv('STRIPE_WEBHOOK_SECRET'))
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`[webhook] ${event.type}`)

  try {
    if (await _hasProcessedEvent(event.id)) {
      return res.json({ received: true, duplicate: true })
    }

    switch (event.type) {

      // ── Client paid a freelancer's invoice ────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode !== 'payment') break // skip subscription checkouts here

        const invoiceId = session.metadata?.invoice_id
        const userId = session.metadata?.user_id
        if (!invoiceId || !userId) break

        await _markInvoicePaid(userId, invoiceId, session.payment_intent)
        await _addNotification(userId, 'payment', `Payment received for invoice ${invoiceId}`)
        break
      }

      // ── Async payment confirmation (bank transfers, etc.) ─────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object
        // Only handle if linked to a checkout session that has our metadata
        // (handled above via checkout.session.completed for card payments)
        break
      }

      // ── Freelancer's Velora subscription ──────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const userId = sub.metadata?.user_id
          || await _getUserIdFromCustomer(sub.customer)
        if (!userId) break

        const plan = _resolvePlan(sub)
        const interval = _resolveInterval(sub)
        await _updateSubscription(userId, {
          plan,
          billingInterval: interval,
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
          paymentState: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const userId = await _getUserIdFromCustomer(sub.customer)
        if (!userId) break

        await _updateSubscription(userId, {
          plan: 'free',
          billingInterval: null,
          subscriptionStatus: 'canceled',
          paymentState: 'canceled',
          cancelAtPeriodEnd: false,
        })
        await _addNotification(userId, 'payment', 'Your Velora subscription has been cancelled.')
        break
      }

      // ── Invoice payment failed (freelancer's subscription) ────────────
      case 'invoice.payment_failed': {
        const inv = event.data.object
        const userId = await _getUserIdFromCustomer(inv.customer)
        if (!userId) break

        await _updateSubscription(userId, {
          paymentState: 'payment_failed',
          latestInvoiceId: inv.id,
        })
        await _addNotification(userId, 'overdue', 'Your Velora subscription payment failed. Please update your payment method.')
        break
      }

      default:
        break
    }
    await _markProcessedEvent(event)
  } catch (err) {
    console.error(`[webhook] Handler error for ${event.type}:`, err.message)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }

  res.json({ received: true })
})

// ─── Helpers ───────────────────────────────────────────────────────────────

async function _storeCheckoutSession(userId, invoiceId, sessionId, url) {
  // We patch the invoice object inside velora_state to add stripeSessionId + stripeCheckoutUrl
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', userId)
    .eq('store_key', 'velora-invoices')
    .single()

  if (!data) return

  const store = data.value
  const invoices = store?.state?.invoices || []
  const updated = invoices.map(inv =>
    inv.id === invoiceId
      ? { ...inv, stripeSessionId: sessionId, stripeCheckoutUrl: url }
      : inv
  )

  store.state.invoices = updated
  await supabase
    .from('velora_state')
    .update({ value: store, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('store_key', 'velora-invoices')
}

async function _markInvoicePaid(userId, invoiceId, paymentIntentId) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', userId)
    .eq('store_key', 'velora-invoices')
    .single()

  if (!data) return

  const store = data.value
  const invoices = store?.state?.invoices || []
  const updated = invoices.map(inv =>
    inv.id === invoiceId
      ? {
          ...inv,
          status: 'paid',
          paid: new Date().toISOString().split('T')[0],
          stripePaymentIntentId: paymentIntentId,
        }
      : inv
  )

  store.state.invoices = updated
  await supabase
    .from('velora_state')
    .update({ value: store, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('store_key', 'velora-invoices')
}

async function _addNotification(userId, type, text) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.rpc('portal_add_notification', {
    owner_id: userId,
    notification_type: type,
    notification_text: text,
  })
  if (error) console.error('[_addNotification]', error.message)
}

async function _getUserIdFromCustomer(customerId) {
  // Look up userId stored in Stripe customer metadata
  try {
    const stripe = getStripe()
    const customer = await stripe.customers.retrieve(customerId)
    return customer?.metadata?.user_id || null
  } catch {
    return null
  }
}

function _resolvePlan(subscription) {
  // Map Stripe price IDs to plan names
  const priceId = subscription.items?.data?.[0]?.price?.id
  const match = PRICE_LOOKUP[priceId]
  if (match) return match.plan

  if (subscription.metadata?.plan) {
    return subscription.metadata.plan
  }

  return 'starter'
}

function _resolveInterval(subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id
  const match = PRICE_LOOKUP[priceId]
  if (match) return match.interval

  const recurringInterval = subscription.items?.data?.[0]?.price?.recurring?.interval
  if (recurringInterval === 'year') return 'yearly'
  if (recurringInterval === 'month') return 'monthly'

  return subscription.metadata?.interval || null
}

async function _updateSubscription(userId, data) {
  const supabase = getSupabaseAdmin()
  const { data: row } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', userId)
    .eq('store_key', 'velora-settings')
    .single()

  const store = row?.value || { state: {}, version: 0 }
  store.state = store.state || {}
  store.state.billing = { ...(store.state.billing || {}), ...data }

  await supabase
    .from('velora_state')
    .upsert(
      { user_id: userId, store_key: 'velora-settings', value: store, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,store_key' }
    )
}

async function _getCustomerIdForUser(userId) {
  const supabase = getSupabaseAdmin()
  const { data: row } = await supabase
    .from('velora_state')
    .select('value')
    .eq('user_id', userId)
    .eq('store_key', 'velora-settings')
    .maybeSingle()

  return row?.value?.state?.billing?.stripeCustomerId || null
}

async function _hasProcessedEvent(eventId) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('stripe_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle()

  return Boolean(data)
}

async function _markProcessedEvent(event) {
  const supabase = getSupabaseAdmin()
  await supabase
    .from('stripe_webhook_events')
    .upsert(
      { event_id: event.id, event_type: event.type, processed_at: new Date().toISOString() },
      { onConflict: 'event_id' }
    )
}

module.exports = router
