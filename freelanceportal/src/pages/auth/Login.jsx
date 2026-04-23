import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight, Eye, EyeOff, Home, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { isAdminEmail } from '../../lib/admin'
import VeloraLoader from '../../components/ui/VeloraLoader'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()

    setLoading(true)
    setAuthError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    setLoading(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    const isAdmin = isAdminEmail(normalizedEmail)
    const requestedPath = location.state?.from?.pathname
    const nextPath = requestedPath?.startsWith('/') ? requestedPath : null
    const safeNextPath = isAdmin && (nextPath?.startsWith('/app') || nextPath === '/onboarding')
      ? '/admin/overview'
      : nextPath

    navigate(safeNextPath || (isAdmin ? '/admin/overview' : '/app/dashboard'), { replace: true })
  }

  return (
    <div className="auth-page auth-page-login">
      <motion.main
        className="auth-panel-wrap"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <div className="auth-topbar">
          <Link to="/" className="auth-brand" aria-label="Velora home">
            <img src="/logo.png" alt="Velora" className="auth-brand-wordmark" />
          </Link>
          <div className="auth-topbar-actions">
            <Link to="/" className="auth-home-link"><Home size={15} /> Home</Link>
            <Link to="/register" className="auth-topbar-link">Start free</Link>
          </div>
        </div>

        <section className="auth-panel" aria-labelledby="login-title">
          <div className="auth-panel-heading">
            <span className="auth-icon"><ShieldCheck size={18} /></span>
            <h2 id="login-title">Welcome back</h2>
            <p>Sign in to manage your clients, payments, and deliverables.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {authError && <p className="auth-alert auth-alert-error">{authError}</p>}

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-shell">
                <Mail size={17} />
                <input
                  id="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  placeholder="you@example.com"
                  className="input auth-input"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="auth-error">Enter a valid email address.</p>}
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="auth-input-shell">
                <LockKeyhole size={17} />
                <input
                  id="password"
                  {...register('password', { required: true, minLength: 6 })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input auth-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="auth-error">Use at least 6 characters.</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? <><VeloraLoader size={13} label={null} words={['.', '..', '...', '....', '.']} /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-switch">
            New to Velora? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </motion.main>
    </div>
  )
}
