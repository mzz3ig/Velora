import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

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

    navigate('/app/dashboard')
  }

  const perks = [
    '14-day free trial, no credit card',
    'Full access to all Pro features',
    'Cancel anytime, no lock-in',
  ]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
      background: 'transparent',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 460, position: 'relative' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/velora-logo.png" alt="Velora" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Velora</span>
          </Link>
        </div>

        <div className="glass" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: 36,
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6, letterSpacing: 0 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Start your 14-day free trial. No credit card required.
          </p>

          {/* Perks */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {perks.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={12} color="#4ade80" />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{p}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {authError && (
              <p style={{ fontSize: '0.82rem', color: '#f87171', margin: 0 }}>
                {authError}
              </p>
            )}
            {notice && (
              <p style={{ fontSize: '0.82rem', color: '#22c55e', margin: 0 }}>
                {notice}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>First name</label>
                <input {...register('firstName', { required: true })} placeholder="João" className="input" />
                {errors.firstName && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 4 }}>Required</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Last name</label>
                <input {...register('lastName', { required: true })} placeholder="Silva" className="input" />
                {errors.lastName && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 4 }}>Required</p>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email address</label>
              <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} type="email" placeholder="you@example.com" className="input" />
              {errors.email && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 4 }}>Valid email required</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Business name</label>
              <input {...register('businessName')} placeholder="Your Studio Name" className="input" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', { required: true, minLength: 8 })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="input"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 4 }}>Min 8 characters</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : <>Create free account <ArrowRight size={15} /></>}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms</a>
              {' '}and{' '}
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</a>.
            </p>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
