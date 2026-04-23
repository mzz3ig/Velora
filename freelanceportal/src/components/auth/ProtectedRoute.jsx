import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { rehydrateAppStores } from '../../store'
import { isAdminEmail } from '../../lib/admin'
import VeloraLoader from '../ui/VeloraLoader'

export default function ProtectedRoute() {
  const [session, setSession] = useState(null)
  const [onboardingComplete, setOnboardingComplete] = useState(null)
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

    const finish = async (s) => {
      if (!mounted) return
      setSession(s)
      if (s) {
        try {
          const complete = await checkOnboarding(s)
          if (!mounted) return
          setOnboardingComplete(complete)
        } catch (error) {
          console.error('Failed to check onboarding status', error)
          if (!mounted) return
          setOnboardingComplete(true)
        }
      } else {
        setOnboardingComplete(null)
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

  if (loading || (session && onboardingComplete === null)) {
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

  return <Outlet />
}
