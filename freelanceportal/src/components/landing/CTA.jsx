import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
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

export default function CTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden', background: 'transparent' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <ScrollReveal>
          <motion.div
            className="glass"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: 'clamp(40px, 6vw, 64px)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 8, margin: '0 auto 24px',
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail size={24} color="var(--accent)" />
            </div>

            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800,
              letterSpacing: 0, marginBottom: 12, color: 'var(--text-primary)',
            }}>
              Ready to look more professional?
            </h2>
            <p style={{
              fontSize: '1rem', color: 'var(--text-secondary)',
              marginBottom: 36, lineHeight: 1.7,
            }}>
              Join 120+ freelancers who already send one link instead of four. Start your free trial - no credit card needed.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto 16px' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input"
                  style={{ borderRadius: 8 }}
                />
                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Get started <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 8, padding: '14px 24px', marginBottom: 16,
                  color: '#065f46', fontWeight: 600, fontSize: '0.95rem',
                }}
              >
                You're on the list. We'll be in touch shortly.
              </motion.div>
            )}

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Or{' '}
              <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                create your account directly
              </Link>
              {' '}- 14-day free trial, no card required.
            </p>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}
