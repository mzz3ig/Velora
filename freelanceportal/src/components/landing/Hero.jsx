import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, CreditCard, FileText, MessageSquare, TrendingUp } from 'lucide-react'

// Animation 3: Floating dashboard mockup - Apple-style light card
function FloatingDashboard() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'relative' }}
    >
      {/* Main card */}
      <div className="glass" style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 8,
        padding: 28,
        width: 420,
        boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
      }}>
        {/* Chrome dots */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: '#86868b', marginBottom: 1 }}>Your portal</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: 0, color: '#1d1d1f' }}>João Silva Studio</div>
          </div>
          <div style={{ background: '#1d1d1f', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600, color: 'white' }}>
            Pro ✦
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Active', value: '8', sub: 'projects' },
            { label: 'Revenue', value: '€4.2k', sub: 'this month' },
            { label: 'Pending', value: '€1.8k', sub: 'invoices' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(245,245,247,0.68)', borderRadius: 8, padding: '11px 12px',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f', letterSpacing: 0 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#86868b', marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div style={{ fontSize: 10, fontWeight: 600, color: '#86868b', marginBottom: 9, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Recent
        </div>
        {[
          { icon: FileText, color: '#34c759', text: 'Contract signed - Acme Co.', time: '2m' },
          { icon: CreditCard, color: '#0071e3', text: 'Payment received - €850', time: '1h' },
          { icon: MessageSquare, color: '#5856d6', text: 'Message from Sara Johnson', time: '3h' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 0',
            borderBottom: i < 2 ? '1px solid #f5f5f7' : 'none',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: `${item.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <item.icon size={12} color={item.color} />
            </div>
            <span style={{ flex: 1, fontSize: 12, color: '#424245' }}>{item.text}</span>
            <span style={{ fontSize: 10, color: '#86868b', flexShrink: 0 }}>{item.time}</span>
          </div>
        ))}
      </div>

      {/* Floating badge - signed */}
      <motion.div
        className="glass"
        animate={{ y: [0, -6, 0], rotate: [1, -1, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{
          position: 'absolute', top: -14, right: -18,
          background: 'rgba(255,255,255,0.74)', borderRadius: 8,
          padding: '8px 13px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <CheckCircle2 size={13} color="#34c759" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', letterSpacing: 0 }}>Contract signed</span>
      </motion.div>

      {/* Floating badge - revenue */}
      <motion.div
        className="glass"
        animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{
          position: 'absolute', bottom: -14, left: -18,
          background: 'rgba(255,255,255,0.74)', borderRadius: 8,
          padding: '8px 13px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <TrendingUp size={13} color="#0071e3" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', letterSpacing: 0 }}>+€2,400 this week</span>
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: 'clamp(80px, 10vw, 120px) 22px 60px',
      background: 'transparent',
      overflow: 'hidden',
    }}>
      {/* Subtle gradient bg - very Apple */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(0,113,227,0.05), rgba(255,255,255,0) 58%)',
      }} />

      <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%', position: 'relative' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 64, alignItems: 'center',
        }} className="hero-grid">

          {/* Left copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: 20 }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(245,245,247,0.72)', borderRadius: 980, padding: '5px 13px',
                backdropFilter: 'var(--blur)',
                WebkitBackdropFilter: 'var(--blur)',
                fontSize: '0.78rem', fontWeight: 500, color: '#424245',
                letterSpacing: 0,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
                Now in public beta · 120+ freelancers
              </span>
            </motion.div>

            {/* Headline - Apple uses huge, tight letterSpacing */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              style={{
                fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: 0,
                color: '#1d1d1f',
                marginBottom: 20,
              }}
            >
              One link.<br />
              Your brand.<br />
              <span style={{ color: '#0071e3' }}>Fully yours.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              style={{
                fontSize: '1.05rem', color: '#424245',
                lineHeight: 1.65, marginBottom: 32,
                maxWidth: 440, letterSpacing: 0,
              }}
            >
              Send your client one link. They sign the contract, pay the invoice,
              download the files, and message you - all in one place, all under your brand.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}
            >
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ fontSize: '0.95rem', padding: '12px 24px' }}>
                  Start for free <ArrowRight size={15} />
                </button>
              </Link>
              <a href="#features" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ fontSize: '0.95rem', padding: '12px 24px' }}>
                  See how it works
                </button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}
            >
              {['14-day free trial', 'No credit card', 'Cancel anytime'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={13} color="#34c759" />
                  <span style={{ fontSize: '0.82rem', color: '#86868b', letterSpacing: 0 }}>{t}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: floating dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            style={{ display: 'flex', justifyContent: 'center' }}
            className="hero-dashboard"
          >
            <FloatingDashboard />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-dashboard { display: none !important; }
        }
      `}</style>
    </section>
  )
}
