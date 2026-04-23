import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Briefcase, FileText,
  ScrollText, CreditCard, FolderOpen, MessageSquare,
  Settings, LogOut, ChevronRight, Clock, Receipt,
  Package, TrendingUp, ClipboardList, CalendarDays,
  BarChart2, Zap as ZapIcon, CheckSquare, Bell,
  CheckCircle2, AlertCircle, X, ChevronLeft,
} from 'lucide-react'
import { useNotificationStore, useSettingsStore } from '../../store'
import { supabase } from '../../lib/supabase'

const navGroups = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    ],
  },
  {
    label: 'Work',
    items: [
      { icon: Users, label: 'Clients', path: '/app/clients' },
      { icon: TrendingUp, label: 'Pipeline', path: '/app/pipeline' },
      { icon: Briefcase, label: 'Projects', path: '/app/projects' },
      { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: FileText, label: 'Proposals', path: '/app/proposals' },
      { icon: ScrollText, label: 'Contracts', path: '/app/contracts' },
      { icon: CreditCard, label: 'Invoices', path: '/app/invoices' },
      { icon: Clock, label: 'Time Tracking', path: '/app/time' },
      { icon: Receipt, label: 'Expenses', path: '/app/expenses' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: Package, label: 'Services', path: '/app/services' },
      { icon: ClipboardList, label: 'Forms', path: '/app/forms' },
      { icon: CalendarDays, label: 'Scheduling', path: '/app/scheduling' },
      { icon: FolderOpen, label: 'Files', path: '/app/files' },
      { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart2, label: 'Reports', path: '/app/reports' },
      { icon: ZapIcon, label: 'Automations', path: '/app/automations' },
    ],
  },
]

const notifIcons = {
  contract: { icon: CheckCircle2, color: '#22c55e' },
  payment: { icon: CreditCard, color: '#a98252' },
  proposal: { icon: FileText, color: '#f59e0b' },
  client: { icon: Users, color: '#38bdf8' },
  overdue: { icon: AlertCircle, color: '#f87171' },
}

function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead, clearAll } = useNotificationStore()
  const ref = useRef()
  const [currentTime] = useState(() => new Date())

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -8, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8, scale: 0.97 }}
      className="glass"
      style={{
        position: 'fixed', left: 252, top: 80, width: 320, zIndex: 100,
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--accent)' }}>Mark all read</button>
          )}
          <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Clear all</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><X size={14} /></button>
        </div>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications</div>
        ) : notifications.map((n, i) => {
          const meta = notifIcons[n.type] || notifIcons.client
          const elapsed = Math.round((currentTime - new Date(n.time)) / 60000)
          const timeStr = elapsed < 60 ? `${elapsed}m ago` : elapsed < 1440 ? `${Math.round(elapsed / 60)}h ago` : `${Math.round(elapsed / 1440)}d ago`
          return (
            <div key={n.id} onClick={() => markRead(n.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                background: n.read ? 'transparent' : 'rgba(169,130,82,0.05)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(169,130,82,0.05)'}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <meta.icon size={13} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{timeStr}</div>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { notifications } = useNotificationStore()
  const { account, billing } = useSettingsStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthUser(data?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const displayName = (() => {
    const first = account?.firstName?.trim()
    const last = account?.lastName?.trim()
    if (first || last) return [first, last].filter(Boolean).join(' ')
    return authUser?.email?.split('@')[0] || 'My Account'
  })()

  const initials = displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  const planLabel = (() => {
    const plan = billing?.plan || 'starter'
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  })()

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.assign('/login')
  }

  return (
    <>
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
          overflow: 'hidden', flexShrink: 0,
          zIndex: 50,
        }}
        data-mobile-open={mobileOpen}
      >
        {/* Logo + collapse toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid var(--border)',
          minHeight: 68,
        }}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Expand sidebar"
            >
              <img src="/velora-logo.png" alt="Velora" style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'contain' }} />
            </button>
          ) : (
            <>
              <img src="/velora-logo-wordmark-transparent.png" alt="Velora" style={{ width: 96, height: 24, objectFit: 'contain', objectPosition: 'left' }} />
              <button
                onClick={() => { setCollapsed(true); setMobileOpen && setMobileOpen(false) }}
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
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '10px 0' : '9px 10px',
                    marginBottom: 1,
                    fontSize: '0.86rem',
                    borderRadius: 8,
                    gap: 10,
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
          {/* Notifications */}
          <button
            onClick={() => setShowNotifs(v => !v)}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10, width: '100%',
              background: showNotifs ? 'rgba(99,102,241,0.1)' : 'none',
              border: 'none', cursor: 'pointer', borderRadius: 8,
              color: showNotifs ? 'var(--primary)' : 'var(--text-muted)',
              padding: collapsed ? '10px 0' : '9px 10px',
              marginBottom: 2, fontSize: '0.86rem',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!showNotifs) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
            onMouseLeave={e => { if (!showNotifs) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            title={collapsed ? 'Notifications' : undefined}
          >
            <div style={{ position: 'relative' }}>
              <Bell size={17} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', fontWeight: 800, color: 'white',
                }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
              )}
            </div>
            {!collapsed && <span style={{ fontWeight: 500 }}>Notifications</span>}
          </button>

          {/* Settings */}
          <NavLink
            to="/app/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '9px 10px',
              marginBottom: 8, fontSize: '0.86rem',
              borderRadius: 8, gap: 10,
            }}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontWeight: 500 }}>Settings</span>}
          </NavLink>

          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: 10, justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            marginBottom: 6,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', fontWeight: 700, color: 'white',
              boxShadow: '0 0 0 2px rgba(99,102,241,0.3)',
            }}>{initials}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: 1 }}>
                  <span style={{
                    background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                    padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
                  }}>{planLabel}</span>
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

      <AnimatePresence>
        {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
      </AnimatePresence>
    </>
  )
}
