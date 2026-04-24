import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { rehydrateAppStores } from '../../store'
import { isAdminEmail } from '../../lib/admin'
import { getBillingStatus } from '../../lib/api'
import VeloraLoader from '../ui/VeloraLoader'
import SubscriptionBlocked from '../../pages/auth/SubscriptionBlocked'

// Routes that are always accessible even when subscription is blocked
const BILLING_EXEMPT_PATHS = ['/app/settings', '/onboarding']

export default function ProtectedRoute() {
  const [session, setSession] = useState(null)
  const [onboardingComplete, setOnboardingComplete] = useState(null)
  const [billingStatus, setBillingStatus] = useState(null) // null = not yet checked
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    const checkOnboarding = async (s) => {
      if (!s?.user?.id) return false
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed_at')
        .eq('user_id', s.user.id)
        .maybeSingle()
      if (error) throw error
      return Boolean(data?.completed_at)
    }

    const checkBilling = async () => {
      try {
        const status = await getBillingStatus()
        return status
      } catch {
        // If the billing check fails (network, server down), allow access
        // to avoid locking users out due to infrastructure issues
        return { allowed: true, reason: 'check_failed' }
      }
    }

    const finish = async (s) => {
      if (!mounted) return
      setSession(s)
      if (s) {
        try {
          const [complete, billing] = await Promise.all([
            checkOnboarding(s),
            checkBilling(),
          ])
          if (!mounted) return
          setOnboardingComplete(complete)
          setBillingStatus(billing)
        } catch (error) {
          console.error('Failed to check session state', error)
          if (!mounted) return
          setOnboardingComplete(true)
          setBillingStatus({ allowed: true, reason: 'check_failed' })
        }
      } else {
        setOnboardingComplete(null)
        setBillingStatus(null)
      }
      setLoading(false)
    }

    // Fallback: never stay frozen longer than 8 seconds
    const timeout = setTimeout(() => finish(null), 8000)

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      if (data.session) {
        try {
          await rehydrateAppStores()
        } catch (error) {
          console.error('Failed to rehydrate app stores', error)
        }
      }
      clearTimeout(timeout)
      finish(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setOnboardingComplete(null)
      setBillingStatus(null)
      finish(nextSession)
    })

    const markOnboardingComplete = () => {
      if (mounted) setOnboardingComplete(true)
    }

    window.addEventListener('velora:onboarding-complete', markOnboardingComplete)

    return () => {
      mounted = false
      clearTimeout(timeout)
      window.removeEventListener('velora:onboarding-complete', markOnboardingComplete)
      listener.subscription.unsubscribe()
    }
  }, [])

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

  // Block access if subscription is not active/trialing, unless on an exempt path
  const isExempt = BILLING_EXEMPT_PATHS.some((p) => location.pathname.startsWith(p))
  if (!isExempt && billingStatus && !billingStatus.allowed) {
    return <SubscriptionBlocked reason={billingStatus.reason} />
  }

  return <Outlet />
}
