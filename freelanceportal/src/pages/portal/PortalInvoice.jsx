import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle2, Lock, Shield, ExternalLink } from 'lucide-react'

export default function PortalInvoice() {
  const { freelancer } = useOutletContext()
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const invoice = {
    id: 'INV-001', amount: 1675, due: '2026-04-20', status: 'sent',
    items: [
      { description: 'Webflow Redesign — Deposit (50%)', amount: 1675 },
    ],
  }

  function handlePay() {
    setPaying(true)
    // In Phase 1: redirect to Stripe Checkout or open Stripe Payment Link
    // stripe.redirectToCheckout({ sessionId: 'cs_xxx' })
    setTimeout(() => { setPaying(false); setPaid(true) }, 2000)
  }

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
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{invoice.due}</div>
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
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.description}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>€{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Total due</span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>€{invoice.amount.toLocaleString()}</span>
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

          {/* Stripe placeholder */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '16px', marginBottom: 16, opacity: 0.6 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Card number</div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, height: 40, display: 'flex', alignItems: 'center', paddingLeft: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              •••• •••• •••• ••••
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              {['MM / YY', 'CVC'].map(placeholder => (
                <div key={placeholder} style={{ background: 'var(--bg-secondary)', borderRadius: 6, height: 40, display: 'flex', alignItems: 'center', paddingLeft: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {placeholder}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handlePay} disabled={paying}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
              background: freelancer.brand_color, color: 'white', fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: paying ? 0.7 : 1, transition: 'opacity 0.2s',
            }}>
            {paying ? 'Processing…' : `Pay €${invoice.amount.toLocaleString()}`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            <Shield size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Secured by Stripe · SSL encrypted · Stripe integration in Phase 1
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
