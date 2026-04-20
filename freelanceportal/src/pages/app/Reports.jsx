import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, DollarSign, Clock,
  ArrowDownRight, Download,
} from 'lucide-react'
import { useInvoiceStore, useExpenseStore, useClientStore, useTimeStore } from '../../store'

function MiniBar({ value, max, color }) {
  return (
    <div style={{ height: 5, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: 3, background: color }} />
    </div>
  )
}

const STATUS_STYLES = {
  paid: { bg: '#22c55e20', color: '#22c55e', label: 'Paid' },
  sent: { bg: '#f59e0b20', color: '#f59e0b', label: 'Sent' },
  overdue: { bg: '#ef444420', color: '#ef4444', label: 'Overdue' },
  draft: { bg: 'var(--border-light)', color: 'var(--text-muted)', label: 'Draft' },
}

function exportCSV(rows, filename) {
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { invoices } = useInvoiceStore()
  const { expenses } = useExpenseStore()
  const { clients } = useClientStore()
  const { entries } = useTimeStore()
  const [period, setPeriod] = useState('6m')
  const [reportTab, setReportTab] = useState('overview')

  const now = new Date()
  const monthsBack = period === '3m' ? 3 : period === '6m' ? 6 : 12
  // Build monthly revenue data
  const months = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ label: d.toLocaleString('en-GB', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() })
  }

  const revenueByMonth = months.map(m => {
    return invoices.filter(inv => {
      if (inv.status !== 'paid' || !inv.paid) return false
      const pd = new Date(inv.paid)
      return pd.getFullYear() === m.year && pd.getMonth() === m.month
    }).reduce((s, inv) => s + inv.amount, 0)
  })

  const expensesByMonth = months.map(m => {
    return expenses.filter(exp => {
      const d = new Date(exp.date)
      return d.getFullYear() === m.year && d.getMonth() === m.month
    }).reduce((s, exp) => s + exp.amount, 0)
  })

  const totalRevenue = revenueByMonth.reduce((s, v) => s + v, 0)
  const totalExpenses = expensesByMonth.reduce((s, v) => s + v, 0)
  const netProfit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0
  const maxBar = Math.max(...revenueByMonth, ...expensesByMonth, 100) + 200

  // Revenue by client
  const revenueByClient = clients.map(c => ({
    name: c.name, color: c.color,
    revenue: invoices.filter(inv => inv.clientId === c.id && inv.status === 'paid').reduce((s, inv) => s + inv.amount, 0),
    projects: [...new Set(invoices.filter(inv => inv.clientId === c.id).map(inv => inv.project))].length,
  })).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  // Time stats
  const totalHours = entries.reduce((s, e) => s + e.hours, 0)
  const billableHours = entries.filter(e => e.billable).reduce((s, e) => s + e.hours, 0)
  const utilRate = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0
  const avgRate = billableHours > 0 ? Math.round(totalRevenue / billableHours) : 0

  const hoursByProject = Object.entries(
    entries.reduce((acc, e) => { acc[e.project] = (acc[e.project] || 0) + e.hours; return acc }, {})
  ).map(([name, hours]) => ({
    name, hours,
    billable: entries.filter(e => e.project === name && e.billable).reduce((s, e) => s + e.hours, 0),
  })).sort((a, b) => b.hours - a.hours).slice(0, 5)

  const maxProjectHours = hoursByProject[0]?.hours || 1

  return (
    <div style={{ padding: '32px', maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Financial and operational insights</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['3m', '3M'], ['6m', '6M'], ['1y', '1Y']].map(([val, label]) => (
              <button key={val} onClick={() => setPeriod(val)} style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: period === val ? 'var(--accent)' : 'var(--surface)',
                color: period === val ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem',
              }}>{label}</button>
            ))}
          </div>
          <button onClick={() => exportCSV(invoices.map(i => ({ id: i.id, client: i.client, project: i.project, amount: i.amount, status: i.status, due: i.due, paid: i.paid || '' })), 'velora-invoices.csv')}
            className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[['overview', 'Overview'], ['invoices', 'Invoices'], ['clients', 'By client'], ['time', 'Time & utilisation']].map(([id, label]) => (
          <button key={id} onClick={() => setReportTab(id)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            color: reportTab === id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: reportTab === id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {reportTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total revenue', value: `€${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#22c55e' },
              { label: 'Net profit', value: `€${netProfit.toLocaleString()}`, icon: DollarSign, color: '#a98252' },
              { label: 'Profit margin', value: `${margin}%`, icon: BarChart2, color: '#8f6d43' },
              { label: 'Expenses', value: `€${totalExpenses.toLocaleString()}`, icon: ArrowDownRight, color: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon size={18} color={kpi.color} />
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Revenue vs Expenses</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.775rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#a98252' }} /> Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }} /> Expenses
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180 }}>
              {months.map((month, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', width: '100%', height: 150 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(revenueByMonth[i] / maxBar) * 150}px` }}
                      transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                      style={{ flex: 1, background: '#a98252', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(expensesByMonth[i] / maxBar) * 150}px` }}
                      transition={{ duration: 0.5, delay: i * 0.06 + 0.1, ease: 'easeOut' }}
                      style={{ flex: 1, background: '#ef444460', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{month.label}</span>
                </div>
              ))}
            </div>
          </div>

          {revenueByClient.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Top clients</h3>
              {revenueByClient.map(client => (
                <div key={client.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{client.name}</span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>€{client.revenue.toLocaleString()}</span>
                  </div>
                  <MiniBar value={client.revenue} max={revenueByClient[0].revenue} color={client.color || '#a98252'} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {reportTab === 'invoices' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total invoiced', value: `€${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#a98252' },
              { label: 'Collected', value: `€${invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#22c55e' },
              { label: 'Outstanding', value: `€${invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#f59e0b' },
              { label: 'Overdue', value: `€${invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Invoice', 'Project', 'Client', 'Amount', 'Due', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const s = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.project}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.client}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>€{inv.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>{inv.due}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'clients' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Client profitability</h3>
          {revenueByClient.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No paid invoices yet in this period.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Client', 'Projects', 'Total revenue', 'Share'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueByClient.map(client => {
                  const pct = totalRevenue > 0 ? Math.round((client.revenue / totalRevenue) * 100) : 0
                  return (
                    <tr key={client.name} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: (client.color || '#a98252') + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: client.color || '#a98252' }}>
                            {client.name[0]}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{client.projects}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>€{client.revenue.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border-light)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                              style={{ height: '100%', borderRadius: 3, background: client.color || '#a98252' }} />
                          </div>
                          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {reportTab === 'time' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total hours', value: `${totalHours.toFixed(1)}h`, color: '#a98252' },
              { label: 'Billable hours', value: `${billableHours.toFixed(1)}h`, color: '#22c55e' },
              { label: 'Utilisation rate', value: `${utilRate}%`, color: '#f59e0b' },
              { label: 'Avg hourly rate', value: `€${avgRate}`, color: '#8f6d43' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {hoursByProject.length > 0 && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Hours by project</h3>
              {hoursByProject.map(p => (
                <div key={p.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.name}</span>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{p.billable.toFixed(1)}h billable / {p.hours.toFixed(1)}h total</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border-light)', position: 'relative' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(p.hours / maxProjectHours) * 100}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 4, background: '#a9825240', position: 'absolute' }} />
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(p.billable / maxProjectHours) * 100}%` }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 4, background: '#a98252', position: 'absolute' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => exportCSV(entries.map(e => ({ date: e.date, project: e.project, client: e.client, task: e.task, hours: e.hours, billable: e.billable ? 'yes' : 'no', notes: e.notes || '' })), 'velora-time.csv')}
              className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
              <Download size={13} /> Export time entries
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
