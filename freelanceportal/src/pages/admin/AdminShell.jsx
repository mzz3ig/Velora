import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, Users, Database, Layers,
  Activity, Globe, Zap, AlertTriangle, Settings2,
  Shield, ChevronLeft, LogOut, Home,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const navGroups = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Overview', path: '/admin/overview' },
      { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: Database, label: 'Database', path: '/admin/data' },
      { icon: Layers, label: 'Store Adoption', path: '/admin/stores' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: Activity, label: 'System Health', path: '/admin/health' },
      { icon: Globe, label: 'Feature Flags', path: '/admin/flags' },
      { icon: Zap, label: 'Actions', path: '/admin/actions' },
    ],
  },
  {
    label: 'Danger',
    items: [
      { icon: AlertTriangle, label: 'Danger Zone', path: '/admin/danger' },
      { icon: Settings2, label: 'Config', path: '/admin/config' },
    ],
  },
]

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="workspace-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <motion.aside
        className="glass workspace-sidebar"
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{
          height: '100vh', position: 'sticky', top: 0,
          borderRight: '1px solid var(--border)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flexShrink: 0, zIndex: 10,
        }}
      >
        {/* Logo / header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid var(--border)', minHeight: 68,
        }}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Expand sidebar"
            >
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(135deg, #f87171, #ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={17} color="white" />
              </div>
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg, #f87171, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={17} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Admin Panel</div>
                  <div style={{ fontSize: '0.62rem', color: '#f87171', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>Platform Operator</div>
                </div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  cursor: 'pointer', color: 'var(--text-muted)', padding: '5px 6px',
                  borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <ChevronLeft size={14} />
              </button>
            </>
          )}
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, padding: collapsed ? '10px 0' : '10px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: collapsed ? 4 : 6 }}>
              {group.label && !collapsed && (
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  padding: '10px 10px 4px',
                }}>
                  {group.label}
                </div>
              )}
              {collapsed && gi > 0 && (
                <div style={{ height: 1, background: 'var(--border)', margin: '6px 10px' }} />
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '10px 0' : '9px 10px',
                    marginBottom: 1, fontSize: '0.86rem',
                    borderRadius: 8, gap: 10,
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 500 }}>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ borderTop: '1px solid var(--border)', padding: collapsed ? '10px 0' : '10px 10px' }}>
          {/* Home */}
          <NavLink
            to="/"
            className="nav-item"
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '9px 10px',
              marginBottom: 8, fontSize: '0.86rem', borderRadius: 8, gap: 10,
            }}
            title={collapsed ? 'Home' : undefined}
          >
            <Home size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontWeight: 500 }}>Home</span>}
          </NavLink>

          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: 10, justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.15)',
            marginBottom: 6,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #f87171, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', fontWeight: 700, color: 'white',
            }}>R</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Rodrigo Mendes
                </div>
                <div style={{ fontSize: '0.69rem', marginTop: 1 }}>
                  <span style={{
                    background: 'rgba(248,113,113,0.15)', color: '#fca5a5',
                    padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
                  }}>Admin</span>
                </div>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: collapsed ? '8px 0' : '8px 10px',
              borderRadius: 8, fontSize: '0.83rem', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={15} />
            {!collapsed && <span style={{ fontWeight: 500 }}>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="workspace-main" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}
