import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Save, Settings2 } from 'lucide-react'

const STORAGE_KEY = 'velora-admin-config'

function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function Field({ label, value, onChange, type = 'text', placeholder, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input" />
      {hint && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 5 }}>{hint}</div>}
    </div>
  )
}

function Section({ title, children, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card" style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
        {title}
      </div>
      {children}
    </motion.div>
  )
}

export default function AdminConfig() {
  const [config, setConfig] = useState(loadConfig)
  const [saved, setSaved] = useState(false)

  const set = (key, value) => setConfig((current) => ({ ...current, [key]: value }))

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Settings2 size={22} color="var(--accent)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Platform Config</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Operator-level configuration stored in admin localStorage.</p>
      </motion.div>

      <Section title="Platform Identity" delay={0.04}>
        <Field label="Platform Name" value={config.platformName} onChange={(value) => set('platformName', value)} placeholder="Velora" hint="Displayed in the admin panel header and system emails." />
        <Field label="Support Email" value={config.supportEmail} onChange={(value) => set('supportEmail', value)} placeholder="support@velora.app" type="email" />
        <Field label="Platform Domain" value={config.platformDomain} onChange={(value) => set('platformDomain', value)} placeholder="velora.app" />
      </Section>

      <Section title="Pricing" delay={0.07}>
        <Field label="Starter Price (EUR/month)" value={config.starterPrice} onChange={(value) => set('starterPrice', value)} placeholder="15" type="number" />
        <Field label="Starter Price (EUR/year)" value={config.starterYearlyPrice} onChange={(value) => set('starterYearlyPrice', value)} placeholder="126" type="number" />
        <Field label="Pro Price (EUR/month)" value={config.proPrice} onChange={(value) => set('proPrice', value)} placeholder="29" type="number" />
        <Field label="Pro Price (EUR/year)" value={config.proYearlyPrice} onChange={(value) => set('proYearlyPrice', value)} placeholder="242" type="number" />
        <Field label="Studio Price (EUR/month)" value={config.studioPrice} onChange={(value) => set('studioPrice', value)} placeholder="59" type="number" />
        <Field label="Studio Price (EUR/year)" value={config.studioYearlyPrice} onChange={(value) => set('studioYearlyPrice', value)} placeholder="499" type="number" />
        <Field label="Starter Portal Limit" value={config.starterPortalLimit} onChange={(value) => set('starterPortalLimit', value)} placeholder="3" type="number" />
        <Field label="Starter Storage (GB)" value={config.starterStorage} onChange={(value) => set('starterStorage', value)} placeholder="5" type="number" />
        <Field label="Pro Storage (GB)" value={config.proStorage} onChange={(value) => set('proStorage', value)} placeholder="20" type="number" />
        <Field label="Studio Storage (GB)" value={config.studioStorage} onChange={(value) => set('studioStorage', value)} placeholder="100" type="number" />
      </Section>

      <Section title="Integrations" delay={0.10}>
        <Field label="Supabase Project URL" value={config.supabaseUrl} onChange={(value) => set('supabaseUrl', value)} placeholder="https://xxx.supabase.co" hint="For reference only. Production values belong in environment variables." />
        <Field label="Resend API Key" value={config.resendKey} onChange={(value) => set('resendKey', value)} placeholder="re_..." />
        <Field label="Magic Link Expiry (days)" value={config.magicLinkExpiry} onChange={(value) => set('magicLinkExpiry', value)} placeholder="30" type="number" />
      </Section>

      <Section title="Growth Targets" delay={0.13}>
        <Field label="Target MRR (EUR)" value={config.targetMrr} onChange={(value) => set('targetMrr', value)} placeholder="21750" type="number" />
        <Field label="Target Users" value={config.targetUsers} onChange={(value) => set('targetUsers', value)} placeholder="750" type="number" />
        <Field label="Exit Multiple" value={config.exitMultiple} onChange={(value) => set('exitMultiple', value)} placeholder="4" type="number" />
        <Field label="Target Timeline (years)" value={config.targetYears} onChange={(value) => set('targetYears', value)} placeholder="3" type="number" />
      </Section>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
        <button onClick={save} className={saved ? 'btn-secondary' : 'btn-primary'}>
          {saved ? <><Check size={14} /> Saved to localStorage</> : <><Save size={14} /> Save config</>}
        </button>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>Move this to a Supabase admin table before enforcing it server-side.</div>
      </motion.div>
    </div>
  )
}
