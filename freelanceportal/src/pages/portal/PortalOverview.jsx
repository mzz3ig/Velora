import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, FileText, CreditCard, FolderOpen, MessageSquare } from 'lucide-react'

export default function PortalOverview() {
  const { freelancer, client, project } = useOutletContext()

  const STEPS = [
    { icon: FileText, label: 'Proposal', status: 'done', desc: 'Accepted on Apr 5' },
    { icon: CheckCircle2, label: 'Contract', status: 'done', desc: 'Signed on Apr 7' },
    { icon: CreditCard, label: 'Deposit', status: 'done', desc: 'Paid €1,675' },
    { icon: Clock, label: 'Work in progress', status: 'active', desc: '65% complete' },
    { icon: FolderOpen, label: 'Delivery', status: 'pending', desc: 'Est. Apr 28' },
    { icon: CreditCard, label: 'Final invoice', status: 'pending', desc: 'Due on delivery' },
  ]

  return (
    <div style={{ maxWidth: 720 }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Welcome, {client.contact} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          Here's the status of your <strong style={{ color: 'var(--text-primary)' }}>{project.name}</strong> project with {freelancer.name}.
        </p>
      </motion.div>

      {/* Progress steps */}
      <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>
          Project progress
        </h2>
        <div style={{ position: 'relative' }}>
          {STEPS.map((step, i) => (
            <motion.div key={step.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < STEPS.length - 1 ? 20 : 0, position: 'relative' }}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', left: 15, top: 32, width: 2, height: 20, background: step.status === 'done' ? '#22c55e' : 'var(--border)' }} />
              )}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: step.status === 'done' ? '#22c55e20' : step.status === 'active' ? '#a9825220' : 'var(--bg-secondary)',
                border: `2px solid ${step.status === 'done' ? '#22c55e' : step.status === 'active' ? '#a98252' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <step.icon size={14} color={step.status === 'done' ? '#22c55e' : step.status === 'active' ? '#a98252' : 'var(--text-muted)'} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{step.label}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Download contract', icon: FileText, action: 'Contract PDF (Phase 1)', color: '#a98252' },
          { label: 'Pay invoice', icon: CreditCard, action: 'Stripe payment — Phase 1', color: '#22c55e' },
          { label: 'Send message', icon: MessageSquare, action: 'Message freelancer', color: '#f59e0b' },
        ].map(item => (
          <motion.div key={item.label} whileHover={{ y: -2 }} className="card"
            style={{ padding: '18px', textAlign: 'center', cursor: 'pointer', borderTop: `3px solid ${item.color}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.action}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
