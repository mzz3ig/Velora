import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="workspace-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay — only rendered when open, CSS controls visibility by breakpoint */}
      <div
        onClick={() => setMobileOpen(false)}
        className="mobile-overlay"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)',
          zIndex: 40, display: mobileOpen ? undefined : 'none',
        }}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="workspace-main" style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)', padding: '8px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <img src="/velora-logo.png" alt="Velora" style={{ width: 42, height: 42, borderRadius: 9, objectFit: 'contain' }} />
          <div style={{ width: 36 }} />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
