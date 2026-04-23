import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isAdminEmail } from '../../lib/admin'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const userEmail = session?.user?.email || ''
  const isAdmin = isAdminEmail(userEmail)
  const privatePath = isAdmin ? '/admin/overview' : '/app/dashboard'
  const settingsPath = isAdmin ? '/admin/config' : '/app/settings'
  const displayName = session?.user?.user_metadata?.first_name || userEmail.split('@')[0] || 'Account'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <motion.nav
      className="liquid-nav"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 28px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.36s var(--ease-apple)',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
        <img src="/velora-logo-wordmark.png" alt="Velora" style={{ width: 142, height: 36, objectFit: 'contain' }} />
      </Link>

      {/* Nav links - desktop */}
      <div style={{ display: 'flex', gap: 28, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        className="nav-links-desktop">
        {['Features', 'Pricing', 'About'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            color: 'var(--text-muted)', textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 500, letterSpacing: 0,
            transition: 'color 0.22s var(--ease-apple)',
          }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >{item}</a>
        ))}
      </div>

      {/* Right CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {session ? (
          <div style={{ position: 'relative' }} className="nav-links-desktop">
            <button onClick={() => setProfileOpen(open => !open)} className="btn-primary" style={{ padding: '7px 12px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <UserRound size={14} /> {displayName} <ChevronDown size={13} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="glass" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 220, borderRadius: 8, padding: 8, boxShadow: 'var(--glass-inset), var(--glass-shadow)' }}>
                  <Link to={settingsPath} onClick={() => setProfileOpen(false)} className="nav-dropdown-link"><Settings size={14} /> Settings</Link>
                  <Link to={privatePath} onClick={() => setProfileOpen(false)} className="nav-dropdown-link"><LayoutDashboard size={14} /> {isAdmin ? 'Managing area' : 'Private area'}</Link>
                  <button onClick={signOut} className="nav-dropdown-link nav-dropdown-button"><LogOut size={14} /> Sign out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none' }} className="nav-links-desktop">
              <span style={{
                fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500,
                cursor: 'pointer', transition: 'color 0.22s var(--ease-apple)', letterSpacing: 0,
              }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >Sign in</span>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.84rem' }}>
                Get started
              </button>
            </Link>
          </>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'none', padding: 4 }}
          className="nav-menu-btn">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'absolute', top: 64, left: 0, right: 0,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-light)',
              padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
            {['Features', 'Pricing', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1rem', fontWeight: 500, padding: '10px 0' }}>
                {item}
              </a>
            ))}
            <div style={{ height: 1, background: 'var(--border-light)', margin: '6px 0' }} />
            {session ? (
              <>
                <Link to={settingsPath} onClick={() => setMenuOpen(false)} className="nav-dropdown-link"><Settings size={14} /> Settings</Link>
                <Link to={privatePath} onClick={() => setMenuOpen(false)} className="nav-dropdown-link"><LayoutDashboard size={14} /> {isAdmin ? 'Managing area' : 'Private area'}</Link>
                <button onClick={signOut} className="nav-dropdown-link nav-dropdown-button"><LogOut size={14} /> Sign out</button>
              </>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Sign in</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 680px) {
          .nav-links-desktop { display: none !important; }
          .nav-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  )
}
