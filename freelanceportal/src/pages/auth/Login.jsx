import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async () => {
    setLoading(true)
    // Simulate auth
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    navigate('/app/dashboard')
  }

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
        style={{ width: '100%', maxWidth: 420, position: 'relative' }}
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
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>
            Sign in to your Velora account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email address
              </label>
              <input
                {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                type="email"
                placeholder="you@example.com"
                className="input"
              />
              {errors.email && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 4 }}>Valid email required</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', { required: true, minLength: 6 })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 4 }}>Min 6 characters</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
            <div style={{ height: 1, background: 'var(--border)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ background: 'var(--surface)', padding: '0 12px', fontSize: '0.8rem', color: 'var(--text-muted)', position: 'relative' }}>
              or
            </span>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
