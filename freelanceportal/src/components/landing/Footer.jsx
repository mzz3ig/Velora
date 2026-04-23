import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Product',
    links: [
      ['Features', '#features'],
      ['Pricing', '#pricing'],
      ['Start free', '/register'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Contact', 'mailto:support@velora.app'],
      ['Sign in', '/login'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy', 'mailto:privacy@velora.app'],
      ['Terms', 'mailto:support@velora.app'],
      ['GDPR', 'mailto:privacy@velora.app'],
    ],
  },
]

function FooterLink({ href, children }) {
  const style = { fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }
  const props = {
    style,
    onMouseEnter: event => { event.currentTarget.style.color = 'var(--accent)' },
    onMouseLeave: event => { event.currentTarget.style.color = 'var(--text-secondary)' },
  }

  if (href.startsWith('/')) return <Link to={href} {...props}>{children}</Link>
  return <a href={href} {...props}>{children}</a>
}

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
              <img src="/velora-logo-wordmark.png" alt="Velora" style={{ width: 214, height: 56, objectFit: 'contain' }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260 }}>
              The all-in-one client portal for solo freelancers. Send one link. Get paid faster.
            </p>
          </div>

          {columns.map(column => (
            <div key={column.title}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>{column.title}</div>
              {column.links.map(([label, href]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <FooterLink href={href}>{label}</FooterLink>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          borderTop: '1px solid var(--border)', paddingTop: 24,
        }}>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            © 2026 Velora. Built for freelancers, by a freelancer.
          </p>
          <Link to="/register" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Start free</Link>
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
