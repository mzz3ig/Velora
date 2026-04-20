import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, RefreshCw, EyeOff } from 'lucide-react'
import { adminStateRows } from '../../lib/api'

const KEY_COLORS = {
  'velora-clients': '#47bfff', 'velora-invoices': '#22c55e', 'velora-projects': '#7e14ff',
  'velora-tasks': '#f59e0b', 'velora-pipeline': '#6366f1', 'velora-time': '#06b6d4',
  'velora-expenses': '#f43f5e', 'velora-services': '#a78bfa', 'velora-files': '#34d399',
  'velora-messages': '#f87171', 'velora-forms': '#fb923c', 'velora-scheduling': '#e879f9',
  'velora-automations': '#fbbf24', 'velora-settings': '#94a3b8', 'velora-notifications': '#64748b',
}

export default function AdminData() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    try {
      const { rows } = await adminStateRows({ limit: 20000, order: 'desc' })
      setRows(rows || [])
    } catch {
      setRows([])
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
            <Database size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Database Inspector</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Raw rows from <code style={{ color: 'var(--accent)' }}>velora_state</code>. The <code style={{ color: '#f87171' }}>value</code> column is never fetched.
          </p>
        </div>
        <button onClick={load} disabled={refreshing} className="btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </motion.div>

      {/* Privacy notice */}
      <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', marginBottom: 22, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <EyeOff size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          The <strong>value</strong> column is excluded from this query. User clients, invoices, contracts, and business data are not accessible here.
        </span>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        <span className="badge badge-blue">{rows.length} total rows</span>
        <span className="badge badge-blue">{[...new Set(rows.map(r => r.user_id))].length} distinct users</span>
        <span className="badge badge-blue">{[...new Set(rows.map(r => r.store_key))].length} store key types</span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 20 }}>Loading…</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="panel-soft" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Row ID', 'User (anon)', 'Store Key', 'Last Updated', 'value'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No rows in velora_state</td></tr>
              ) : rows.map((row, i) => {
                const color = KEY_COLORS[row.store_key] || 'var(--accent)'
                return (
                  <tr key={`${row.user_id}:${row.store_key}`} className="table-row" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <td style={{ padding: '9px 16px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {(row.store_key || '').slice(0, 8)}
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{row.user_id.slice(0, 10)}…</td>
                    <td style={{ padding: '9px 16px' }}>
                      <span style={{ fontSize: '0.72rem', color, fontFamily: 'monospace', background: `${color}14`, padding: '3px 8px', borderRadius: 5, fontWeight: 600 }}>
                        {row.store_key}
                      </span>
                    </td>
                    <td style={{ padding: '9px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(row.updated_at).toLocaleString()}</td>
                    <td style={{ padding: '9px 16px', fontSize: '0.72rem', color: 'var(--border)', fontStyle: 'italic' }}>[redacted]</td>
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
