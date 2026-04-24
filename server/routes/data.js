const express = require('express')
const router = express.Router()
const { getSupabaseAdmin, requireUser } = require('../lib/supabase')
const { HttpError } = require('../lib/httpError')
const { createRateLimiter } = require('../lib/rateLimit')
const email = require('../lib/email')

const DATA_TABLES = [
  'workspaces',
  'workspace_members',
  'clients',
  'projects',
  'proposals',
  'contracts',
  'invoices',
  'invoice_items',
  'payments',
  'tasks',
  'time_entries',
  'expenses',
]

const TABLE_PROBE_COLUMNS = {
  workspace_members: 'workspace_id',
}

const OWNER_SCOPED_COUNT_TABLES = DATA_TABLES.filter(
  (table) => !['workspace_members', 'invoice_items'].includes(table),
)

const dataWriteRateLimit = createRateLimiter({
  name: 'data-write',
  windowMs: 60_000,
  max: 20,
  keyFn: (req) => `data-write:${req.user?.id || req.ip}`,
})

// Fetch the freelancer's business name for email templates
async function getBusinessName(userId) {
  try {
    const { data } = await getSupabaseAdmin()
      .from('velora_state')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'velora-settings')
      .maybeSingle()
    if (data?.value) {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
      return parsed?.state?.settings?.businessName || null
    }
  } catch { /* non-fatal */ }
  return null
}

async function tableStatus() {
  const supabase = getSupabaseAdmin()
  const checks = {}

  for (const table of DATA_TABLES) {
    const probeColumn = TABLE_PROBE_COLUMNS[table] || 'id'
    const { error } = await supabase.from(table).select(probeColumn).limit(1)
    checks[table] = error
      ? { ok: false, error: error.code || error.message || 'table_check_failed' }
      : { ok: true }
  }

  return checks
}

async function legacyCounts(userId) {
  const supabase = getSupabaseAdmin()
  const stores = [
    ['clients', 'velora-clients', 'clients'],
    ['projects', 'velora-projects', 'projects'],
    ['proposals', 'velora-proposals', 'proposals'],
    ['contracts', 'velora-contracts', 'contracts'],
    ['invoices', 'velora-invoices', 'invoices'],
    ['tasks', 'velora-tasks', 'tasks'],
    ['time_entries', 'velora-time', 'entries'],
    ['expenses', 'velora-expenses', 'expenses'],
  ]

  const counts = {}
  for (const [label, storeKey, arrayKey] of stores) {
    const { data } = await supabase
      .from('velora_state')
      .select('value')
      .eq('user_id', userId)
      .eq('store_key', storeKey)
      .maybeSingle()

    counts[label] = Array.isArray(data?.value?.state?.[arrayKey])
      ? data.value.state[arrayKey].length
      : 0
  }
  return counts
}

async function normalizedCounts(userId) {
  const supabase = getSupabaseAdmin()
  const counts = {}
  for (const table of OWNER_SCOPED_COUNT_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)

    counts[table] = error ? null : count || 0
  }
  return counts
}

async function ensureWorkspace(userId) {
  const supabase = getSupabaseAdmin()
  const { data: existing, error: existingError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existingError) throw new HttpError(500, 'Could not load workspace', { cause: existingError })
  if (existing?.id) return existing.id

  const { data: created, error: createError } = await supabase
    .from('workspaces')
    .insert({ owner_id: userId, name: 'My workspace' })
    .select('id')
    .single()

  if (createError) throw new HttpError(500, 'Could not create workspace', { cause: createError })

  await supabase
    .from('workspace_members')
    .upsert({ workspace_id: created.id, user_id: userId, role: 'owner' }, { onConflict: 'workspace_id,user_id' })

  return created.id
}

function normalizeClient(row) {
  const initials = String(row.name || 'C')
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return {
    id: row.id,
    legacyId: row.legacy_id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    website: row.website || '',
    taxId: row.tax_id || '',
    tags: row.tags || [],
    notes: row.notes || '',
    status: row.status || 'active',
    initials,
    color: '#a98252',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: 'supabase-table',
  }
}

