import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PenTool, CheckCircle2, Download, Shield } from 'lucide-react'

const CONTRACT_TEXT = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into between Rodrigo Mendes Studio ("Freelancer") and Acme Corporation ("Client").

1. SERVICES
The Freelancer agrees to provide: Full website redesign on Webflow, including design, development, and launch.

2. PAYMENT
Total: €3,350. Deposit of 50% (€1,675) due before work commences. Final invoice on delivery.

3. TIMELINE
Project will be completed by April 28, 2026.

4. REVISIONS
Up to 2 rounds of revisions included.

5. PAYMENT TERMS
Payment due within 14 days. Late fee 2%/month on overdue amounts.

6. IP OWNERSHIP
All rights transfer to Client upon full payment.

7. CONFIDENTIALITY
Both parties agree to keep project information confidential.`

export default function PortalContract() {
  const { freelancer, client, project } = useOutletContext()
  const [signed, setSigned] = useState(false)
  const [showSigPad, setShowSigPad] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [signedAt, setSignedAt] = useState(null)

  function sign() {
    if (!typedName.trim()) return
    setSigned(true)
    setSignedAt(new Date())
    setShowSigPad(false)
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Contract</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>From {freelancer.name} — {project.name}</p>

      {/* Contract text */}
      <div className="card" style={{ padding: '28px', marginBottom: 20 }}>
        <pre style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
          {CONTRACT_TEXT}
        </pre>
      </div>

      {/* Signature area */}
      {signed ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <CheckCircle2 size={32} color="#22c55e" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Contract signed!</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {signedAt?.toLocaleString()} · IP address recorded
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Signature</div>
            <div style={{ fontSize: '1.4rem', fontFamily: 'cursive', color: 'var(--text-primary)', letterSpacing: 2 }}>{typedName}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={12} color="#22c55e" />
            <span style={{ fontSize: '0.72rem', color: '#22c55e' }}>
              PDF generated and stored securely · Supabase Storage in Phase 1
            </span>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            <Download size={14} /> Download PDF (Phase 1)
          </button>
        </motion.div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <PenTool size={18} color="var(--text-muted)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Sign this contract</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            By signing, you agree to all terms above. Your signature is legally binding.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Type your full name to sign
            </label>
            <input className="input" placeholder={`e.g. ${client.contact}`} value={typedName}
              onChange={e => setTypedName(e.target.value)}
              style={{ fontSize: '1.2rem', fontFamily: 'cursive', letterSpacing: 1 }} />
          </div>
          <button onClick={sign} disabled={!typedName.trim()}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: freelancer.brand_color, color: 'white', fontWeight: 700, fontSize: '0.925rem',
              cursor: typedName.trim() ? 'pointer' : 'not-allowed', opacity: typedName.trim() ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <PenTool size={16} /> Sign contract
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <Shield size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Signature stored with timestamp + IP · PDF via pdf-lib in Phase 1
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
