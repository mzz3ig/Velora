import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Palette, Bell, CreditCard, Globe, Save, Check } from 'lucide-react'
import { useSettingsStore } from '../../store'

const tabs = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'domain', label: 'Custom Domain', icon: Globe },
]

const brandColors = ['#a98252', '#bca57d', '#ec4899', '#f59e0b', '#22c55e', '#14b8a6', '#8f6d43', '#ef4444']

function BrandingTab() {
  const { branding, updateBranding } = useSettingsStore()
  const [local, setLocal] = useState({ ...branding })
  const [saved, setSaved] = useState(false)

  const save = () => {
    updateBranding(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Brand Identity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Business name</label>
            <input className="input" value={local.businessName} onChange={e => setLocal(l => ({ ...l, businessName: e.target.value }))} style={{ maxWidth: 380 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Shown on all client-facing pages and emails</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Logo</label>
            <div style={{
              width: 140, height: 80, borderRadius: 8, border: '2px dashed var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload logo</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>PNG/SVG, max 2MB</span>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Brand color</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {brandColors.map(c => (
                <div key={c} onClick={() => setLocal(l => ({ ...l, brandColor: c }))} style={{
                  width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: local.brandColor === c ? '3px solid white' : '3px solid transparent',
                  boxShadow: local.brandColor === c ? `0 0 0 2px ${c}` : 'none',
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email sender name</label>
            <input className="input" value={local.emailSenderName} onChange={e => setLocal(l => ({ ...l, emailSenderName: e.target.value }))} style={{ maxWidth: 380 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Shown as the sender on all client emails</p>
          </div>
        </div>
        <button onClick={save} className="btn-primary" style={{ marginTop: 24, padding: '10px 24px' }}>
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save changes</>}
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Portal Preview</h3>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 8, padding: 20, border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: local.brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>R</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{local.businessName}</span>
          </div>
          <div style={{ background: local.brandColor, borderRadius: 8, padding: '10px 18px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
            Accept proposal
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountTab() {
  const { account, updateAccount } = useSettingsStore()
  const [local, setLocal] = useState({ ...account })
  const [saved, setSaved] = useState(false)

  const save = () => {
    updateAccount(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>First name</label>
              <input className="input" value={local.firstName} onChange={e => setLocal(l => ({ ...l, firstName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Last name</label>
              <input className="input" value={local.lastName} onChange={e => setLocal(l => ({ ...l, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email address</label>
            <input className="input" type="email" value={local.email} onChange={e => setLocal(l => ({ ...l, email: e.target.value }))} style={{ maxWidth: 380 }} />
          </div>
        </div>
        <button onClick={save} className="btn-primary" style={{ marginTop: 20, padding: '10px 24px' }}>
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save profile</>}
        </button>
      </div>
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Current password</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>New password</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm new password</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <button className="btn-primary" style={{ padding: '10px 24px', alignSelf: 'flex-start' }}>Update password</button>
        </div>
      </div>
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#f87171' }}>Danger Zone</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>Once you delete your account, all data will be permanently removed. This action cannot be undone.</p>
        <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          Delete account
        </button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const { notifications, updateNotifications } = useSettingsStore()

  const toggle = (key) => updateNotifications({ [key]: !notifications[key] })

  const items = [
    { key: 'proposalAccepted', label: 'Proposal accepted', desc: 'When a client accepts your proposal' },
    { key: 'contractSigned', label: 'Contract signed', desc: 'When a client signs a contract' },
    { key: 'paymentReceived', label: 'Payment received', desc: 'When a payment is processed via Stripe' },
    { key: 'newMessage', label: 'New message', desc: 'When a client sends you a message' },
    { key: 'invoiceOverdue', label: 'Invoice overdue', desc: 'When an invoice passes its due date' },
    { key: 'weeklyReport', label: 'Weekly summary', desc: 'A weekly summary of activity and revenue' },
  ]

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Email Notifications</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div key={item.key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
            <div onClick={() => toggle(item.key)} style={{
              width: 44, height: 24, borderRadius: 999, cursor: 'pointer',
              background: notifications[item.key] ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: notifications[item.key] ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BillingTab() {
  const { billing } = useSettingsStore()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Current Plan</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>You are on the {billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)} plan</p>
          </div>
          <div style={{ background: 'var(--accent)', borderRadius: 8, padding: '5px 14px', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{billing.plan.toUpperCase()}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Active portals', value: `${billing.portalsUsed} / unlimited` },
            { label: 'Storage used', value: `${billing.storageUsed} GB / 20 GB` },
            { label: 'Next billing', value: billing.nextBilling },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ padding: '9px 20px' }}>Manage subscription</button>
          <button className="btn-ghost" style={{ padding: '9px 20px' }}>Download invoices</button>
        </div>
      </div>
    </div>
  )
}

function DomainTab() {
  const { domain, updateDomain } = useSettingsStore()
  const [value, setValue] = useState(domain.customDomain || '')
  const [saved, setSaved] = useState(false)

  const connect = () => {
    updateDomain({ customDomain: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Custom Domain</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.65 }}>
        Connect your own domain so clients access their portal at <strong>clients.yourname.com</strong> instead of a Velora subdomain.
      </p>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Your custom domain</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" placeholder="clients.yourname.com" value={value} onChange={e => setValue(e.target.value)} style={{ maxWidth: 300 }} />
          <button onClick={connect} className="btn-primary" style={{ padding: '0 20px', flexShrink: 0 }}>
            {saved ? <><Check size={14} /> Saved</> : 'Connect'}
          </button>
        </div>
        {domain.customDomain && <p style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: 6 }}>✓ Connected: {domain.customDomain}</p>}
      </div>
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DNS Setup Instructions</div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Add a CNAME record to your DNS provider pointing to:</p>
        <code style={{ background: 'rgba(169,130,82,0.1)', border: '1px solid rgba(169,130,82,0.2)', borderRadius: 6, padding: '6px 12px', fontSize: '0.82rem', color: '#a98252', display: 'block' }}>
          portal.velora.com
        </code>
      </div>
    </div>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('branding')

  const renderTab = () => {
    switch (activeTab) {
      case 'branding': return <BrandingTab />
      case 'account': return <AccountTab />
      case 'notifications': return <NotificationsTab />
      case 'billing': return <BillingTab />
      case 'domain': return <DomainTab />
      default: return null
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your account, branding, and preferences</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              style={{ justifyContent: 'flex-start', border: 'none', width: '100%' }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {renderTab()}
        </motion.div>
      </div>
    </div>
  )
}