function clientPayload(body, userId, workspaceId) {
  const name = String(body?.name || '').trim()
  if (!name) throw new HttpError(400, 'Client name is required', { expose: true })

  const status = String(body?.status || 'active')
  return {
    workspace_id: workspaceId,
    owner_id: userId,
    name,
    email: body?.email ? String(body.email).trim().toLowerCase() : null,
    phone: body?.phone ? String(body.phone).trim() : null,
    company: body?.company ? String(body.company).trim() : null,
    website: body?.website ? String(body.website).trim() : null,
    tax_id: body?.taxId ? String(body.taxId).trim() : null,
    tags: Array.isArray(body?.tags) ? body.tags.map(String) : [],
    notes: body?.notes ? String(body.notes) : null,
    status: ['active', 'archived'].includes(status) ? status : 'active',
  }
}

function normalizeProject(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    clientId: row.client_id,
    client: row.clients?.name || '',
    clientColor: '#a98252',
    name: row.name,
    description: row.description || '',
    status: row.status || 'active',
    priority: row.priority || 'medium',
    budget: row.budget == null ? '' : Number(row.budget),
    deadline: row.deadline || '',
    startDate: row.starts_at || '',
    progress: row.progress || 0,
    milestones: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: 'supabase-table',
  }
}

function projectPayload(body, userId, workspaceId) {
  const name = String(body?.name || '').trim()
  if (!name) throw new HttpError(400, 'Project name is required', { expose: true })

  const status = String(body?.status || 'active')
  const progress = Number(body?.progress ?? 0)
  return {
    workspace_id: workspaceId,
    owner_id: userId,
    client_id: body?.clientId || null,
    name,
    description: body?.description ? String(body.description) : null,
    status: status || 'active',
    priority: body?.priority ? String(body.priority) : 'medium',
    budget: body?.budget === '' || body?.budget == null ? null : Number(body.budget),
    starts_at: body?.startDate || body?.startsAt || null,
    deadline: body?.deadline || null,
    progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, Math.round(progress))) : 0,
  }
}

function normalizeInvoice(row) {
  const amount = row.subtotal == null ? 0 : Number(row.subtotal)
  const total = row.total == null ? amount : Number(row.total)
  return {
    id: row.id,
    legacyId: row.legacy_id,
    number: row.invoice_number,
    displayId: row.invoice_number,
    clientId: row.client_id,
    client: row.clients?.name || '',
    clientEmail: row.clients?.email || '',
    projectId: row.project_id,
    project: row.projects?.name || '',
    amount,
    total,
    discount: row.discount == null ? 0 : Number(row.discount),
    tax: row.tax == null ? 0 : Number(row.tax),
    status: row.status || 'draft',
    currency: String(row.currency || 'EUR').toLowerCase(),
    due: row.due_on || '',
    issued: row.issued_on || '',
    paid: row.paid_at ? String(row.paid_at).slice(0, 10) : null,
    viewed: Boolean(row.viewed_at),
    viewed_at: row.viewed_at || null,
    notes: row.notes || '',
    terms: row.terms || '',
    stripeCheckoutUrl: row.stripe_checkout_url || '',
    stripeSessionId: row.stripe_checkout_session_id || '',
    stripePaymentIntentId: row.stripe_payment_intent_id || '',
    source: 'supabase-table',
  }
}

async function nextInvoiceNumber(workspaceId) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('workspace_id', workspaceId)

  if (error) throw new HttpError(500, 'Could not generate invoice number', { cause: error })

  const highest = (data || [])
    .map((row) => Number(String(row.invoice_number || '').replace(/^INV-/, '')))
    .filter((number) => Number.isFinite(number))
    .reduce((max, number) => Math.max(max, number), 0)

  return `INV-${String(highest + 1).padStart(3, '0')}`
}

