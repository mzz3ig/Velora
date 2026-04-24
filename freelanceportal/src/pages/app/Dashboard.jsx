import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Briefcase, CreditCard, ArrowUpRight, Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useClientStore, useProjectStore, useInvoiceStore, useNotificationStore } from '../../store'

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: 0, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { clients } = useClientStore()
  const { projects } = useProjectStore()
  const { invoices } = useInvoiceStore()
  const { notifications } = useNotificationStore()
  const [currentTime] = useState(() => new Date())

  const activeClients = clients.filter(c => c.status === 'active').length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const pendingInvoices = invoices.filter(i => ['sent', 'overdue'].includes(i.status))
  const pendingTotal = pendingInvoices.reduce((s, i) => s + i.amount, 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthRevenue = invoices.filter(i => i.status === 'paid' && i.paid >= monthStart).reduce((s, i) => s + i.amount, 0)

  const projectsDueThisWeek = projects.filter(p => {
    if (!p.deadline) return false
    const diff = (new Date(p.deadline) - now) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length

  const recentActivity = notifications.slice(0, 5)

  const activityIcons = {
    contract: { icon: CheckCircle2, color: '#22c55e' },
    payment: { icon: CreditCard, color: '#a98252' },
    proposal: { icon: FileText, color: '#f59e0b' },
    client: { icon: Users, color: '#38bdf8' },
    overdue: { icon: AlertCircle, color: '#f87171' },
  }

  const displayProjects = projects.filter(p => p.status === 'active' || p.status === 'in_review').slice(0, 4)

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Good morning, Rodrigo</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{today} — Here's what's happening today.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/app/projects" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              <Plus size={15} /> New project
            </button>
          </Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 14,
          alignItems: 'center',
          padding: '13px 16px',
          borderRadius: 8,
          border: '1px solid rgba(245,158,11,0.28)',
          background: 'rgba(245,158,11,0.08)',
          marginBottom: 20,
        }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertCircle size={17} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800 }}>Setup incompleto visível</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Stripe, email, domínio, permissões e testes precisam de validação antes de produção.
            </div>
          </div>
        </div>
        <Link to="/app/setup" className="btn-ghost" style={{ padding: '7px 12px', fontSize: '0.8rem', textDecoration: 'none', flexShrink: 0 }}>
          Ver status
        </Link>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="stats-grid">
        <StatCard icon={TrendingUp} label="Revenue this month" value={`€${monthRevenue.toLocaleString()}`} sub={`${invoices.filter(i=>i.status==='paid').length} paid invoices`} color="#22c55e" delay={0} />
        <StatCard icon={CreditCard} label="Pending invoices" value={`€${pendingTotal.toLocaleString()}`} sub={`${pendingInvoices.length} outstanding${overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}`} color="#f59e0b" delay={0.07} />
        <StatCard icon={Briefcase} label="Active projects" value={activeProjects} sub={`${projectsDueThisWeek} due this week`} color="#a98252" delay={0.14} />
        <StatCard icon={Users} label="Total clients" value={activeClients} sub={`${clients.filter(c=>c.status==='active').length} active`} color="#38bdf8" delay={0.21} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="dashboard-bottom">
        {/* Active Projects */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Projects</h2>
            <Link to="/app/projects" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#a98252', fontWeight: 500 }}>View all <ArrowUpRight size={13} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayProjects.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 20 }}>No active projects. <Link to="/app/projects" style={{ color: 'var(--accent)' }}>Create one</Link></div>
            ) : displayProjects.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{p.client}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: p.status === 'in_review' ? 'rgba(245,158,11,0.15)' : 'rgba(169,130,82,0.15)', color: p.status === 'in_review' ? '#fbbf24' : 'var(--accent)' }}>
                      {p.status === 'in_review' ? 'In Review' : 'In Progress'}
                    </span>
                    {p.deadline && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due {p.deadline}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 5, background: 'var(--border-light)', borderRadius: 999 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${p.clientColor || '#a98252'}, ${p.clientColor || '#a98252'}99)` }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Activity Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentActivity.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 20 }}>No activity yet.</div>
            ) : recentActivity.map((item, i) => {
              const meta = activityIcons[item.type] || activityIcons.client
              const elapsed = Math.round((currentTime - new Date(item.time)) / 60000)
              const timeStr = elapsed < 60 ? `${elapsed}m ago` : elapsed < 1440 ? `${Math.round(elapsed/60)}h ago` : `${Math.round(elapsed/1440)}d ago`
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < recentActivity.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <meta.icon size={13} color={meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.text}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Clock size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeStr}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr !important; } .dashboard-bottom { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
