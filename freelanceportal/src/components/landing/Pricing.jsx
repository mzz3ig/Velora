import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function ScrollReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const plans = [
  {
    name: 'Starter',
    price: { monthly: 15, annual: 126 },
    desc: 'Perfect for freelancers just getting started.',
    color: '#0071e3',
    features: [
      'Up to 3 active client portals',
      'Proposals & contracts',
      'Stripe payment collection',
      '5GB file storage',
      'yourname.freelanceportal.com subdomain',
      'Email support',
    ],
    cta: 'Start free trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 29, annual: 242 },
    desc: 'For freelancers who are serious about their business.',
    color: '#2997ff',
    features: [
      'Unlimited active client portals',
      'Full white-label (custom domain)',
      '20GB file storage',
      'Automated email sequences',
      'Analytics dashboard',
      'Unlimited templates',
      'Priority support',
    ],
    cta: 'Start free trial',
    popular: true,
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" style={{ padding: '100px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(0,113,227,0.1)', border: '1px solid rgba(0,113,227,0.2)',
              borderRadius: 999, padding: '4px 14px', marginBottom: 16,
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Simple pricing
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              fontWeight: 800, letterSpacing: 0,
              marginBottom: 12, color: 'var(--text-primary)',
            }}>
              Cheaper than HoneyBook.<br />More powerful than Bonsai.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 28 }}>
              Replace €25-55/month of separate tools for one flat price.
            </p>

            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12,
              background: 'var(--surface)', borderRadius: 999, padding: '4px',
              border: '1px solid var(--border)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}>
              {['Monthly', 'Annual'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setAnnual(mode === 'Annual')}
                  style={{
                    padding: '6px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                    background: (mode === 'Annual') === annual
                      ? 'var(--text-primary)' : 'transparent',
                    color: (mode === 'Annual') === annual ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {mode}
                  {mode === 'Annual' && (
                    <span style={{ marginLeft: 6, fontSize: '0.7rem',
                      background: 'rgba(34,197,94,0.2)', color: '#4ade80',
                      padding: '1px 6px', borderRadius: 999 }}>
                      Save 30%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        }} className="pricing-grid">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.12}>
              <motion.div
                className="glass"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'relative',
                  background: plan.popular
                    ? 'var(--surface)'
                    : 'var(--surface)',
                  border: plan.popular
                    ? '1px solid rgba(0,113,227,0.35)'
                    : '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '32px',
                  height: '100%',
                  backdropFilter: 'var(--blur)',
                  WebkitBackdropFilter: 'var(--blur)',
                  boxShadow: plan.popular ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)',
                    borderRadius: 999, padding: '4px 16px',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white',
                    display: 'flex', alignItems: 'center', gap: 4,
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <Zap size={11} fill="white" /> Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: plan.color, marginBottom: 8
                  }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: 0 }}>
                      €{annual ? Math.round(plan.price.annual / 12) : plan.price.monthly}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/month</span>
                  </div>
                  {annual && (
                    <div style={{ fontSize: '0.8rem', color: '#4ade80', marginBottom: 8 }}>
                      €{plan.price.annual}/year - billed annually
                    </div>
                  )}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{plan.desc}</p>
                </div>

                <Link to="/register" style={{ textDecoration: 'none', display: 'block', marginBottom: 28 }}>
                  <button
                    className={plan.popular ? 'btn-primary' : 'btn-ghost'}
                    style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: '0.95rem' }}
                  >
                    {plan.cta}
                  </button>
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: `${plan.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                      }}>
                        <Check size={10} color={plan.color} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <p style={{ textAlign: 'center', marginTop: 28, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
