import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, FileText, ScrollText, CreditCard,
  FolderOpen, MessageSquare, Zap, AlertCircle,
} from 'lucide-react'
import { getPortalTokenFromUrl, loadPortalPayload } from '../../lib/portal'

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
        padding: '0 24px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {freelancer.logo ? (
            <img src={freelancer.logo} alt={freelancer.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: 8, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={24} color="white" />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{freelancer.name || 'Client portal'}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          {[client.name, project.name].filter(Boolean).join(' · ')}
        </div>
      </header>

      {loading || error ? (
        <main className="portal-main" style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 32 }}>
          <div className="card" style={{ maxWidth: 460, textAlign: 'center' }}>
            {loading ? (
              <>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>Opening portal</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Checking your secure link...</p>
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
        <nav className="glass portal-chrome" style={{ width: 200, borderRight: '1px solid var(--border)', padding: '20px 8px', flexShrink: 0 }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={`${item.path}${query}`} style={{ textDecoration: 'none' }}>
                <div className={`portal-nav-item${active ? ' active' : ''}`} style={{
                  color: active ? brandColor : 'var(--text-secondary)',
                  borderLeft: active ? `3px solid ${brandColor}` : '3px solid transparent',
                }}>
                  <item.icon size={16} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Content */}
        <main className="portal-main" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Outlet context={{ token, portal: payload, setPortal: updatePayload, freelancer, client, project }} />
        </main>
      </div>
      )}

      {/* Footer */}
      <footer className="glass portal-chrome" style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Powered by Velora{freelancer.name ? ` · ${freelancer.name}` : ''}
        </span>
      </footer>
    </div>
  )
}
