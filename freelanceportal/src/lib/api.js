import { supabase } from './supabase'

// In production, default to same-origin (Vercel rewrites route /admin,/stripe,/portal,/public to the backend).
// In local dev, set `VITE_API_URL=http://localhost:4000` in `freelanceportal/.env.local`.
const BASE = import.meta.env.VITE_API_URL || ''

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

// Fetch billing status for the signed-in user.
// Returns { allowed, reason, subscriptionStatus, trialEndsAt, trialDaysLeft, ... }
export async function getBillingStatus() {
  return get('/billing/status')
}

export async function getBackendHealth({ deep = false } = {}) {
  return get(`/health${deep ? '?deep=1' : ''}`)
}

export async function getStripeDiagnostics() {
  return get('/stripe/diagnostics')
}

export async function getDataStatus() {
  return get('/data/status')
}

export async function migrateDataToTables() {
  return post('/data/migrate', {})
}

export async function listClientsFromTables() {
  return get('/data/clients')
}

export async function createClientInTables(client) {
  return post('/data/clients', client)
}

export async function updateClientInTables(id, data) {
  return request('PATCH', `/data/clients/${encodeURIComponent(id)}`, data)
}

export async function archiveClientInTables(id) {
  return post(`/data/clients/${encodeURIComponent(id)}/archive`, {})
}

export async function deleteClientFromTables(id) {
  return request('DELETE', `/data/clients/${encodeURIComponent(id)}`, null)
}

export async function listProjectsFromTables() {
  return get('/data/projects')
}

export async function createProjectInTables(project) {
  return post('/data/projects', project)
}

export async function updateProjectInTables(id, data) {
  return request('PATCH', `/data/projects/${encodeURIComponent(id)}`, data)
}

export async function deleteProjectFromTables(id) {
  return request('DELETE', `/data/projects/${encodeURIComponent(id)}`, null)
}

export async function listInvoicesFromTables() {
  return get('/data/invoices')
}

export async function createInvoiceInTables(invoice) {
  return post('/data/invoices', invoice)
}

export async function updateInvoiceInTables(id, data) {
  return request('PATCH', `/data/invoices/${encodeURIComponent(id)}`, data)
}

export async function markInvoicePaidInTables(id) {
  return post(`/data/invoices/${encodeURIComponent(id)}/paid`, {})
}

export async function markInvoiceViewedInTables(id) {
  return post(`/data/invoices/${encodeURIComponent(id)}/viewed`, {})
}

export async function deleteInvoiceFromTables(id) {
  return request('DELETE', `/data/invoices/${encodeURIComponent(id)}`, null)
}

export async function listTasksFromTables() {
  return get('/data/tasks')
}

export async function createTaskInTables(task) {
  return post('/data/tasks', task)
}

export async function updateTaskInTables(id, data) {
  return request('PATCH', `/data/tasks/${encodeURIComponent(id)}`, data)
}

export async function deleteTaskFromTables(id) {
  return request('DELETE', `/data/tasks/${encodeURIComponent(id)}`, null)
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