async function invoicePayload(body, userId, workspaceId, existing = {}) {
  const amount = Number(body?.amount ?? body?.subtotal ?? existing.subtotal ?? 0)
  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, 'Invoice amount must be a valid number', { expose: true })
  }

  const discount = Number(body?.discount ?? existing.discount ?? 0)
  const tax = Number(body?.tax ?? existing.tax ?? 0)
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    throw new HttpError(400, 'Invoice discount must be between 0 and 100', { expose: true })
  }
  if (!Number.isFinite(tax) || tax < 0 || tax > 100) {
    throw new HttpError(400, 'Invoice tax must be between 0 and 100', { expose: true })
  }

  const total = Math.round(amount * (1 - discount / 100) * (1 + tax / 100) * 100) / 100
  const status = String(body?.status || existing.status || 'draft')
  const allowedStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded', 'scheduled']

  return {
    workspace_id: workspaceId,
    owner_id: userId,
    client_id: body?.clientId || existing.client_id || null,
    project_id: body?.projectId || existing.project_id || null,
    invoice_number: body?.number || body?.invoiceNumber || existing.invoice_number || await nextInvoiceNumber(workspaceId),
    status: allowedStatuses.includes(status) ? status : 'draft',
    currency: String(body?.currency || existing.currency || 'EUR').toUpperCase(),
    subtotal: amount,
    discount,
    tax,
    total,
    issued_on: body?.issued || body?.issuedOn || existing.issued_on || new Date().toISOString().slice(0, 10),
    due_on: body?.due || body?.dueOn || existing.due_on || null,
    notes: body?.notes ?? existing.notes ?? null,
    terms: body?.terms ?? existing.terms ?? null,
    stripe_checkout_url: body?.stripeCheckoutUrl ?? existing.stripe_checkout_url ?? null,
    stripe_checkout_session_id: body?.stripeSessionId ?? existing.stripe_checkout_session_id ?? null,
  }
}

function normalizeTask(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    projectId: row.project_id,
    project: row.projects?.name || '— No project —',
    title: row.title,
    notes: row.notes || '',
    status: row.status || 'todo',
    done: row.status === 'completed' || Boolean(row.completed_at),
    priority: row.priority || 'medium',
    due_date: row.due_on || '',
    portal_visible: Boolean(row.portal_visible),
    assignee: row.assignee || '',
    kanban_col: row.kanban_col || '',
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    comments: Array.isArray(row.comments) ? row.comments : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: 'supabase-table',
  }
}

function taskPayload(body, userId, workspaceId, existing = {}) {
  const title = String(body?.title || existing.title || '').trim()
  if (!title) throw new HttpError(400, 'Task title is required', { expose: true })

  const done = Boolean(body?.done ?? (existing.status === 'completed'))
  const rawStatus = body?.status || existing.status || (done ? 'completed' : 'todo')
  const status = done ? 'completed' : String(rawStatus)

  return {
    workspace_id: workspaceId,
    owner_id: userId,
    project_id: body?.projectId || existing.project_id || null,
    title,
    notes: body?.notes ?? existing.notes ?? null,
    status,
    priority: body?.priority || existing.priority || 'medium',
    assignee: body?.assignee ?? existing.assignee ?? null,
    kanban_col: body?.kanban_col ?? existing.kanban_col ?? null,
    due_on: body?.due_date || body?.dueOn || existing.due_on || null,
    completed_at: done ? (existing.completed_at || new Date().toISOString()) : null,
    portal_visible: Boolean(body?.portal_visible ?? existing.portal_visible ?? false),
    subtasks: Array.isArray(body?.subtasks) ? body.subtasks : (existing.subtasks || []),
    comments: Array.isArray(body?.comments) ? body.comments : (existing.comments || []),
  }
}

router.get('/status', requireUser, async (req, res, next) => {
  try {
    const tables = await tableStatus()
    const missingTables = Object.entries(tables)
      .filter(([, check]) => !check.ok)
      .map(([table]) => table)

    const legacy = await legacyCounts(req.user.id)
    let normalized = {}
    if (!missingTables.length) {
      normalized = await normalizedCounts(req.user.id)
    }

    res.json({
      ok: missingTables.length === 0,
      tables,
      missingTables,
      legacy,
      normalized,
      canMigrate: missingTables.length === 0,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/migrate', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const tables = await tableStatus()
    const missingTables = Object.entries(tables)
      .filter(([, check]) => !check.ok)
      .map(([table]) => table)

    if (missingTables.length) {
      throw new HttpError(409, `Apply Supabase schema before migrating: ${missingTables.join(', ')}`, { expose: true })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('migrate_velora_state_to_tables', {
      target_user_id: req.user.id,
    })

    if (error) {
      throw new HttpError(500, `Migration failed: ${error.message || error.code || 'unknown Supabase error'}`, {
        expose: true,
        cause: error,
      })
    }

    res.json({ ok: true, result: data })
  } catch (err) {
    next(err)
  }
})

router.get('/clients', requireUser, async (req, res, next) => {
  try {
    const tables = await tableStatus()
    if (!tables.clients?.ok || !tables.workspaces?.ok) {
      throw new HttpError(409, 'Supabase client tables are not applied yet', { expose: true })
    }

    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw new HttpError(500, 'Could not load clients', { cause: error })
    res.json({ clients: (data || []).map(normalizeClient) })
  } catch (err) {
    next(err)
  }
})

router.post('/clients', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const payload = clientPayload(req.body, req.user.id, workspaceId)
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new HttpError(500, 'Could not create client', { cause: error })
    res.status(201).json({ client: normalizeClient(data) })
  } catch (err) {
    next(err)
  }
})

router.patch('/clients/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const id = String(req.params.id || '')
    const workspaceId = await ensureWorkspace(req.user.id)
    const patch = clientPayload({ ...req.body, name: req.body?.name || 'Client' }, req.user.id, workspaceId)
    delete patch.workspace_id
    delete patch.owner_id
    if (!req.body?.name) delete patch.name

    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', req.user.id)
      .select('*')
      .single()

    if (error) throw new HttpError(500, 'Could not update client', { cause: error })
    res.json({ client: normalizeClient(data) })
  } catch (err) {
    next(err)
  }
})

