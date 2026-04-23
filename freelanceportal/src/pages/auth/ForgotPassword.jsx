import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Home, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import VeloraLoader from '../../components/ui/VeloraLoader'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async ({ email }) => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="auth-page auth-page-login">
      <motion.main className="auth-panel-wrap" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <div className="auth-topbar">
          <Link to="/" className="auth-brand" aria-label="Velora home">
            <img src="/logo.png" alt="Velora" className="auth-brand-wordmark" />
          </Link>
          <div className="auth-topbar-actions">
            <Link to="/" className="auth-home-link"><Home size={15} /> Home</Link>
            <Link to="/login" className="auth-topbar-link">Sign in</Link>
          </div>
        </div>

        <section className="auth-panel" aria-labelledby="forgot-title">
          <div className="auth-panel-heading">
            <span className="auth-icon"><ShieldCheck size={18} /></span>
            <h2 id="forgot-title">Reset your password</h2>
            <p>We'll send a reset link to your email address.</p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail size={24} color="#22c55e" />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Check your inbox</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                We sent a password reset link. Check your email and follow the instructions.
              </p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {error && <p className="auth-alert auth-alert-error">{error}</p>}
              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <div className="auth-input-shell">
                  <Mail size={17} />
                  <input id="email" {...register('email', { required: true, pattern: /^\S+@\S+$/i })} type="email" placeholder="you@example.com" className="input auth-input" autoComplete="email" />
                </div>
                {errors.email && <p className="auth-error">Enter a valid email address.</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary auth-submit">
                {loading ? <><VeloraLoader size={13} label={null} words={['.', '..', '...', '....', '.']} /> Sending…</> : 'Send reset link'}
              </button>
              <p className="auth-switch">
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={13} /> Back to sign in</Link>
              </p>
            </form>
          )}
        </section>
      </motion.main>
    </div>
  )
}
