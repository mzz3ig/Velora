import { motion } from 'framer-motion'
import { FileText, CreditCard, FolderOpen, MessageSquare, Palette, Link2, Shield, Zap } from 'lucide-react'

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const features = [
  { icon: FileText, color: '#a98252', title: 'Proposals & Contracts', desc: 'Build polished proposals, send legally-binding e-sign contracts. Clients sign in seconds.' },
  { icon: CreditCard, color: '#bca57d', title: 'Invoices & Payments', desc: 'Stripe-powered invoices. Accept cards and SEPA bank transfers. Get notified the moment you\'re paid.' },
  { icon: FolderOpen, color: '#d6c2a0', title: 'File Delivery', desc: 'Share deliverables directly from the portal. No Dropbox links, no Drive folders.' },
  { icon: MessageSquare, color: '#8f6d43', title: 'Threaded Messaging', desc: 'Per-project message threads. Everything documented in one place, not scattered through email.' },
  { icon: Palette, color: '#c9b28b', title: 'White-Label Branding', desc: 'Your logo. Your colors. Your domain. Clients never see our name.' },
  { icon: Link2, color: '#a98252', title: 'Magic Links', desc: 'Clients click a link. No accounts, no passwords, no friction. Just a clean experience.' },
  { icon: Shield, color: '#bca57d', title: 'Legally Solid', desc: 'EU eIDAS-compliant e-signatures. Timestamped, IP-logged, stored as signed PDF.' },
  { icon: Zap, color: '#d6c2a0', title: 'Automations', desc: 'Auto-reminders for unpaid invoices, unsigned contracts, and pending proposals.' },
]

export default function Features() {
  return (
    <section id="features" style={{ padding: 'clamp(80px, 10vw, 120px) 22px', background: 'rgba(245,245,247,0.58)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 64px' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a98252', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Features
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: 0, color: '#1d1d1f', lineHeight: 1.1, marginBottom: 16 }}>
              Replace 4 tools with one.
            </h2>
            <p style={{ fontSize: '1rem', color: '#424245', lineHeight: 1.65, letterSpacing: 0 }}>
              Everything a solo freelancer needs to look professional and get paid - without the bloat or the price tag.
            </p>
          </div>
        </Reveal>

        {/* Feature grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16,
        }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <motion.div
                className="glass"
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(255,255,255,0.68)', borderRadius: 8,
                  padding: '26px 24px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                  backdropFilter: 'var(--blur)',
                  WebkitBackdropFilter: 'var(--blur)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 8,
                  background: `${f.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <f.icon size={19} color={f.color} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '0.975rem', fontWeight: 600, letterSpacing: 0, color: '#1d1d1f', marginBottom: 7 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#424245', lineHeight: 1.6, letterSpacing: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Workflow row */}
        <Reveal delay={0.15}>
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#86868b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              The complete workflow
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              {['Proposal', 'Contract', 'Deposit', 'Deliver', 'Final invoice', 'Done ✓'].map((step, i, arr) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    background: i === arr.length - 1 ? '#1d1d1f' : '#fff',
                    border: '1px solid',
                    borderColor: i === arr.length - 1 ? '#1d1d1f' : '#d2d2d7',
                    borderRadius: 8, padding: '9px 16px',
                    fontSize: '0.82rem', fontWeight: 500,
                    color: i === arr.length - 1 ? '#fff' : '#424245',
                    letterSpacing: 0,
                  }}>{step}</div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 28, height: 1, background: '#d2d2d7', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