router.post('/clients/:id/archive', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('clients')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)
      .select('*')
      .single()

    if (error) throw new HttpError(500, 'Could not archive client', { cause: error })
    res.json({ client: normalizeClient(data) })
  } catch (err) {
    next(err)
  }
})

router.delete('/clients/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('clients')
      .delete()
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)

    if (error) throw new HttpError(500, 'Could not delete client', { cause: error })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/projects', requireUser, async (req, res, next) => {
  try {
    const tables = await tableStatus()
    if (!tables.projects?.ok || !tables.workspaces?.ok) {
      throw new HttpError(409, 'Supabase project tables are not applied yet', { expose: true })
    }

    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .select('*, clients(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw new HttpError(500, 'Could not load projects', { cause: error })
    res.json({ projects: (data || []).map(normalizeProject) })
  } catch (err) {
    next(err)
  }
})

router.post('/projects', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const payload = projectPayload(req.body, req.user.id, workspaceId)
    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .insert(payload)
      .select('*, clients(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not create project', { cause: error })
    res.status(201).json({ project: normalizeProject(data) })
  } catch (err) {
    next(err)
  }
})

router.patch('/projects/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const patch = projectPayload({ ...req.body, name: req.body?.name || 'Project' }, req.user.id, workspaceId)
    delete patch.workspace_id
    delete patch.owner_id
    if (!req.body?.name) delete patch.name

    const { data, error } = await getSupabaseAdmin()
      .from('projects')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)
      .select('*, clients(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not update project', { cause: error })
    res.json({ project: normalizeProject(data) })
  } catch (err) {
    next(err)
  }
})

router.delete('/projects/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('projects')
      .delete()
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)

    if (error) throw new HttpError(500, 'Could not delete project', { cause: error })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/invoices', requireUser, async (req, res, next) => {
  try {
    const tables = await tableStatus()
    if (!tables.invoices?.ok || !tables.workspaces?.ok) {
      throw new HttpError(409, 'Supabase invoice tables are not applied yet', { expose: true })
    }

    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .select('*, clients(name,email), projects(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw new HttpError(500, 'Could not load invoices', { cause: error })
    res.json({ invoices: (data || []).map(normalizeInvoice) })
  } catch (err) {
    next(err)
  }
})

router.post('/invoices', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const payload = await invoicePayload(req.body, req.user.id, workspaceId)
    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .insert(payload)
      .select('*, clients(name,email), projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not create invoice', { cause: error })
    res.status(201).json({ invoice: normalizeInvoice(data) })
  } catch (err) {
    next(err)
  }
})

router.patch('/invoices/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const invoiceId = String(req.params.id || '')
    const supabase = getSupabaseAdmin()
    const { data: existing, error: existingError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('owner_id', req.user.id)
      .maybeSingle()

    if (existingError) throw new HttpError(500, 'Could not load invoice', { cause: existingError })
    if (!existing) throw new HttpError(404, 'Invoice not found', { expose: true })

    const payload = await invoicePayload(req.body, req.user.id, existing.workspace_id, existing)
    delete payload.workspace_id
    delete payload.owner_id
    delete payload.invoice_number

    const { data, error } = await supabase
      .from('invoices')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email), projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not update invoice', { cause: error })
    res.json({ invoice: normalizeInvoice(data) })
  } catch (err) {
    next(err)
  }
})

