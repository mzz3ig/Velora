import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle2, Clock, Database, Globe, RefreshCw, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function HealthRow({ label, status, detail, latency, delay }) {
  const tone = status === 'ok' ? '#22c55e' : status === 'error' ? '#f87171' : '#f59e0b'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="table-row"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid var(--border-light)' }}
    >
      <div style={{ flexShrink: 0 }}>
        {status === 'ok' && <CheckCircle2 size={16} color={tone} />}
        {status === 'error' && <XCircle size={16} color={tone} />}
        {status === 'loading' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: tone, animation: 'spin 0.8s linear infinite' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 700 }}>{label}</div>
        {detail && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2, overflowWrap: 'anywhere' }}>{detail}</div>}
      </div>
      {latency != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: tone, fontWeight: 700 }}>
          <Clock size={11} />
          {latency}ms
        </div>
      )}
    </motion.div>
  )
}

export default function AdminHealth() {
  const [checks, setChecks] = useState({
    supabaseAuth: { status: 'loading' },
    supabaseDb: { status: 'loading' },
    supabaseState: { status: 'loading' },
  })
  const [refreshing, setRefreshing] = useState(false)
  const [envVars, setEnvVars] = useState({})

  const runChecks = async () => {
    setRefreshing(true)
    setChecks({
      supabaseAuth: { status: 'loading' },
      supabaseDb: { status: 'loading' },
      supabaseState: { status: 'loading' },
    })

    const t0 = Date.now()
    try {
      const { data, error } = await supabase.auth.getUser()
      setChecks((current) => ({
        ...current,
        supabaseAuth: {
          status: error ? 'error' : 'ok',
          detail: error ? error.message : `Authenticated as ${data.user?.email}`,
          latency: Date.now() - t0,
        },
      }))
    } catch (error) {
      setChecks((current) => ({ ...current, supabaseAuth: { status: 'error', detail: error.message, latency: Date.now() - t0 } }))
    }

    const t1 = Date.now()
    try {
      const { error } = await supabase.from('velora_state').select('user_id').limit(1)
      setChecks((current) => ({
        ...current,
        supabaseDb: {
          status: error ? 'error' : 'ok',
          detail: error ? error.message : 'velora_state table reachable',
          latency: Date.now() - t1,
        },
      }))
    } catch (error) {
      setChecks((current) => ({ ...current, supabaseDb: { status: 'error', detail: error.message, latency: Date.now() - t1 } }))
    }

    const t2 = Date.now()
    try {
      const { data, error } = await supabase.from('velora_state').select('user_id, updated_at')
      setChecks((current) => ({
        ...current,
        supabaseState: {
          status: error ? 'error' : 'ok',
          detail: error ? error.message : `${data?.length || 0} state rows found`,
          latency: Date.now() - t2,
        },
      }))
    } catch (error) {
      setChecks((current) => ({ ...current, supabaseState: { status: 'error', detail: error.message, latency: Date.now() - t2 } }))
    }

    setEnvVars({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '(not set)',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***set***' : '(not set)',
      MODE: import.meta.env.MODE,
      DEV: String(import.meta.env.DEV),
      PROD: String(import.meta.env.PROD),
      BASE_URL: import.meta.env.BASE_URL,
    })

    setRefreshing(false)
  }

  useEffect(() => { runChecks() }, [])

  const allOk = Object.values(checks).every((check) => check.status === 'ok')
  const anyError = Object.values(checks).some((check) => check.status === 'error')
  const badgeClass = allOk ? 'badge-green' : anyError ? 'badge-red' : 'badge-yellow'
  const statusText = allOk ? 'All systems operational' : anyError ? 'Issues detected' : 'Checking...'

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Activity size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>System Health</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Live checks for admin auth, Supabase, and platform state access.</p>
        </div>
        <button onClick={runChecks} disabled={refreshing} className="btn-secondary btn-sm">
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          Re-run checks
        </button>
      </motion.div>

      <span className={`badge ${badgeClass}`} style={{ marginBottom: 18 }}>{statusText}</span>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel-soft" style={{ overflow: 'hidden', marginTop: 18, marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={14} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Supabase</span>
        </div>
        <HealthRow label="Auth service" {...checks.supabaseAuth} delay={0.05} />
        <HealthRow label="Database (velora_state)" {...checks.supabaseDb} delay={0.08} />
        <HealthRow label="State rows" {...checks.supabaseState} delay={0.11} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Globe size={14} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Environment Variables</span>
        </div>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: 220 }}>{key}</span>
            <span style={{ fontSize: '0.78rem', color: value === '(not set)' ? '#f87171' : 'var(--text-secondary)', fontFamily: 'monospace' }}>{value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
