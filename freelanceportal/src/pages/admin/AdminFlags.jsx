import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Info } from 'lucide-react'

const STORAGE_KEY = 'velora-admin-flags'

const defaultFlags = [
  { key: 'portal_enabled', label: 'Client Portal', description: 'Enable /portal routes for clients via magic links', defaultOn: true },
  { key: 'stripe_payments', label: 'Stripe Payments', description: 'Show pay buttons in client invoices', defaultOn: false },
  { key: 'magic_links', label: 'Magic Link Auth', description: 'Send JWT magic links to clients', defaultOn: false },
  { key: 'custom_domain', label: 'Custom Domain', description: 'Allow freelancers to set a custom domain for their portal', defaultOn: false },
  { key: 'automations_engine', label: 'Automations Engine', description: 'Run automation rules and reminder sequences', defaultOn: false },
  { key: 'analytics_dashboard', label: 'Advanced Analytics', description: 'Show analytics tab in app sidebar', defaultOn: true },
  { key: 'pdf_generation', label: 'PDF Generation', description: 'Generate PDFs for contracts and invoices', defaultOn: false },
  { key: 'file_upload', label: 'File Upload to Supabase', description: 'Upload files to Supabase Storage', defaultOn: false },
  { key: 'resend_emails', label: 'Resend Emails', description: 'Send transactional emails via Resend', defaultOn: false },
  { key: 'pt_language', label: 'Portuguese Language', description: 'Enable Portuguese locale support', defaultOn: false },
  { key: 'zapier_webhooks', label: 'Zapier Webhooks', description: 'Outgoing webhooks for Zapier integration', defaultOn: false },
  { key: 'affiliate_program', label: 'Affiliate / Referral', description: 'Referral tracking and payout system', defaultOn: false },
  { key: 'public_api', label: 'Public API', description: 'REST API with API keys for integrations', defaultOn: false },
  { key: 'recurring_invoices', label: 'Recurring Invoices', description: 'Schedule recurring invoice generation', defaultOn: false },
]

function loadFlags() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return defaultFlags.reduce((acc, flag) => {
      acc[flag.key] = flag.key in stored ? stored[flag.key] : flag.defaultOn
      return acc
    }, {})
  } catch {
    return defaultFlags.reduce((acc, flag) => {
      acc[flag.key] = flag.defaultOn
      return acc
    }, {})
  }
}

function saveFlags(flags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: `1px solid ${on ? 'rgba(71,191,255,0.42)' : 'var(--border)'}`,
        cursor: 'pointer',
        background: on ? 'rgba(71,191,255,0.22)' : 'rgba(255,255,255,0.58)',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ duration: 0.18 }}
        style={{ position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: on ? 'var(--accent)' : 'var(--text-light)', boxShadow: '0 1px 4px rgba(0,0,0,0.16)' }}
      />
    </button>
  )
}

export default function AdminFlags() {
  const [flags, setFlags] = useState(loadFlags)

  const toggle = (key) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      saveFlags(next)
      return next
    })
  }

  const resetAll = () => {
    const defaults = defaultFlags.reduce((acc, flag) => {
      acc[flag.key] = flag.defaultOn
      return acc
    }, {})
    setFlags(defaults)
    saveFlags(defaults)
  }

  const enableAll = () => {
    const all = defaultFlags.reduce((acc, flag) => {
      acc[flag.key] = true
      return acc
    }, {})
    setFlags(all)
    saveFlags(all)
  }

  const activeCount = Object.values(flags).filter(Boolean).length

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Globe size={22} color="var(--accent)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Feature Flags</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Toggle features without code changes. Stored in localStorage - {activeCount}/{defaultFlags.length} active.
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button onClick={enableAll} className="btn-primary btn-sm">Enable all</button>
        <button onClick={resetAll} className="btn-secondary btn-sm">Reset to defaults</button>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18, padding: '12px 16px' }}>
        <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          These flags are admin-only UI controls for now. Move them to Supabase before enforcing them server-side.
        </span>
      </div>

      <div className="panel-soft" style={{ overflow: 'hidden' }}>
        {defaultFlags.map((flag, index) => (
          <motion.div
            key={flag.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="table-row"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: index < defaultFlags.length - 1 ? '1px solid var(--border-light)' : 'none' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>{flag.label}</span>
                {flag.defaultOn !== flags[flag.key] && <span className="badge badge-yellow">Modified</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{flag.description}</div>
            </div>
            <Toggle on={flags[flag.key]} onChange={() => toggle(flag.key)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