router.post('/invoices/:id/send', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email), projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not update invoice status', { cause: error })

    const inv = normalizeInvoice(data)
    const clientEmail = data.clients?.email || req.body.clientEmail
    if (clientEmail) {
      const businessName = await getBusinessName(req.user.id)
      const portalUrl = req.body.portalUrl || `${process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app'}/portal/invoice?invoiceId=${inv.id}`
      email.sendInvoiceToClient({
        to: clientEmail,
        clientName: data.clients?.name,
        freelancerName: req.user.email,
        businessName,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        currency: inv.currency || '€',
        dueDate: inv.dueDate,
        invoiceUrl: portalUrl,
      }).catch(err => console.error('[email] invoice send failed:', err.message))
    }

    res.json({ invoice: inv })
  } catch (err) { next(err) }
})

router.post('/invoices/:id/paid', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email), projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not mark invoice paid', { cause: error })

    const inv = normalizeInvoice(data)
    // Notify freelancer
    email.sendInvoicePaid({
      to: req.user.email,
      freelancerName: req.user.email,
      clientName: data.clients?.name,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      currency: inv.currency || '€',
      dashboardUrl: `${process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app'}/app/invoices`,
    }).catch(err => console.error('[email] invoice paid notify failed:', err.message))

    // Send receipt to client
    const clientEmail = data.clients?.email
    if (clientEmail) {
      const businessName = await getBusinessName(req.user.id)
      email.sendPaymentReceipt({
        to: clientEmail,
        clientName: data.clients?.name,
        businessName,
        freelancerName: req.user.email,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        currency: inv.currency || '€',
        paidAt: inv.paidAt,
      }).catch(err => console.error('[email] receipt failed:', err.message))
    }

    res.json({ invoice: inv })
  } catch (err) {
    next(err)
  }
})

router.post('/invoices/:id/viewed', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('invoices')
      .update({ status: 'viewed', viewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email), projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not mark invoice viewed', { cause: error })
    res.json({ invoice: normalizeInvoice(data) })
  } catch (err) {
    next(err)
  }
})

router.delete('/invoices/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('invoices')
      .delete()
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)

    if (error) throw new HttpError(500, 'Could not delete invoice', { cause: error })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/tasks', requireUser, async (req, res, next) => {
  try {
    const tables = await tableStatus()
    if (!tables.tasks?.ok || !tables.workspaces?.ok) {
      throw new HttpError(409, 'Supabase task tables are not applied yet', { expose: true })
    }

    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('tasks')
      .select('*, projects(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw new HttpError(500, 'Could not load tasks', { cause: error })
    res.json({ tasks: (data || []).map(normalizeTask) })
  } catch (err) {
    next(err)
  }
})

router.post('/tasks', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const payload = taskPayload(req.body, req.user.id, workspaceId)
    const { data, error } = await getSupabaseAdmin()
      .from('tasks')
      .insert(payload)
      .select('*, projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not create task', { cause: error })
    res.status(201).json({ task: normalizeTask(data) })
  } catch (err) {
    next(err)
  }
})

router.patch('/tasks/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const taskId = String(req.params.id || '')
    const supabase = getSupabaseAdmin()
    const { data: existing, error: existingError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('owner_id', req.user.id)
      .maybeSingle()

    if (existingError) throw new HttpError(500, 'Could not load task', { cause: existingError })
    if (!existing) throw new HttpError(404, 'Task not found', { expose: true })

    const payload = taskPayload(req.body, req.user.id, existing.workspace_id, existing)
    delete payload.workspace_id
    delete payload.owner_id

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('owner_id', req.user.id)
      .select('*, projects(name)')
      .single()

    if (error) throw new HttpError(500, 'Could not update task', { cause: error })
    res.json({ task: normalizeTask(data) })
  } catch (err) {
    next(err)
  }
})

router.delete('/tasks/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('tasks')
      .delete()
      .eq('id', String(req.params.id || ''))
      .eq('owner_id', req.user.id)

    if (error) throw new HttpError(500, 'Could not delete task', { cause: error })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── PROPOSALS ────────────────────────────────────────────────────────────────

router.get('/proposals', requireUser, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('proposals')
      .select('*, client:clients(id,name,email)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    if (error) throw new HttpError(500, 'Could not list proposals', { cause: error })
    res.json({ proposals: data || [] })
  } catch (err) { next(err) }
})

