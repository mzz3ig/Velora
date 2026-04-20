import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Activity, Database, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function SectionLabel({ children }) {
  return <div className="label" style={{ marginBottom: 12, marginTop: 28 }}>{children}</div>
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  const load = async () => {
    setRefreshing(true)
    const { data: { user } } = await supabase.auth.getUser()
    setAdminEmail(user?.email || '')

    const { data: rows, error } = await supabase
      .from('velora_state')
      .select('user_id, store_key, updated_at')

    if (error) {
      setMetrics({ error: error.message })
      setLoading(false)
      setRefreshing(false)
      return
    }

    const distinctUsers = [...new Set(rows.map(r => r.user_id))]
    const storeKeys = [...new Set(rows.map(r => r.store_key))]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const dayAgo = new Date(Date.now() - 86400000).toISOString()
    const activeUsers7d = [...new Set(rows.filter(r => r.updated_at > weekAgo).map(r => r.user_id))].length
    const active24h = [...new Set(rows.filter(r => r.updated_at > dayAgo).map(r => r.user_id))].length
    const rowsPerUser = {}
    rows.forEach(r => { rowsPerUser[r.user_id] = (rowsPerUser[r.user_id] || 0) + 1 })
    const avgRows = distinctUsers.length > 0
      ? (Object.values(rowsPerUser).reduce((s, n) => s + n, 0) / distinctUsers.length).toFixed(1) : 0
    const latestActivity = [...rows].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8)

    setMetrics({ totalUsers: distinctUsers.length, totalStateRows: rows.length, storeKeys, activeUsers7d, active24h, avgRows, latestActivity })
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const mrr = metrics ? metrics.totalUsers * 22 : 0

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Shield size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Platform Overview</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Operator view — no user content accessed. Logged in as{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{adminEmail}</span>
          </p>
        </div>
        <button onClick={load} disabled={refreshing} className="btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading platform metrics…</div>
      ) : metrics?.error ? (
        <div className="badge badge-red" style={{ padding: '10px 16px', borderRadius: 8 }}>Error: {metrics.error}</div>
      ) : (<>
        <SectionLabel>Freelancer Accounts</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 4 }}>
          <StatCard icon={Users} label="Total Accounts" value={metrics.totalUsers} sub="registered freelancers" color="#47bfff" delay={0.03} />
          <StatCard icon={Activity} label="Active (7 days)" value={metrics.activeUsers7d} sub="updated data recently" color="#22c55e" delay={0.06} />
          <StatCard icon={Activity} label="Active (24h)" value={metrics.active24h} sub="activity today" color="#7e14ff" delay={0.09} />
          <StatCard icon={Database} label="State Rows" value={metrics.totalStateRows} sub={`avg ${metrics.avgRows} stores/user`} color="#f59e0b" delay={0.12} />
        </div>

        <SectionLabel>Revenue (projected @ €22/user avg)</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 4 }}>
          <StatCard icon={DollarSign} label="Projected MRR" value={`€${mrr.toLocaleString()}`} sub="based on user count" color="#22c55e" delay={0.03} />
          <StatCard icon={TrendingUp} label="Projected ARR" value={`€${(mrr * 12).toLocaleString()}`} sub="annualised" color="#22c55e" delay={0.06} />
          <StatCard icon={TrendingUp} label="Exit target" value="€1,044,000" sub="750 users × €29 × 4x" color="#f59e0b" delay={0.09} />
          <StatCard icon={Users} label="Target progress" value={`${metrics.totalUsers}/750`} sub={`${Math.round((metrics.totalUsers / 750) * 100)}% to goal`} color="#47bfff" delay={0.12} />
        </div>

        <SectionLabel>Store Coverage</SectionLabel>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="card" style={{ marginBottom: 0 }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Store keys present in <code style={{ color: 'var(--accent)', fontWeight: 600 }}>velora_state</code> — populated as users interact with the app.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {metrics.storeKeys.map(k => (
              <span key={k} className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{k}</span>
            ))}
            {metrics.storeKeys.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No stores yet</span>}
          </div>
        </motion.div>

        <SectionLabel>Recent Platform Activity</SectionLabel>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="panel-soft" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-light)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Store key · anonymised user_id · last updated — no content read
          </div>
          {metrics.latestActivity.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: '0.82rem' }}>No activity yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {['Store Key', 'User (anon)', 'Last Updated'].map(h => (
                    <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.latestActivity.map((row, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: i < metrics.latestActivity.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <td style={{ padding: '9px 16px', fontSize: '0.8rem', color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 600 }}>{row.store_key}</td>
                    <td style={{ padding: '9px 16px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{row.user_id.slice(0, 8)}…</td>
                    <td style={{ padding: '9px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(row.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </>)}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
