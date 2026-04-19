import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, LayoutDashboard, Users, Briefcase, FileText,
  ScrollText, CreditCard, FolderOpen, MessageSquare,
  Settings, LogOut, ChevronRight, Clock, Receipt,
  Package, TrendingUp, ClipboardList, CalendarDays,
  BarChart2, Zap as ZapIcon, CheckSquare,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { divider: true },
  { icon: Users, label: 'Clients', path: '/app/clients' },
  { icon: TrendingUp, label: 'Pipeline', path: '/app/pipeline' },
  { icon: Briefcase, label: 'Projects', path: '/app/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
  { divider: true },
  { icon: FileText, label: 'Proposals', path: '/app/proposals' },
  { icon: ScrollText, label: 'Contracts', path: '/app/contracts' },
  { icon: CreditCard, label: 'Invoices', path: '/app/invoices' },
  { divider: true },
  { icon: Clock, label: 'Time Tracking', path: '/app/time' },
  { icon: Receipt, label: 'Expenses', path: '/app/expenses' },
  { icon: Package, label: 'Services', path: '/app/services' },
  { divider: true },
  { icon: ClipboardList, label: 'Forms', path: '/app/forms' },
  { icon: CalendarDays, label: 'Scheduling', path: '/app/scheduling' },
  { divider: true },
  { icon: FolderOpen, label: 'Files', path: '/app/files' },
  { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
  { divider: true },
  { icon: BarChart2, label: 'Reports', path: '/app/reports' },
  { icon: ZapIcon, label: 'Automations', path: '/app/automations' },
  { divider: true },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate()

  return (
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
        overflow: 'hidden', flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '20px 0' : '20px 16px',
        borderBottom: '1px solid var(--border)',
        minHeight: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="white" fill="white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={false}
              animate={{ opacity: collapsed ? 0 : 1 }}
              style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
            >
              FreelancePortal
            </motion.span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '8px 0', width: '100%',
            display: 'flex', justifyContent: 'center',
            borderBottom: '1px solid var(--border)',
            transition: 'all 0.28s var(--ease-apple)',
          }}
        >
          <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map((item, i) => {
          if (item.divider) {
            return <div key={i} style={{ height: 1, background: 'var(--border)', margin: '5px 4px' }} />
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '8px 10px',
                marginBottom: 1,
                fontSize: '0.85rem',
              }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User section */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '10px 0' : '10px 10px',
          borderRadius: 8, justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)',
          }}>
            R
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Rodrigo Mendes
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Pro plan</div>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: collapsed ? '8px 0' : '8px 10px',
            borderRadius: 8, fontSize: '0.825rem',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={14} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