router.post('/proposals', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { client_id, project_id, title, status, subtotal, discount, tax, total, content, valid_until } = req.body
    const { data, error } = await getSupabaseAdmin()
      .from('proposals')
      .insert({ workspace_id: workspaceId, owner_id: req.user.id, client_id, project_id: project_id || null, title, status: status || 'draft', subtotal: subtotal || 0, discount: discount || 0, tax: tax || 0, total: total || 0, content: content || null, valid_until: valid_until || null })
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not create proposal', { cause: error })
    res.status(201).json({ proposal: data })
  } catch (err) { next(err) }
})

// Send proposal to client by email
router.post('/proposals/:id/send', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('proposals')
      .update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email)')
      .single()
    if (error) throw new HttpError(500, 'Could not send proposal', { cause: error })

    const clientEmail = data.clients?.email || req.body.clientEmail
    if (clientEmail) {
      const businessName = await getBusinessName(req.user.id)
      const proposalUrl = req.body.proposalUrl || `${process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app'}/portal/proposal?proposalId=${data.id}`
      email.sendProposalToClient({
        to: clientEmail,
        clientName: data.clients?.name,
        freelancerName: req.user.email,
        businessName,
        proposalTitle: data.title,
        amount: data.total,
        currency: '€',
        expiryDate: data.valid_until,
        proposalUrl,
      }).catch(err => console.error('[email] proposal send failed:', err.message))
    }

    res.json({ proposal: data })
  } catch (err) { next(err) }
})

router.patch('/proposals/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const allowed = ['title', 'status', 'subtotal', 'discount', 'tax', 'total', 'content', 'valid_until', 'sent_at', 'viewed_at', 'responded_at', 'client_id', 'project_id']
    const prevStatus = req.body._prevStatus
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    updates.updated_at = new Date().toISOString()
    const { data, error } = await getSupabaseAdmin()
      .from('proposals')
      .update(updates)
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email)')
      .single()
    if (error) throw new HttpError(500, 'Could not update proposal', { cause: error })

    // Notify freelancer when client accepts or declines
    if (updates.status === 'accepted' && prevStatus !== 'accepted') {
      email.sendProposalAccepted({
        to: req.user.email,
        freelancerName: req.user.email,
        clientName: data.clients?.name,
        proposalTitle: data.title,
        dashboardUrl: `${process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app'}/app/proposals`,
      }).catch(err => console.error('[email] proposal accepted notify failed:', err.message))
    } else if (updates.status === 'declined' && prevStatus !== 'declined') {
      email.sendProposalDeclined({
        to: req.user.email,
        freelancerName: req.user.email,
        clientName: data.clients?.name,
        proposalTitle: data.title,
        dashboardUrl: `${process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app'}/app/proposals`,
      }).catch(err => console.error('[email] proposal declined notify failed:', err.message))
    }

    res.json({ proposal: data })
  } catch (err) { next(err) }
})

router.delete('/proposals/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('proposals')
      .delete()
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
    if (error) throw new HttpError(500, 'Could not delete proposal', { cause: error })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

router.get('/contracts', requireUser, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('contracts')
      .select('*, client:clients(id,name,email)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    if (error) throw new HttpError(500, 'Could not list contracts', { cause: error })
    res.json({ contracts: data || [] })
  } catch (err) { next(err) }
})

router.post('/contracts', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { client_id, proposal_id, title, status, content } = req.body
    const { data, error } = await getSupabaseAdmin()
      .from('contracts')
      .insert({ workspace_id: workspaceId, owner_id: req.user.id, client_id, proposal_id: proposal_id || null, title, status: status || 'draft', content: content || null })
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not create contract', { cause: error })
    res.status(201).json({ contract: data })
  } catch (err) { next(err) }
})

router.patch('/contracts/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const allowed = ['title', 'status', 'content', 'signed_at', 'signer_name', 'signer_ip', 'signed_pdf_path', 'client_id', 'proposal_id']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    updates.updated_at = new Date().toISOString()
    const { data, error } = await getSupabaseAdmin()
      .from('contracts')
      .update(updates)
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not update contract', { cause: error })
    res.json({ contract: data })
  } catch (err) { next(err) }
})

