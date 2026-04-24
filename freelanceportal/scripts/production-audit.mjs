import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const repo = resolve(root, '..')

function read(path) {
  return readFileSync(resolve(repo, path), 'utf8')
}

function assertIncludes(file, needle, label) {
  const content = read(file)
  if (!content.includes(needle)) {
    throw new Error(`${label}: expected ${file} to include ${needle}`)
  }
}

const requiredAppRoutes = [
  '<Route path="setup" element={<SetupStatus />} />',
]

const requiredSupabaseTables = [
  'create table if not exists public.workspaces',
  'create table if not exists public.clients',
  'create table if not exists public.projects',
  'create table if not exists public.proposals',
  'create table if not exists public.contracts',
  'create table if not exists public.invoices',
  'create table if not exists public.invoice_items',
  'create table if not exists public.payments',
  'create table if not exists public.tasks',
  'create table if not exists public.time_entries',
  'create table if not exists public.expenses',
]

const requiredStatusLabels = [
  "status: 'missing'",
  "status: 'partial'",
  "status: 'dev'",
  "Stripe",
  "Supabase",
]

for (const route of requiredAppRoutes) {
  assertIncludes('freelanceportal/src/App.jsx', route, 'setup route')
}

assertIncludes('freelanceportal/src/components/layout/Sidebar.jsx', '/app/setup', 'setup nav link')
assertIncludes('freelanceportal/src/pages/app/Dashboard.jsx', '/app/setup', 'dashboard setup warning')
assertIncludes('freelanceportal/src/lib/api.js', 'getStripeDiagnostics', 'stripe diagnostics client')
assertIncludes('server/routes/stripe.js', "router.get('/diagnostics'", 'stripe diagnostics route')
assertIncludes('server/index.js', 'REQUIRED_DATA_TABLES', 'backend table diagnostics')
assertIncludes('server/index.js', "app.use('/data'", 'data router mounted')
assertIncludes('server/routes/data.js', "router.post('/migrate'", 'data migration route')
assertIncludes('server/routes/data.js', "router.get('/status'", 'data status route')
assertIncludes('server/routes/data.js', "router.get('/clients'", 'normalized clients list route')
assertIncludes('server/routes/data.js', "router.post('/clients'", 'normalized clients create route')
assertIncludes('server/routes/data.js', "router.get('/projects'", 'normalized projects list route')
assertIncludes('server/routes/data.js', "router.post('/projects'", 'normalized projects create route')
assertIncludes('server/routes/data.js', "router.get('/invoices'", 'normalized invoices list route')
assertIncludes('server/routes/data.js', "router.post('/invoices'", 'normalized invoices create route')
assertIncludes('server/routes/data.js', "router.get('/tasks'", 'normalized tasks list route')
assertIncludes('server/routes/data.js', "router.post('/tasks'", 'normalized tasks create route')
assertIncludes('freelanceportal/supabase/schema.sql', 'migrate_velora_state_to_tables', 'legacy state migration function')
assertIncludes('freelanceportal/src/lib/api.js', 'migrateDataToTables', 'frontend migration client')
assertIncludes('freelanceportal/src/lib/api.js', 'listClientsFromTables', 'frontend normalized clients client')
assertIncludes('freelanceportal/src/lib/api.js', 'listProjectsFromTables', 'frontend normalized projects client')
assertIncludes('freelanceportal/src/lib/api.js', 'listInvoicesFromTables', 'frontend normalized invoices client')
assertIncludes('freelanceportal/src/lib/api.js', 'listTasksFromTables', 'frontend normalized tasks client')
assertIncludes('freelanceportal/src/pages/app/Clients.jsx', 'Supabase tables', 'clients normalized data mode')
assertIncludes('freelanceportal/src/pages/app/Projects.jsx', 'Supabase tables', 'projects normalized data mode')
assertIncludes('freelanceportal/src/pages/app/Invoices.jsx', 'Supabase tables', 'invoices normalized data mode')
assertIncludes('freelanceportal/src/pages/app/Tasks.jsx', 'Supabase tables', 'tasks normalized data mode')
assertIncludes('freelanceportal/src/pages/app/SetupStatus.jsx', 'Migrar dados', 'setup migration UI')

for (const table of requiredSupabaseTables) {
  assertIncludes('freelanceportal/supabase/schema.sql', table, 'production schema')
}

for (const label of requiredStatusLabels) {
  assertIncludes('freelanceportal/src/lib/featureStatus.js', label, 'feature status catalog')
}

console.log('Production audit checks passed')
