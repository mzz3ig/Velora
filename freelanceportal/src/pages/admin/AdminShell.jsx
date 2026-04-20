import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, Users, Database, Layers,
  Activity, Globe, Zap, AlertTriangle, Settings2,
  Shield, ChevronRight, LogOut, Layers as AppIcon,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/overview' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { divider: true },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Database, label: 'Database', path: '/admin/data' },
  { icon: Layers, label: 'Store Adoption', path: '/admin/stores' },
  { divider: true },
  { icon: Activity, label: 'System Health', path: '/admin/health' },
  { icon: Globe, label: 'Feature Flags', path: '/admin/flags' },
  { icon: Zap, label: 'Actions', path: '/admin/actions' },
  { divider: true },
  { icon: AlertTriangle, label: 'Danger Zone', path: '/admin/danger' },
  { icon: Settings2, label: 'Config', path: '/admin/config' },
]

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      {/* Sidebar — mirrors AppShell Sidebar structure */}
      <motion.aside
        className="glass"
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          height: '100vh', position: 'sticky', top: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
          boxShadow: '1px 0 18px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flexShrink: 0, zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid var(--border)', minHeight: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'visible' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={16} color="white" />
            </div>
            {!collapsed && (
              <motion.div initial={false} animate={{ opacity: collapsed ? 0 : 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Admin Panel</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Platform Operator</div>
              </motion.div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '8px 0', width: '100%',
              display: 'flex', justifyContent: 'center',
              borderBottom: '1px solid var(--border)',
            }}>
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map((item, i) => {
            if (item.divider) return <div key={i} style={{ height: 1, background: 'var(--border)', margin: '5px 4px' }} />
            return (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '9px 0' : '8px 10px',
                  marginBottom: 1, fontSize: '0.85rem',
                }}
                title={collapsed ? item.label : undefined}>
                <item.icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 6px' }}>
          <NavLink to="/app/dashboard"
            className="nav-item"
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '8px 10px', marginBottom: 4, fontSize: '0.85rem' }}
            title={collapsed ? 'Back to App' : undefined}>
            <AppIcon size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Back to App</span>}
          </NavLink>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px 0' : '10px 10px',
            borderRadius: 8, justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'white',
            }}>R</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rodrigo Mendes</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Platform admin</div>
              </div>
            )}
          </div>

          <button onClick={signOut}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: collapsed ? '8px 0' : '8px 10px',
              borderRadius: 8, fontSize: '0.825rem',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <LogOut size={14} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}