router.post('/contracts/:id/sign', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { signer_name, signer_ip } = req.body
    const { data, error } = await getSupabaseAdmin()
      .from('contracts')
      .update({ status: 'signed', signed_at: new Date().toISOString(), signer_name: signer_name || null, signer_ip: signer_ip || null, updated_at: new Date().toISOString() })
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
      .select('*, clients(name,email)')
      .single()
    if (error) throw new HttpError(500, 'Could not sign contract', { cause: error })

    // Notify freelancer
    email.sendContractSigned({
      to: req.user.email,
      freelancerName: req.user.email,
      clientName: data.clients?.name || signer_name,
      contractTitle: data.title,
      dashboardUrl: `${process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app'}/app/contracts`,
    }).catch(err => console.error('[email] contract signed notify failed:', err.message))

    res.json({ contract: data })
  } catch (err) { next(err) }
})

router.delete('/contracts/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('contracts')
      .delete()
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
    if (error) throw new HttpError(500, 'Could not delete contract', { cause: error })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── TIME ENTRIES ─────────────────────────────────────────────────────────────

router.get('/time', requireUser, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('time_entries')
      .select('*, project:projects(id,name)')
      .eq('workspace_id', workspaceId)
      .order('entry_date', { ascending: false })
    if (error) throw new HttpError(500, 'Could not list time entries', { cause: error })
    res.json({ entries: data || [] })
  } catch (err) { next(err) }
})

router.post('/time', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { project_id, task_id, description, entry_date, minutes, billable, hourly_rate } = req.body
    const { data, error } = await getSupabaseAdmin()
      .from('time_entries')
      .insert({ workspace_id: workspaceId, owner_id: req.user.id, project_id: project_id || null, task_id: task_id || null, description: description || null, entry_date: entry_date || new Date().toISOString().split('T')[0], minutes: minutes || 0, billable: billable !== false, hourly_rate: hourly_rate || null, invoiced: false })
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not create time entry', { cause: error })
    res.status(201).json({ entry: data })
  } catch (err) { next(err) }
})

router.patch('/time/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const allowed = ['project_id', 'task_id', 'description', 'entry_date', 'minutes', 'billable', 'hourly_rate', 'invoiced']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    updates.updated_at = new Date().toISOString()
    const { data, error } = await getSupabaseAdmin()
      .from('time_entries')
      .update(updates)
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not update time entry', { cause: error })
    res.json({ entry: data })
  } catch (err) { next(err) }
})

router.delete('/time/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('time_entries')
      .delete()
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
    if (error) throw new HttpError(500, 'Could not delete time entry', { cause: error })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── EXPENSES ─────────────────────────────────────────────────────────────────

router.get('/expenses', requireUser, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('expenses')
      .select('*, project:projects(id,name)')
      .eq('workspace_id', workspaceId)
      .order('expense_date', { ascending: false })
    if (error) throw new HttpError(500, 'Could not list expenses', { cause: error })
    res.json({ expenses: data || [] })
  } catch (err) { next(err) }
})

router.post('/expenses', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const workspaceId = await ensureWorkspace(req.user.id)
    const { project_id, category, merchant, amount, expense_date, reimbursable, billable, notes } = req.body
    const { data, error } = await getSupabaseAdmin()
      .from('expenses')
      .insert({ workspace_id: workspaceId, owner_id: req.user.id, project_id: project_id || null, category: category || 'other', merchant: merchant || null, amount: amount || 0, expense_date: expense_date || new Date().toISOString().split('T')[0], reimbursable: reimbursable === true, billable: billable === true, notes: notes || null })
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not create expense', { cause: error })
    res.status(201).json({ expense: data })
  } catch (err) { next(err) }
})

router.patch('/expenses/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const allowed = ['project_id', 'category', 'merchant', 'amount', 'expense_date', 'reimbursable', 'billable', 'notes', 'receipt_path']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    updates.updated_at = new Date().toISOString()
    const { data, error } = await getSupabaseAdmin()
      .from('expenses')
      .update(updates)
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
      .select()
      .single()
    if (error) throw new HttpError(500, 'Could not update expense', { cause: error })
    res.json({ expense: data })
  } catch (err) { next(err) }
})

router.delete('/expenses/:id', requireUser, dataWriteRateLimit, async (req, res, next) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('expenses')
      .delete()
      .eq('id', String(req.params.id))
      .eq('owner_id', req.user.id)
    if (error) throw new HttpError(500, 'Could not delete expense', { cause: error })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
