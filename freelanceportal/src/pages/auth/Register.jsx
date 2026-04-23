import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Home, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { isAdminEmail } from '../../lib/admin'
import VeloraLoader from '../../components/ui/VeloraLoader'

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  const onSubmit = async ({ firstName, lastName, businessName, email, password }) => {
    setLoading(true)
    setAuthError('')
    setNotice('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: {
          first_name: firstName,
          last_name: lastName,
          business_name: businessName || '',
        },
      },
    })

    setLoading(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    if (!data.session) {
      setNotice('Account created. Check your email to confirm your account before signing in.')
      return
    }

    navigate(isAdminEmail(email) ? '/admin/overview' : '/app/dashboard')
  }

  const perks = [
    '14-day free trial, no credit card',
    'Full access to all Pro features',
    'Cancel anytime, no lock-in',
  ]

  return (
    <div className="auth-page auth-page-register">
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
            <Link to="/login" className="auth-topbar-link">Sign in</Link>
          </div>
        </div>

        <section className="auth-panel auth-panel-wide" aria-labelledby="register-title">
          <div className="auth-panel-heading">
            <span className="auth-icon"><Sparkles size={18} /></span>
            <h2 id="register-title">Create your account</h2>
            <p>Start your 14-day free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {authError && <p className="auth-alert auth-alert-error">{authError}</p>}
            {notice && <p className="auth-alert auth-alert-success">{notice}</p>}

            <div className="auth-inline-perks" aria-label="Included with your trial">
              {perks.map((perk) => (
                <span key={perk}>
                  <CheckCircle2 size={14} />
                  {perk}
                </span>
              ))}
            </div>

            <div className="auth-grid">
              <div className="auth-field">
                <label htmlFor="firstName">First name</label>
                <div className="auth-input-shell">
                  <UserRound size={17} />
                  <input
                    id="firstName"
                    {...register('firstName', { required: true })}
                    placeholder="Joao"
                    className="input auth-input"
                    autoComplete="given-name"
                  />
                </div>
                {errors.firstName && <p className="auth-error">First name is required.</p>}
              </div>

              <div className="auth-field">
                <label htmlFor="lastName">Last name</label>
                <div className="auth-input-shell">
                  <UserRound size={17} />
                  <input
                    id="lastName"
                    {...register('lastName', { required: true })}
                    placeholder="Silva"
                    className="input auth-input"
                    autoComplete="family-name"
                  />
                </div>
                {errors.lastName && <p className="auth-error">Last name is required.</p>}
              </div>
            </div>

            <div className="auth-grid">
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
                <label htmlFor="businessName">Business name</label>
                <div className="auth-input-shell">
                  <Building2 size={17} />
                  <input
                    id="businessName"
                    {...register('businessName')}
                    placeholder="Your Studio Name"
                    className="input auth-input"
                    autoComplete="organization"
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-shell">
                <LockKeyhole size={17} />
                <input
                  id="password"
                  {...register('password', { required: true, minLength: 8 })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Use at least 8 characters"
                  className="input auth-input"
                  autoComplete="new-password"
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
              {errors.password && <p className="auth-error">Use at least 8 characters.</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? <><VeloraLoader size={13} label={null} words={['.', '..', '...', '....', '.']} /> Creating account…</> : <>Create free account <ArrowRight size={16} /></>}
            </button>

            <p className="auth-legal">
              By creating an account you agree to our <a href="mailto:support@velora.app">Terms</a> and <a href="mailto:privacy@velora.app">Privacy Policy</a>.
            </p>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </motion.main>
    </div>
  )
}
