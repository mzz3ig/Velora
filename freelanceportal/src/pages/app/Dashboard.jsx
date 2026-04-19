import { motion } from 'framer-motion'
import {
  TrendingUp, Users, Briefcase, CreditCard, Bell,
  ArrowUpRight, Plus, FileText, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600,
          background: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: 999 }}>
          +12%
        </span>
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: 0, color: 'var(--text-primary)' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

const activity = [
  { icon: CheckCircle2, color: '#22c55e', text: 'Contract signed by Acme Co.', time: '2 min ago', type: 'contract' },
  { icon: CreditCard, color: '#0071e3', text: 'Payment received - €850 from Sara Johnson', time: '1 hour ago', type: 'payment' },
  { icon: FileText, color: '#f59e0b', text: 'Proposal viewed by Webflow Agency', time: '3 hours ago', type: 'proposal' },
  { icon: Users, color: '#38bdf8', text: 'New client added - Lucas Müller', time: '5 hours ago', type: 'client' },
  { icon: AlertCircle, color: '#f87171', text: 'Invoice overdue - Markus GmbH (€1,200)', time: '1 day ago', type: 'overdue' },
]

const projects = [
  { name: 'Webflow Redesign', client: 'Acme Co.', status: 'In Progress', progress: 65, due: 'Apr 28', color: '#0071e3' },
  { name: 'Brand Identity', client: 'Sara Johnson', status: 'In Review', progress: 90, due: 'Apr 22', color: '#f59e0b' },
  { name: 'Mobile App UI', client: 'TechStart', status: 'In Progress', progress: 30, due: 'May 10', color: '#22c55e' },
  { name: 'E-commerce Site', client: 'Boutique XO', status: 'In Progress', progress: 50, due: 'May 5', color: '#2997ff' },
]

export default function Dashboard() {
  return (
    <div style={{ padding: '32px', maxWidth: 1100 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>
            Good morning, Rodrigo
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Thursday, April 16 - Here's what's happening today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative',
            backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Bell size={16} />
            <div style={{
              position: 'absolute', top: 8, right: 8, width: 7, height: 7,
              borderRadius: '50%', background: '#f87171',
              border: '1px solid var(--surface)',
            }} />
          </button>
          <Link to="/app/proposals" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              <Plus size={15} /> New project
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28,
      }} className="stats-grid">
        <StatCard icon={TrendingUp} label="Revenue this month" value="€4,200" sub="↑ €800 from last month" color="#22c55e" delay={0} />
        <StatCard icon={CreditCard} label="Pending invoices" value="€3,100" sub="4 invoices outstanding" color="#f59e0b" delay={0.07} />
        <StatCard icon={Briefcase} label="Active projects" value="8" sub="2 due this week" color="#0071e3" delay={0.14} />
        <StatCard icon={Users} label="Total clients" value="24" sub="3 new this month" color="#38bdf8" delay={0.21} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="dashboard-bottom">
        {/* Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Projects</h2>
            <Link to="/app/projects" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#0071e3', fontWeight: 500 }}>
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {projects.map(p => (
              <div key={p.name} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '14px 16px',
                backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{p.client}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                      background: p.status === 'In Review' ? 'rgba(245,158,11,0.15)' : 'rgba(0,113,227,0.15)',
                      color: p.status === 'In Review' ? '#fbbf24' : 'var(--accent)',
                    }}>{p.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due {p.due}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 5, background: 'var(--border-light)', borderRadius: 999 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${p.color}, ${p.color}99)` }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                    {p.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card"
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Activity Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 0',
                borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `${item.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>
                  <item.icon size={13} color={item.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Clock size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .dashboard-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
