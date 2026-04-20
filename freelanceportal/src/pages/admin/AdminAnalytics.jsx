import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, RefreshCw, Users, Activity, Database } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function Bar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 4 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 4, background: color }} />
      </div>
    </div>
  )
}

function Card({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Icon size={15} color="var(--accent)" />
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  )
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    const { data: rows, error } = await supabase
      .from('velora_state')
      .select('user_id, store_key, updated_at')

    if (error || !rows) {
      setData({ error: error?.message || 'Failed to load' })
      setLoading(false); setRefreshing(false)
      return
    }

    const users = [...new Set(rows.map(r => r.user_id))]
    const storeCount = {}
    rows.forEach(r => { storeCount[r.store_key] = (storeCount[r.store_key] || 0) + 1 })

    const rowsPerUser = {}
    rows.forEach(r => { rowsPerUser[r.user_id] = (rowsPerUser[r.user_id] || 0) + 1 })
    const rpuBuckets = { '1–5': 0, '6–10': 0, '11–15': 0, '16+': 0 }
    Object.values(rowsPerUser).forEach(n => {
      if (n <= 5) rpuBuckets['1–5']++
      else if (n <= 10) rpuBuckets['6–10']++
      else if (n <= 15) rpuBuckets['11–15']++
      else rpuBuckets['16+']++
    })

    const dayActivity = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    rows.forEach(r => { const d = dayNames[new Date(r.updated_at).getDay()]; dayActivity[d] = (dayActivity[d] || 0) + 1 })

    const hourActivity = {}
    rows.forEach(r => { const h = new Date(r.updated_at).getHours(); hourActivity[h] = (hourActivity[h] || 0) + 1 })

    const cohorts = {}
    users.forEach(uid => {
      const userRows = rows.filter(r => r.user_id === uid)
      const earliest = userRows.reduce((min, r) => r.updated_at < min ? r.updated_at : min, userRows[0].updated_at)
      const month = earliest.slice(0, 7)
      cohorts[month] = (cohorts[month] || 0) + 1
    })

    setData({ users, rows, storeCount, rpuBuckets, dayActivity, hourActivity, cohorts })
    setLoading(false); setRefreshing(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  if (loading) return <div style={{ padding: '32px', color: 'var(--text-muted)' }}>Loading analytics…</div>
  if (data?.error) return <div style={{ padding: '32px' }}><span className="badge badge-red">{data.error}</span></div>

  const maxStore = Math.max(...Object.values(data.storeCount), 1)
  const maxRpu = Math.max(...Object.values(data.rpuBuckets), 1)
  const maxDay = Math.max(...Object.values(data.dayActivity), 1)
  const maxCohort = Math.max(...Object.values(data.cohorts), 1)
  const maxHour = Math.max(...Object.values(data.hourActivity), 1)

  const palette = ['#47bfff', '#7e14ff', '#22c55e', '#f59e0b', '#f87171', '#34d399', '#fb923c', '#e879f9', '#94a3b8']

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BarChart3 size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Platform Analytics</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Aggregated, anonymised signals — no user content read.</p>
        </div>
        <button onClick={load} disabled={refreshing} className="btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card title="Store Key Usage (platform-wide)" icon={Database} delay={0.04}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>How many accounts have each store populated</p>
          {Object.entries(data.storeCount).sort((a, b) => b[1] - a[1]).map(([key, count], i) => (
            <Bar key={key} label={key} value={count} max={maxStore} color={palette[i % palette.length]} />
          ))}
          {!Object.keys(data.storeCount).length && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No data yet</p>}
        </Card>

        <Card title="Rows Per User Distribution" icon={Users} delay={0.07}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>How many stores each account has synced</p>
          {Object.entries(data.rpuBuckets).map(([bucket, count], i) => (
            <Bar key={bucket} label={bucket + ' stores'} value={count} max={maxRpu} color={palette[i]} />
          ))}
          {!data.users.length && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No users yet</p>}
        </Card>

        <Card title="Activity by Day of Week" icon={Activity} delay={0.10}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Store writes per day (all time)</p>
          {Object.entries(data.dayActivity).map(([day, count]) => (
            <Bar key={day} label={day} value={count} max={maxDay} color="var(--accent)" />
          ))}
        </Card>

        <Card title="User Cohorts by Month" icon={Users} delay={0.13}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>New accounts per month (by first-seen date)</p>
          {Object.entries(data.cohorts).sort().map(([month, count]) => (
            <Bar key={month} label={month} value={count} max={maxCohort} color="#22c55e" />
          ))}
          {!Object.keys(data.cohorts).length && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No cohort data yet</p>}
        </Card>
      </div>

      <Card title="Activity by Hour of Day (UTC)" icon={Activity} delay={0.16}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>Store writes by hour — when your users are most active</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 4 }}>
          {Array.from({ length: 24 }, (_, h) => {
            const count = data.hourActivity[h] || 0
            const pct = maxHour > 0 ? count / maxHour : 0
            return (
              <div key={h} style={{ textAlign: 'center' }}>
                <div style={{ height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{
                    width: '100%', borderRadius: '3px 3px 0 0',
                    height: `${Math.max(pct * 48, count > 0 ? 4 : 0)}px`,
                    background: pct > 0.7 ? 'var(--accent)' : pct > 0.35 ? 'var(--accent-hover)' : 'var(--border-light)',
                    transition: 'height 0.4s',
                  }} />
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{String(h).padStart(2, '0')}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
