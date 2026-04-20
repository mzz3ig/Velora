import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48,
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img src="/velora-logo.png" alt="Velora" style={{ width: 48, height: 48, objectFit: 'contain' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Velora</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260 }}>
              The all-in-one client portal for solo freelancers. Send one link. Get paid faster.
            </p>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Product</div>
            {['Features', 'Pricing', 'Changelog', 'Roadmap'].map(item => (
              <div key={item} style={{ marginBottom: 10 }}>
                <a href="#" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  {item}
                </a>
              </div>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Company</div>
            {['About', 'Blog', 'Affiliates', 'Contact'].map(item => (
              <div key={item} style={{ marginBottom: 10 }}>
                <a href="#" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  {item}
                </a>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Legal</div>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map(item => (
              <div key={item} style={{ marginBottom: 10 }}>
                <a href="#" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  {item}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          borderTop: '1px solid var(--border)', paddingTop: 24,
        }}>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            © 2026 Velora. Built for freelancers, by a freelancer.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Twitter', 'LinkedIn', 'Indie Hackers'].map(s => (
              <a key={s} href="#" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
