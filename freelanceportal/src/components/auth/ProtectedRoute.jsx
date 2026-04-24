import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { rehydrateAppStores } from '../../store'
import { isAdminEmail } from '../../lib/admin'
import { getBillingStatus } from '../../lib/api'
import VeloraLoader from '../ui/VeloraLoader'
import SubscriptionBlocked from '../../pages/auth/SubscriptionBlocked'

const BILLING_EXEMPT_PATHS = ['/app/settings', '/onboarding']

export default function ProtectedRoute() {
  const [state, setState] = useState({
    loading: true,
    session: null,
    onboardingComplete: null,
    billingStatus: null,
  })
  const location = useLocation()
  const inflight = useRef(false)

  useEffect(() => {
    let mounted = true

    async function boot(session) {
      if (inflight.current) return
      inflight.current = true

      if (!session) {
        if (mounted) setState({ loading: false, session: null, onboardingComplete: null, billingStatus: null })
        inflight.current = false
        return
      }

      try {
        await rehydrateAppStores()
      } catch {
        // non-fatal
      }

      let onboardingComplete = true
      let billingStatus = { allowed: true, reason: 'check_failed' }

      try {
        const [ob, bi] = await Promise.all([
          supabase
            .from('user_onboarding')
            .select('completed_at')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) throw error
              return Boolean(data?.completed_at)
            }),
          getBillingStatus().catch(() => ({ allowed: true, reason: 'check_failed' })),
        ])
        onboardingComplete = ob
        billingStatus = bi
      } catch {
        // fallback already set above
      }

      if (mounted) {
        setState({ loading: false, session, onboardingComplete, billingStatus })
      }
      inflight.current = false
    }

    const timeout = setTimeout(() => {
      if (mounted) setState({ loading: false, session: null, onboardingComplete: null, billingStatus: null })
    }, 8000)

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timeout)
      boot(data.session ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      inflight.current = false
      boot(session ?? null)
    })

    const markOnboardingComplete = () => {
      if (mounted) setState(s => ({ ...s, onboardingComplete: true }))
    }
    window.addEventListener('velora:onboarding-complete', markOnboardingComplete)

    return () => {
      mounted = false
      clearTimeout(timeout)
      window.removeEventListener('velora:onboarding-complete', markOnboardingComplete)
      listener.subscription.unsubscribe()
    }
  }, [])

  const { loading, session, onboardingComplete, billingStatus } = state

  if (loading || (session && (onboardingComplete === null || billingStatus === null))) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>
        <VeloraLoader surface size={18} words={['session', 'workspace', 'projects', 'tasks', 'session']} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isAdminEmail(session.user?.email)) {
    return <Navigate to="/admin/overview" replace />
  }

  if (location.pathname !== '/onboarding' && onboardingComplete === false) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />
  }

  if (location.pathname === '/onboarding' && onboardingComplete) {
    return <Navigate to="/app/dashboard" replace />
  }

  const isExempt = BILLING_EXEMPT_PATHS.some((p) => location.pathname.startsWith(p))
  if (!isExempt && billingStatus && !billingStatus.allowed) {
    return <SubscriptionBlocked reason={billingStatus.reason} />
  }

  return <Outlet />
}
