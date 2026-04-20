import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(method, path, body) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  })
  const responseData = await res.json()
  if (!res.ok) throw new Error(responseData.error || `Request failed: ${res.status}`)
  return responseData
}

async function post(path, body) {
  return request('POST', path, body)
}

async function get(path) {
  return request('GET', path, null)
}

// Create a Stripe Checkout session for a client invoice.
// Returns { url, sessionId } — redirect client to `url` to pay.
export async function createInvoiceCheckout({ invoiceId, amount, currency = 'eur', description, clientEmail }) {
  return post('/stripe/create-checkout', { invoiceId, amount, currency, description, clientEmail })
}

// Create a Stripe Customer Portal session for the freelancer's own subscription.
// Returns { url } — open in new tab.
export async function createBillingPortal({ customerId, returnUrl }) {
  return post('/stripe/create-portal', { customerId, returnUrl })
}

// Create a Stripe Checkout session for a new Velora subscription.
// Returns { url, customerId } — redirect to `url` to subscribe.
export async function createSubscriptionCheckout({ plan, interval = 'monthly', trialDays = 14 }) {
  return post('/stripe/create-subscription', { plan, interval, trialDays })
}

// Admin-only endpoints (server validates admin access)
export async function adminMe() {
  return get('/admin/me')
}

export async function adminStateRows({ limit = 5000, order = 'desc' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), order })
  return get(`/admin/state?${params.toString()}`)
}

export async function adminStateSample(limit = 5) {
  const params = new URLSearchParams({ limit: String(limit) })
  return get(`/admin/state/sample?${params.toString()}`)
}
