import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Home, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import VeloraLoader from '../../components/ui/VeloraLoader'

export default function ResetPassword() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async ({ password }) => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/login', { state: { notice: 'Password updated. Please sign in.' } })
  }

  return (
    <div className="auth-page auth-page-login">
      <motion.main className="auth-panel-wrap" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <div className="auth-topbar">
          <Link to="/" className="auth-brand" aria-label="Velora home">
            <img src="/velora-logo-wordmark-transparent.png" alt="Velora" className="auth-brand-wordmark" />
          </Link>
          <div className="auth-topbar-actions">
            <Link to="/" className="auth-home-link"><Home size={15} /> Home</Link>
          </div>
        </div>

        <section className="auth-panel" aria-labelledby="reset-title">
          <div className="auth-panel-heading">
            <span className="auth-icon"><ShieldCheck size={18} /></span>
            <h2 id="reset-title">Set a new password</h2>
            <p>Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {error && <p className="auth-alert auth-alert-error">{error}</p>}
            <div className="auth-field">
              <label htmlFor="password">New password</label>
              <div className="auth-input-shell">
                <LockKeyhole size={17} />
                <input id="password" {...register('password', { required: true, minLength: 8 })} type={showPass ? 'text' : 'password'} placeholder="At least 8 characters" className="input auth-input" autoComplete="new-password" />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide' : 'Show'}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="auth-error">Use at least 8 characters.</p>}
            </div>
            <div className="auth-field">
              <label htmlFor="confirm">Confirm new password</label>
              <div className="auth-input-shell">
                <LockKeyhole size={17} />
                <input id="confirm" {...register('confirm', { required: true, validate: v => v === getValues('password') || 'Passwords do not match' })} type={showPass ? 'text' : 'password'} placeholder="Repeat password" className="input auth-input" autoComplete="new-password" />
              </div>
              {errors.confirm && <p className="auth-error">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? <><VeloraLoader size={13} label={null} words={['.', '..', '...', '....', '.']} /> Updating…</> : 'Update password'}
            </button>
          </form>
        </section>
      </motion.main>
    </div>
  )
}
