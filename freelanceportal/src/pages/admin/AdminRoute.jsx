import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'rcmendes098@hotmail.com'
const isAdminEmail = (email) => email?.trim().toLowerCase() === ADMIN_EMAIL

export default function AdminRoute() {
  const [status, setStatus] = useState('loading')
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const email = data.session?.user?.email
      setStatus(isAdminEmail(email) ? 'allowed' : 'denied')
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return
      const email = session?.user?.email
      setStatus(isAdminEmail(email) ? 'allowed' : 'denied')
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>
        Verifying admin access…
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
