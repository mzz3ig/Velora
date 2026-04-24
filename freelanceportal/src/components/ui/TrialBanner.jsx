import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../store'

const WARN_DAYS = 7 // show banner when <= this many days remain

export default function TrialBanner() {
  const navigate = useNavigate()
  const billing = useSettingsStore((s) => s.billing)
  const [dismissed, setDismissed] = useState(false)

  const status = billing?.subscriptionStatus
  const trialEndsAt = billing?.trialEndsAt ? new Date(billing.trialEndsAt) : null
  const now = new Date()

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)))
    : null

  const isPaymentFailed = billing?.paymentState === 'payment_failed'

  const showBanner =
    !dismissed &&
    (
      isPaymentFailed ||
      (status === 'trialing' && daysLeft !== null && daysLeft <= WARN_DAYS)
    )

  if (!showBanner) return null

  const urgentColor = daysLeft !== null && daysLeft <= 3 ? '#ef4444' : '#f59e0b'
  const bg = isPaymentFailed ? 'rgba(239,68,68,0.08)' : `${urgentColor}12`
  const border = isPaymentFailed ? 'rgba(239,68,68,0.25)' : `${urgentColor}35`
  const textColor = isPaymentFailed ? '#f87171' : urgentColor

  const message = isPaymentFailed
    ? 'O pagamento da tua subscrição falhou. Atualiza o método de pagamento para evitar perder o acesso.'
    : daysLeft === 0
      ? 'O teu trial termina hoje! Ativa um plano para continuar.'
      : `O teu trial termina em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}. Ativa um plano para não perder o acesso.`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 20px', gap: 12,
      background: bg, borderBottom: `1px solid ${border}`,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={textColor} strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
        <span style={{ fontSize: '0.855rem', color: textColor, fontWeight: 500 }}>{message}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/app/settings?tab=billing')}
          style={{
            padding: '6px 14px', borderRadius: 6, border: `1px solid ${textColor}50`,
            background: `${textColor}15`, color: textColor,
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {isPaymentFailed ? 'Gerir pagamento' : 'Ativar plano'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: textColor, opacity: 0.7, padding: 4, display: 'flex',
          }}
          aria-label="Fechar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2l10 10M12 2L2 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
