import { Outlet, useSearchParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, ScrollText, CreditCard,
  FolderOpen, MessageSquare, Zap,
} from 'lucide-react'

// Simulates what would be decoded from a JWT magic link token
// In Phase 1: GET /api/portal/verify?token=JWT → returns freelancer + client data
const MOCK_PORTAL_DATA = {
  freelancer: {
    name: 'Rodrigo Mendes Studio',
    email: 'rodrigo@example.com',
    brand_color: '#6366f1',
    logo: null,
  },
  client: {
    name: 'Acme Corporation',
    contact: 'John Smith',
  },
  project: {
    name: 'Webflow Redesign',
    status: 'In Progress',
  },
}

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
  const { freelancer, client, project } = MOCK_PORTAL_DATA
  const brandColor = freelancer.brand_color

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Portal header — white-labeled */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{freelancer.name}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          {client.contact} · {project.name}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar nav */}
        <nav style={{ width: 200, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '20px 8px', flexShrink: 0 }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  background: active ? brandColor + '15' : 'transparent',
                  color: active ? brandColor : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 400, fontSize: '0.875rem',
                  borderLeft: active ? `3px solid ${brandColor}` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <item.icon size={16} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Outlet context={{ freelancer, client, project }} />
        </main>
      </div>

      {/* Footer */}
      <footer style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Powered by FreelancePortal · {freelancer.name}
        </span>
      </footer>
    </div>
  )
}
