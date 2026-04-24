import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../store'
import { createSubscriptionCheckout, createBillingPortal } from '../../lib/api'
import VeloraLoader from '../../components/ui/VeloraLoader'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: '€15/mês',
    color: '#6366f1',
    features: ['3 portais ativos', '5GB de armazenamento', 'Subdomínio Velora'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '€29/mês',
    color: '#8b5cf6',
    features: ['Portais ilimitados', 'Domínio personalizado', '20GB', 'Automações', 'Analytics'],
  },
]

export default function SubscriptionBlocked({ reason }) {
  const navigate = useNavigate()
  const { billing } = useSettingsStore((s) => ({ billing: s.billing }))
  const [loading, setLoading] = useState('')
  const [err, setErr] = useState('')

  const isPaymentFailed = reason === 'past_due' || billing?.paymentState === 'payment_failed'

  async function subscribe(plan) {
    setErr('')
    setLoading(plan)
    try {
      const { url } = await createSubscriptionCheckout({ plan, interval: 'monthly', trialDays: 0 })
      window.location.href = url
    } catch (e) {
      setErr(e.message || 'Erro ao iniciar subscrição.')
    } finally {
      setLoading('')
    }
  }

  async function openPortal() {
    setErr('')
    setLoading('portal')
    try {
      const { url } = await createBillingPortal({ returnUrl: window.location.href })
      window.location.href = url
    } catch (e) {
      setErr(e.message || 'Erro ao abrir portal.')
    } finally {
      setLoading('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Ambient orb */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16, marginBottom: 20,
            background: isPaymentFailed ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
            border: `1px solid ${isPaymentFailed ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
          }}>
            {isPaymentFailed ? (
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
            ) : (
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            )}
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: 10 }}>
            {isPaymentFailed ? 'Pagamento falhado' : 'O teu período de trial terminou'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            {isPaymentFailed
              ? 'O pagamento da tua subscrição falhou. Atualiza o método de pagamento para continuar a usar o Velora.'
              : 'O teu trial de 14 dias terminou. Escolhe um plano para continuar a aceder à plataforma e aos teus dados.'}
          </p>
        </div>

        {err && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#f87171', marginBottom: 20, textAlign: 'center' }}>
            {err}
          </div>
        )}

        {isPaymentFailed ? (
          <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 20 }}>
              Os teus dados estão seguros. Resolve o pagamento no portal de faturação para recuperar o acesso imediatamente.
            </p>
            <button
              onClick={openPortal}
              disabled={loading === 'portal'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#6366f1', color: 'white', fontWeight: 700, fontSize: '0.95rem',
              }}
            >
              {loading === 'portal' ? <VeloraLoader size={14} label={null} words={['.', '..', '...']} /> : null}
              Gerir método de pagamento
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {PLANS.map((plan) => (
              <div key={plan.key} style={{
                background: '#12121a',
                border: `1px solid ${plan.key === 'pro' ? plan.color + '50' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: 20,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>{plan.name}</h3>
                  <span style={{ color: plan.color, fontWeight: 800, fontSize: '1.1rem' }}>{plan.price}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill={plan.color + '20'}/>
                        <polyline points="3.5,7 5.5,9 10.5,4.5" fill="none" stroke={plan.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => subscribe(plan.key)}
                  disabled={!!loading}
                  style={{
                    padding: '10px 0', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: plan.color, color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading && loading !== plan.key ? 0.6 : 1,
                  }}
                >
                  {loading === plan.key ? <VeloraLoader size={12} label={null} words={['.', '..', '...']} /> : null}
                  Escolher {plan.name}
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: 20 }}>
          Os teus dados estão seguros e serão restaurados ao ativar um plano.{' '}
          <button
            onClick={() => navigate('/app/settings')}
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
          >
            Ver definições
          </button>
        </p>
      </div>
    </div>
  )
}
