import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, RefreshCw, Activity, Database } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    const { data: rows, error } = await supabase
      .from('velora_state')
      .select('user_id, store_key, updated_at')
      .order('updated_at', { ascending: false })

    if (!error && rows) {
      const byUser = {}
      const activeCutoff = Date.now() - 7 * 86400000
      rows.forEach(r => {
        if (!byUser[r.user_id]) byUser[r.user_id] = { user_id: r.user_id, stores: [], lastSeen: r.updated_at, firstSeen: r.updated_at }
        byUser[r.user_id].stores.push(r.store_key)
        if (r.updated_at > byUser[r.user_id].lastSeen) byUser[r.user_id].lastSeen = r.updated_at
        if (r.updated_at < byUser[r.user_id].firstSeen) byUser[r.user_id].firstSeen = r.updated_at
      })
      setUsers(Object.values(byUser)
        .map((user) => ({ ...user, active: new Date(user.lastSeen).getTime() > activeCutoff }))
        .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)))
    }
    setLoading(false); setRefreshing(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Users size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Freelancer Accounts</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Derived from <code style={{ color: 'var(--accent)' }}>velora_state</code> metadata only — no emails, names, or business data shown.
          </p>
        </div>
        <button onClick={load} disabled={refreshing} className="btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total accounts', value: users.length, color: '#47bfff', icon: Users },
          { label: 'Active (7 days)', value: users.filter(u => u.active).length, color: '#22c55e', icon: Activity },
          { label: 'Inactive (7d+)', value: users.filter(u => !u.active).length, color: 'var(--text-muted)', icon: Users },
          { label: 'Avg stores/user', value: users.length > 0 ? (users.reduce((s, u) => s + u.stores.length, 0) / users.length).toFixed(1) : 0, color: '#f59e0b', icon: Database },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={16} color={m.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 20 }}>Loading…</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="panel-soft" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['#', 'User ID (anon)', 'Stores synced', 'First seen', 'Last active', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No accounts yet</td></tr>
              ) : users.map((u, i) => {
                return (
                  <tr key={u.user_id} className="table-row" style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 600 }}>{u.user_id.slice(0, 12)}…</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {u.stores.map(s => (
                          <span key={s} className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '0.62rem' }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(u.firstSeen).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(u.lastSeen).toLocaleString()}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={u.active ? 'badge badge-green' : 'badge badge-gray'}>{u.active ? 'active' : 'inactive'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
