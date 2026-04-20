import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, Loader, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function ActionCard({ title, description, buttonLabel, onRun, delay }) {
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  const run = async () => {
    setState('running')
    setResult(null)
    try {
      const msg = await onRun()
      setResult({ ok: true, msg: msg || 'Done' })
    } catch (error) {
      setResult({ ok: false, msg: error.message })
    }
    setState('idle')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card">
      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{description}</div>
      <button onClick={run} disabled={state === 'running'} className="btn-secondary btn-sm">
        {state === 'running'
          ? <><Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> Running...</>
          : <><Zap size={12} /> {buttonLabel}</>}
      </button>
      {result && (
        <div className={`badge ${result.ok ? 'badge-green' : 'badge-red'}`} style={{ marginTop: 12, padding: '7px 10px' }}>
          {result.ok ? <Check size={12} /> : 'x'} {result.msg}
        </div>
      )}
    </motion.div>
  )
}

export default function AdminActions() {
  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw new Error(error.message)
    return `Authenticated as ${data.user.email} (${data.user.id.slice(0, 8)}...)`
  }

  const checkSupabase = async () => {
    const startedAt = Date.now()
    const { data, error } = await supabase.from('velora_state').select('user_id, store_key, updated_at').limit(5)
    if (error) throw new Error(error.message)
    return `Supabase responded in ${Date.now() - startedAt}ms - ${data.length} rows sampled`
  }

  const countPlatformRows = async () => {
    const { data, error } = await supabase.from('velora_state').select('user_id, store_key, updated_at')
    if (error) throw new Error(error.message)
    const users = [...new Set(data.map((row) => row.user_id))].length
    const stores = [...new Set(data.map((row) => row.store_key))].length
    return `${data.length} total rows · ${users} distinct users · ${stores} store key types`
  }

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw new Error(error.message)
    return `Session refreshed - expires ${new Date(data.session.expires_at * 1000).toLocaleString()}`
  }

  const exportPlatformMetadata = async () => {
    const { data, error } = await supabase
      .from('velora_state')
      .select('user_id, store_key, updated_at')
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)

    const users = [...new Set(data.map((row) => row.user_id))]
    const storeCount = {}
    data.forEach((row) => { storeCount[row.store_key] = (storeCount[row.store_key] || 0) + 1 })

    const report = {
      exportedAt: new Date().toISOString(),
      platform: 'Velora',
      summary: { totalRows: data.length, totalUsers: users.length, storeKeyBreakdown: storeCount },
      rows: data.map((row) => ({ user_id: row.user_id, store_key: row.store_key, updated_at: row.updated_at })),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `velora-platform-metadata-${new Date().toISOString().split('T')[0]}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    return 'Platform metadata exported. No user content included.'
  }

  const testSupabaseLatency = async () => {
    const times = []
    for (let i = 0; i < 5; i += 1) {
      const startedAt = Date.now()
      await supabase.from('velora_state').select('user_id').limit(1)
      times.push(Date.now() - startedAt)
    }
    const avg = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length)
    return `5 pings: avg ${avg}ms · min ${Math.min(...times)}ms · max ${Math.max(...times)}ms`
  }

  const actions = [
    { title: 'Verify Admin Session', description: 'Confirms your admin auth session and returns the authenticated email and user ID.', buttonLabel: 'Check session', onRun: checkAuth, delay: 0.04 },
    { title: 'Test Supabase Connection', description: 'Queries velora_state for metadata rows and measures response time.', buttonLabel: 'Run test query', onRun: checkSupabase, delay: 0.07 },
    { title: 'Count Platform Rows', description: 'Returns row count, distinct user count, and store key count across the platform.', buttonLabel: 'Count rows', onRun: countPlatformRows, delay: 0.10 },
    { title: 'Measure Supabase Latency', description: 'Runs 5 sequential metadata pings to Supabase.', buttonLabel: 'Run latency test', onRun: testSupabaseLatency, delay: 0.13 },
    { title: 'Refresh Admin Session', description: 'Forces a Supabase auth token refresh for the admin account.', buttonLabel: 'Refresh token', onRun: refreshSession, delay: 0.16 },
    { title: 'Export Platform Metadata', description: 'Downloads a JSON report with row counts and store breakdown. No value column.', buttonLabel: 'Download report', onRun: exportPlatformMetadata, delay: 0.19 },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Download size={22} color="var(--accent)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Platform Actions</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Operational tools for metadata-only platform maintenance.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {actions.map((action) => <ActionCard key={action.title} {...action} />)}
      </div>
    </div>
  )
}
