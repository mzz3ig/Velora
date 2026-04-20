import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, Lock, Shield, ExternalLink } from 'lucide-react'

export default function PortalInvoice() {
  const { freelancer, portal } = useOutletContext()
  const invoice = portal?.invoices?.[0]

  if (!invoice) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Invoice</h1>
        <div className="card" style={{ padding: 28, color: 'var(--text-muted)' }}>
          No invoice has been shared in this portal yet.
        </div>
      </div>
    )
  }

  const discounted = Number(invoice.amount || 0) * (1 - Number(invoice.discount || 0) / 100)
  const total = discounted * (1 + Number(invoice.tax || 0) / 100)
  const items = invoice.items?.length ? invoice.items : [{ description: invoice.project || invoice.type || 'Invoice', amount: total }]
  const paid = invoice.status === 'paid'
  const paymentUrl = invoice.paymentUrl || invoice.payment_url || invoice.stripePaymentUrl

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Invoice</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>From {freelancer.name}</p>

      <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Invoice</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{invoice.id}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Due date</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{invoice.due || '—'}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Description</th>
              <th style={{ padding: '8px 0', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.description}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>€{Number(item.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Total due</span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>€{total.toFixed(2)}</span>
        </div>
      </div>

      {paid ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>Payment received!</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Receipt sent to your email</div>
        </motion.div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CreditCard size={18} color="var(--text-muted)" />
            <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>Pay now</span>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <Lock size={14} />
              {paymentUrl ? 'You will be sent to the secure payment page configured by the freelancer.' : 'This invoice does not have a payment link connected yet. Message the freelancer for payment instructions.'}
            </div>
          </div>

          <button onClick={() => paymentUrl && window.open(paymentUrl, '_blank', 'noopener,noreferrer')} disabled={!paymentUrl}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: paymentUrl ? 'pointer' : 'not-allowed',
              background: freelancer.brand_color, color: 'white', fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: paymentUrl ? 1 : 0.5, transition: 'opacity 0.2s',
            }}>
            {paymentUrl ? <><ExternalLink size={15} /> Pay €{total.toFixed(2)}</> : 'Payment link not connected'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            <Shield size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Payments are processed outside Velora through the freelancer's connected payment link.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
