import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, X, FileText, Calendar } from 'lucide-react'
import { acceptPortalProposal } from '../../lib/portal'

export default function PortalProposal() {
  const { token, freelancer, client, portal, setPortal } = useOutletContext()
  const proposal = portal?.proposals?.[0]
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const items = proposal?.items || []
  const total = proposal?.total ?? items.reduce((s, i) => s + Number(i.subtotal ?? i.qty * i.price), 0)

  async function respond(decision) {
    if (!proposal) return
    setSubmitting(true)
    setError('')
    try {
      const next = await acceptPortalProposal(token, proposal.id, decision)
      if (next?.error) setError('Unable to update this proposal.')
      else setPortal(next)
    } catch (err) {
      setError(err.message || 'Unable to update this proposal.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!proposal) {
    return (
      <div style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Proposal</h1>
        <div className="card" style={{ padding: 28, color: 'var(--text-muted)' }}>
          No proposal has been shared in this portal yet.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Proposal</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>From {freelancer.name}</p>

      <div className="card" style={{ padding: '28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{proposal.project}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prepared for {client?.name || proposal.client}</div>
          </div>
          {proposal.expiry && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.775rem', color: '#ef4444' }}>
              <Calendar size={12} /> Valid until {proposal.expiry}
            </div>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Service', 'Qty', 'Unit price', 'Subtotal'].map(h => (
                <th key={h} style={{ padding: '8px 0', textAlign: h === 'Subtotal' ? 'right' : 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.service || item.name}</td>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.qty}</td>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>€{Number(item.price || 0).toLocaleString()}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>€{Number(item.subtotal ?? item.qty * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>€{total.toLocaleString()}</div>
          </div>
        </div>

        {proposal.notes && (
          <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            {proposal.notes}
          </div>
        )}
      </div>

      {error && <div className="badge badge-red" style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

      {/* Action */}
      {proposal.status === 'sent' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => respond('declined')} disabled={submitting}
            style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <X size={16} /> Decline
          </button>
          <button onClick={() => respond('accepted')} disabled={submitting}
            style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: freelancer.brand_color, cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CheckCircle2 size={18} /> {submitting ? 'Saving...' : 'Accept proposal'}
          </button>
        </div>
      )}

      {proposal.status === 'accepted' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card" style={{ padding: '24px', textAlign: 'center', border: '1px solid #22c55e40' }}>
          <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Proposal accepted!</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{freelancer.name} has been notified and will be in touch shortly.</div>
        </motion.div>
      )}

      {proposal.status === 'declined' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Proposal declined</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{freelancer.name} has been notified. You can reach out via messages if you'd like to discuss.</div>
        </motion.div>
      )}
    </div>
  )
}
