import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, DollarSign, Clock, Users,
  Briefcase, ArrowUpRight, ArrowDownRight, Download,
  Calendar, Filter,
} from 'lucide-react'

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
const REVENUE_DATA = [3200, 4100, 3800, 5200, 4600, 4200]
const EXPENSES_DATA = [800, 950, 720, 1100, 890, 750]

const TOP_CLIENTS = [
  { name: 'Acme Co.', revenue: 8400, projects: 3, color: '#6366f1' },
  { name: 'Sara Johnson', revenue: 4200, projects: 2, color: '#8b5cf6' },
  { name: 'TechStart', revenue: 3600, projects: 1, color: '#22c55e' },
  { name: 'Boutique XO', revenue: 2800, projects: 2, color: '#f59e0b' },
  { name: 'Lucas Müller', revenue: 1200, projects: 1, color: '#ec4899' },
]

const TOP_SERVICES = [
  { name: 'Website Design', revenue: 7500, count: 5 },
  { name: 'Brand Identity', revenue: 4400, count: 2 },
  { name: 'Webflow Development', revenue: 3200, count: 4 },
  { name: 'Monthly Retainer', revenue: 2400, count: 4 },
  { name: 'Hourly Consulting', revenue: 1680, count: 14 },
]

const INVOICE_REPORT = [
  { id: 'INV-001', client: 'Acme Co.', amount: 1500, status: 'paid', date: '2026-04-01', project: 'Webflow Redesign' },
  { id: 'INV-002', client: 'Sara Johnson', amount: 850, status: 'paid', date: '2026-04-03', project: 'Brand Identity' },
  { id: 'INV-003', client: 'TechStart', amount: 2400, status: 'sent', date: '2026-04-10', project: 'Mobile App UI' },
  { id: 'INV-004', client: 'Boutique XO', amount: 600, status: 'overdue', date: '2026-03-28', project: 'E-commerce' },
  { id: 'INV-005', client: 'Acme Co.', amount: 1800, status: 'draft', date: '2026-04-17', project: 'Webflow Redesign' },
]

function MiniBar({ value, max, color }) {
  return (
    <div style={{ height: 5, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
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

export default function Reports() {
  const [period, setPeriod] = useState('6m')
  const [reportTab, setReportTab] = useState('overview') // overview | invoices | services | clients | time

  const totalRevenue = REVENUE_DATA.reduce((s, v) => s + v, 0)
  const totalExpenses = EXPENSES_DATA.reduce((s, v) => s + v, 0)
  const netProfit = totalRevenue - totalExpenses
  const margin = Math.round((netProfit / totalRevenue) * 100)
  const maxRevenue = Math.max(...REVENUE_DATA)
  const maxBar = maxRevenue + 200

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
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Report tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[['overview', 'Overview'], ['invoices', 'Invoices'], ['services', 'By service'], ['clients', 'By client'], ['time', 'Time & utilisation']].map(([id, label]) => (
          <button key={id} onClick={() => setReportTab(id)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            color: reportTab === id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: reportTab === id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {/* Overview */}
      {reportTab === 'overview' && (
        <div>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total revenue', value: `€${totalRevenue.toLocaleString()}`, change: +12, icon: TrendingUp, color: '#22c55e' },
              { label: 'Net profit', value: `€${netProfit.toLocaleString()}`, change: +8, icon: DollarSign, color: '#6366f1' },
              { label: 'Profit margin', value: `${margin}%`, change: +2, icon: BarChart2, color: '#8b5cf6' },
              { label: 'Expenses', value: `€${totalExpenses.toLocaleString()}`, change: -5, icon: ArrowDownRight, color: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon size={18} color={kpi.color} />
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 99, background: kpi.change > 0 ? '#22c55e20' : '#ef444420', color: kpi.change > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Revenue vs Expenses</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.775rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6366f1' }} /> Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }} /> Expenses
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180 }}>
              {MONTHS.map((month, i) => (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', width: '100%', height: 150 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(REVENUE_DATA[i] / maxBar) * 150}px` }}
                      transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                      style={{ flex: 1, background: '#6366f1', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(EXPENSES_DATA[i] / maxBar) * 150}px` }}
                      transition={{ duration: 0.5, delay: i * 0.06 + 0.1, ease: 'easeOut' }}
                      style={{ flex: 1, background: '#ef444460', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top clients + services */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Top clients</h3>
              {TOP_CLIENTS.map(client => (
                <div key={client.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{client.name}</span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>€{client.revenue.toLocaleString()}</span>
                  </div>
                  <MiniBar value={client.revenue} max={TOP_CLIENTS[0].revenue} color={client.color} />
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Revenue by service</h3>
              {TOP_SERVICES.map(svc => (
                <div key={svc.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{svc.name}</span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>€{svc.revenue.toLocaleString()}</span>
                  </div>
                  <MiniBar value={svc.revenue} max={TOP_SERVICES[0].revenue} color="#8b5cf6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices report */}
      {reportTab === 'invoices' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total invoiced', value: `€${INVOICE_REPORT.reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#6366f1' },
              { label: 'Collected', value: `€${INVOICE_REPORT.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#22c55e' },
              { label: 'Outstanding', value: `€${INVOICE_REPORT.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#f59e0b' },
              { label: 'Overdue', value: `€${INVOICE_REPORT.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0).toLocaleString()}`, color: '#ef4444' },
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
                  {['Invoice', 'Project', 'Client', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVOICE_REPORT.map(inv => {
                  const s = STATUS_STYLES[inv.status]
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.project}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.client}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>€{inv.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>{inv.date}</td>
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

      {/* Services report */}
      {reportTab === 'services' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Revenue by service</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Service', 'Projects', 'Revenue', 'Share'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_SERVICES.map(svc => {
                const pct = Math.round((svc.revenue / TOP_SERVICES.reduce((s, x) => s + x.revenue, 0)) * 100)
                return (
                  <tr key={svc.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{svc.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{svc.count}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>€{svc.revenue.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border-light)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: 3, background: '#8b5cf6' }} />
                        </div>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Clients report */}
      {reportTab === 'clients' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Client profitability</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Projects', 'Total revenue', 'Share'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_CLIENTS.map(client => {
                const pct = Math.round((client.revenue / TOP_CLIENTS.reduce((s, x) => s + x.revenue, 0)) * 100)
                return (
                  <tr key={client.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: client.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: client.color }}>
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
                            style={{ height: '100%', borderRadius: 3, background: client.color }} />
                        </div>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Time & utilisation */}
      {reportTab === 'time' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total hours', value: '138.5h', color: '#6366f1' },
              { label: 'Billable hours', value: '112h', color: '#22c55e' },
              { label: 'Utilisation rate', value: '81%', color: '#f59e0b' },
              { label: 'Avg hourly rate', value: '€89', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Hours by project</h3>
            {[
              { name: 'Webflow Redesign', hours: 42, billable: 38 },
              { name: 'Brand Identity', hours: 28, billable: 28 },
              { name: 'Mobile App UI', hours: 35, billable: 26 },
              { name: 'E-commerce Site', hours: 33.5, billable: 20 },
            ].map(p => (
              <div key={p.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.name}</span>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{p.billable}h billable / {p.hours}h total</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--border-light)', position: 'relative' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.hours / 45) * 100}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 4, background: '#6366f140', position: 'absolute' }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.billable / 45) * 100}%` }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 4, background: '#6366f1', position: 'absolute' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
