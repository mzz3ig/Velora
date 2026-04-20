import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, FileText, CreditCard, FolderOpen, MessageSquare } from 'lucide-react'

export default function PortalOverview() {
  const { freelancer, client, project, portal } = useOutletContext()
  const proposals = portal?.proposals || []
  const contracts = portal?.contracts || []
  const invoices = portal?.invoices || []
  const files = portal?.files || []
  const tasks = portal?.tasks || []

  const proposal = proposals[0]
  const contract = contracts[0]
  const invoice = invoices[0]
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const projectProgress = Number(project?.progress || 0)

  const STEPS = [
    { icon: FileText, label: 'Proposal', status: proposal?.status === 'accepted' ? 'done' : proposal ? 'active' : 'pending', desc: proposal ? `${proposal.status || 'sent'}${proposal.responded_at ? ` on ${new Date(proposal.responded_at).toLocaleDateString()}` : ''}` : 'Not shared yet' },
    { icon: CheckCircle2, label: 'Contract', status: contract?.status === 'signed' ? 'done' : contract ? 'active' : 'pending', desc: contract ? `${contract.status || 'sent'}${contract.signed_at ? ` on ${new Date(contract.signed_at).toLocaleDateString()}` : ''}` : 'Not shared yet' },
    { icon: CreditCard, label: 'Payments', status: paidInvoices.length > 0 ? 'done' : invoice ? 'active' : 'pending', desc: invoice ? `${paidInvoices.length}/${invoices.length} paid` : 'No invoice shared' },
    { icon: Clock, label: 'Work in progress', status: projectProgress >= 100 ? 'done' : projectProgress > 0 ? 'active' : 'pending', desc: project ? `${projectProgress}% complete` : 'No project connected' },
    { icon: FolderOpen, label: 'Files', status: files.length > 0 ? 'active' : 'pending', desc: `${files.length} shared file${files.length === 1 ? '' : 's'}` },
    { icon: MessageSquare, label: 'Visible tasks', status: tasks.length > 0 ? 'active' : 'pending', desc: `${tasks.length} client-visible task${tasks.length === 1 ? '' : 's'}` },
  ]

  return (
    <div style={{ maxWidth: 720 }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Welcome{client?.name ? `, ${client.name}` : ''}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          {project?.name ? (
            <>Here is the status of your <strong style={{ color: 'var(--text-primary)' }}>{project.name}</strong> project with {freelancer.name}.</>
          ) : (
            <>Your shared client portal with {freelancer.name}.</>
          )}
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
          { label: contract ? 'Review contract' : 'No contract yet', icon: FileText, action: contract?.status || 'Waiting for freelancer', color: '#a98252' },
          { label: invoice ? 'Review invoice' : 'No invoice yet', icon: CreditCard, action: invoice ? `€${Number(invoice.amount || 0).toLocaleString()}` : 'Waiting for freelancer', color: '#22c55e' },
          { label: 'Send message', icon: MessageSquare, action: `Message ${freelancer.name}`, color: '#f59e0b' },
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
