import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, RefreshCw } from 'lucide-react'
import { adminStateRows } from '../../lib/api'
import VeloraLoader from '../../components/ui/VeloraLoader'

const KNOWN_STORES = [
  { key: 'velora-clients', label: 'Clients', color: '#47bfff' },
  { key: 'velora-projects', label: 'Projects', color: '#7e14ff' },
  { key: 'velora-invoices', label: 'Invoices', color: '#22c55e' },
  { key: 'velora-tasks', label: 'Tasks', color: '#f59e0b' },
  { key: 'velora-time', label: 'Time Entries', color: '#06b6d4' },
  { key: 'velora-pipeline', label: 'Pipeline', color: '#6366f1' },
  { key: 'velora-expenses', label: 'Expenses', color: '#f43f5e' },
  { key: 'velora-services', label: 'Services', color: '#a78bfa' },
  { key: 'velora-files', label: 'Files', color: '#34d399' },
  { key: 'velora-messages', label: 'Messages', color: '#f87171' },
  { key: 'velora-forms', label: 'Forms', color: '#fb923c' },
  { key: 'velora-scheduling', label: 'Scheduling', color: '#e879f9' },
  { key: 'velora-automations', label: 'Automations', color: '#fbbf24' },
  { key: 'velora-settings', label: 'Settings', color: '#94a3b8' },
  { key: 'velora-notifications', label: 'Notifications', color: '#64748b' },
]

export default function AdminStores() {
  const [storeCounts, setStoreCounts] = useState({ counts: {}, activeCounts: {} })
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)

    try {
      const { rows } = await adminStateRows({ limit: 20000, order: 'desc' })
      const counts = {}
      const activeCounts = {}
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

      rows.forEach((row) => {
        counts[row.store_key] = (counts[row.store_key] || 0) + 1
        if (row.updated_at > weekAgo) activeCounts[row.store_key] = (activeCounts[row.store_key] || 0) + 1
      })

      setStoreCounts({ counts, activeCounts })
      setTotalUsers([...new Set(rows.map((row) => row.user_id))].length)
    } catch {
      setStoreCounts({ counts: {}, activeCounts: {} })
      setTotalUsers(0)
    }

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Layers size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Store Adoption</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Feature usage by store key presence. No user content is read.</p>
        </div>
        <button onClick={load} disabled={refreshing} className="btn-secondary btn-sm">
          {refreshing ? <VeloraLoader size={12} label={null} words={['.', '..', '...', '....', '.']} /> : <RefreshCw size={13} />}
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div style={{ padding: 20 }}>
          <VeloraLoader size={15} words={['stores', 'features', 'usage', 'adoption', 'stores']} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {KNOWN_STORES.map((store, index) => {
            const count = storeCounts.counts[store.key] || 0
            const activeCount = storeCounts.activeCounts[store.key] || 0
            const adoptionPct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0

            return (
              <motion.div key={store.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: store.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{store.label}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{store.key}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: store.color }}>{count}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>users</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22c55e' }}>{activeCount}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>active 7d</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{adoptionPct}%</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>adoption</div>
                  </div>
                </div>

                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 999 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${adoptionPct}%` }}
                    transition={{ duration: 0.7, delay: index * 0.03, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 999, background: store.color }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
