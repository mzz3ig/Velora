import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, Lock, Shield, ExternalLink, AlertCircle } from 'lucide-react'

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
  const items = invoice.items?.length ? invoice.items : [{ description: invoice.project || invoice.type || 'Services', amount: total }]
  const paid = invoice.status === 'paid'

  // Prefer Stripe Checkout URL, then legacy manual payment URL
  const paymentUrl = invoice.stripeCheckoutUrl || invoice.paymentUrl || invoice.payment_url

  const brandColor = freelancer?.brand_color || '#a98252'

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Invoice</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>From {freelancer?.name}</p>

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
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>€{Number(item.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(Number(invoice.discount) > 0 || Number(invoice.tax) > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            {Number(invoice.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Discount ({invoice.discount}%)</span>
                <span>-€{(Number(invoice.amount) * invoice.discount / 100).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.tax) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>IVA / VAT ({invoice.tax}%)</span>
                <span>+€{(discounted * invoice.tax / 100).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

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
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Thank you — your payment has been confirmed.</div>
        </motion.div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CreditCard size={18} color="var(--text-muted)" />
            <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>Pay now</span>
          </div>

          {paymentUrl ? (
            <>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Lock size={14} style={{ flexShrink: 0 }} />
                Secure payment powered by Stripe. You will be redirected to complete your payment safely.
              </div>

              <a href={paymentUrl} target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                  background: brandColor, color: 'white', fontWeight: 700, fontSize: '1rem',
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <ExternalLink size={15} /> Pay €{total.toFixed(2)}
              </a>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
              <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Payment link not yet attached to this invoice. Please message {freelancer?.name || 'the freelancer'} for payment instructions.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            <Shield size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Payments are securely processed by Stripe. Velora never stores card details.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
