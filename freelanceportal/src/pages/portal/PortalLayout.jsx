import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, FileText, ScrollText, CreditCard,
  FolderOpen, MessageSquare, Zap, AlertCircle,
} from 'lucide-react'
import { getPortalTokenFromUrl, loadPortalPayload } from '../../lib/portal'
import VeloraLoader from '../../components/ui/VeloraLoader'

const NAV_ITEMS = [
  { path: '/portal/overview', icon: LayoutDashboard, label: 'Overview' },
  { path: '/portal/proposal', icon: FileText, label: 'Proposal' },
  { path: '/portal/contract', icon: ScrollText, label: 'Contract' },
  { path: '/portal/invoice', icon: CreditCard, label: 'Invoice' },
  { path: '/portal/files', icon: FolderOpen, label: 'Files' },
  { path: '/portal/messages', icon: MessageSquare, label: 'Messages' },
]

export default function PortalLayout() {
  const location = useLocation()
  const token = useMemo(() => getPortalTokenFromUrl(location.search), [location.search])
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        if (!token) {
          setError('This portal link is missing its access token.')
          setPayload(null)
          return
        }

        const data = await loadPortalPayload(token)
        if (!mounted) return

        if (data?.error) {
          setError(data.error === 'invalid_or_expired'
            ? 'This portal link is invalid or has expired.'
            : 'This portal link could not be opened.')
          setPayload(null)
          return
        }

        setPayload(data)
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Unable to load this portal.')
        setPayload(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [token])

  const updatePayload = (nextPayload) => {
    if (nextPayload && !nextPayload.error) setPayload(nextPayload)
  }

  const freelancer = payload?.freelancer || {}
  const client = payload?.client || {}
  const project = payload?.project || {}
  const brandColor = freelancer.brand_color || '#a98252'
  const query = token ? `?token=${encodeURIComponent(token)}` : ''

  return (
    <div className="portal-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Portal header — white-labeled */}
      <header className="glass portal-chrome" style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {freelancer.logo ? (
            <img src={freelancer.logo} alt={freelancer.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `linear-gradient(135deg, ${brandColor}, ${brandColor}bb)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: `0 0 0 1px ${brandColor}40`,
            }}>
              <Zap size={20} color="white" />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {freelancer.name || 'Client portal'}
            </div>
            {project.name && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{project.name}</div>
            )}
          </div>
        </div>
        {client.name && (
          <div style={{
            fontSize: '0.8rem', color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            padding: '5px 12px', borderRadius: 20,
          }}>
            {client.name}
          </div>
        )}
      </header>

      {loading || error ? (
        <main className="portal-main" style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 32 }}>
          <div className="card" style={{ maxWidth: 460, textAlign: 'center' }}>
            {loading ? (
              <>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>Opening portal</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Checking your secure link...</p>
                <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>
                  <VeloraLoader size={15} words={['secure link', 'project', 'files', 'messages', 'secure link']} />
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={34} color="#f87171" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>Portal unavailable</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{error}</p>
              </>
            )}
          </div>
        </main>
      ) : (
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Sidebar nav */}
          <nav className="glass portal-chrome" style={{
            width: 220, borderRight: '1px solid var(--border)',
            padding: '24px 12px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '2px 10px 10px' }}>
              Navigation
            </div>
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path
              return (
                <Link key={item.path} to={`${item.path}${query}`} style={{ textDecoration: 'none' }}>
                  <div
                    className={`portal-nav-item${active ? ' active' : ''}`}
                    style={{
                      color: active ? brandColor : 'var(--text-secondary)',
                      borderLeft: active ? `3px solid ${brandColor}` : '3px solid transparent',
                      padding: '10px 12px',
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 500,
                      gap: 10,
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Content */}
          <main className="portal-main" style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
            <Outlet context={{ token, portal: payload, setPortal: updatePayload, freelancer, client, project }} />
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="glass portal-chrome" style={{ padding: '14px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Powered by <strong style={{ color: 'var(--text-secondary)' }}>Velora</strong>
          {freelancer.name ? ` · ${freelancer.name}` : ''}
        </span>
      </footer>
    </div>
  )
}
