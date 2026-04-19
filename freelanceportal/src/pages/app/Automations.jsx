import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Plus, X, Play, Pause, Trash2, Edit2,
  Mail, Bell, CheckSquare, FileText, CreditCard,
  Clock, ArrowRight, ChevronDown, ChevronRight, Check,
  AlertCircle, Calendar,
} from 'lucide-react'

const TRIGGERS = [
  { id: 'proposal_sent', label: 'Proposal sent', icon: FileText, group: 'Proposals' },
  { id: 'proposal_viewed', label: 'Proposal viewed', icon: FileText, group: 'Proposals' },
  { id: 'proposal_approved', label: 'Proposal approved', icon: FileText, group: 'Proposals' },
  { id: 'contract_sent', label: 'Contract sent', icon: FileText, group: 'Contracts' },
  { id: 'contract_signed', label: 'Contract signed', icon: FileText, group: 'Contracts' },
  { id: 'contract_expiring', label: 'Contract expiring (7 days)', icon: FileText, group: 'Contracts' },
  { id: 'invoice_sent', label: 'Invoice sent', icon: CreditCard, group: 'Invoices' },
  { id: 'invoice_viewed', label: 'Invoice viewed', icon: CreditCard, group: 'Invoices' },
  { id: 'invoice_paid', label: 'Invoice paid', icon: CreditCard, group: 'Invoices' },
  { id: 'invoice_overdue', label: 'Invoice overdue', icon: CreditCard, group: 'Invoices' },
  { id: 'client_created', label: 'New client added', icon: CheckSquare, group: 'Clients' },
  { id: 'booking_created', label: 'New booking', icon: Calendar, group: 'Scheduling' },
  { id: 'form_submitted', label: 'Form submitted', icon: FileText, group: 'Forms' },
]

const ACTIONS = [
  { id: 'send_email', label: 'Send email to client', icon: Mail },
  { id: 'send_reminder', label: 'Send reminder email', icon: Bell },
  { id: 'create_task', label: 'Create task', icon: CheckSquare },
  { id: 'send_portal_msg', label: 'Send portal message', icon: Mail },
  { id: 'wait_days', label: 'Wait N days then…', icon: Clock },
]

const INITIAL_AUTOMATIONS = [
  {
    id: 1, name: 'Welcome new client', active: true,
    trigger: 'client_created', action: 'send_email',
    description: 'Send a welcome email when a new client is added',
    runs: 6, lastRun: '2026-04-15',
  },
  {
    id: 2, name: 'Invoice overdue reminder', active: true,
    trigger: 'invoice_overdue', action: 'send_reminder',
    description: 'Send a payment reminder when an invoice becomes overdue',
    runs: 4, lastRun: '2026-04-16',
  },
  {
    id: 3, name: 'Contract signed → create task', active: true,
    trigger: 'contract_signed', action: 'create_task',
    description: 'Automatically create onboarding task when contract is signed',
    runs: 3, lastRun: '2026-04-10',
  },
  {
    id: 4, name: 'Proposal follow-up', active: false,
    trigger: 'proposal_viewed', action: 'wait_days',
    description: 'Wait 3 days after proposal view, then send follow-up email',
    runs: 0, lastRun: null,
  },
]

const LOG_ENTRIES = [
  { id: 1, automation: 'Invoice overdue reminder', status: 'success', entity: 'INV-004 · Boutique XO', time: '2 hours ago' },
  { id: 2, automation: 'Welcome new client', status: 'success', entity: 'Lucas Müller', time: '2 days ago' },
  { id: 3, automation: 'Contract signed → create task', status: 'success', entity: 'Acme Co. · Webflow Redesign', time: '1 week ago' },
  { id: 4, automation: 'Invoice overdue reminder', status: 'failed', entity: 'INV-002 · Sara Johnson', time: '1 week ago' },
]

const EMPTY_FORM = { name: '', trigger: 'invoice_overdue', action: 'send_email', description: '' }

export default function Automations() {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS)
  const [tab, setTab] = useState('automations') // automations | logs
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function openNew() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }
  function openEdit(a) { setForm({ name: a.name, trigger: a.trigger, action: a.action, description: a.description }); setEditId(a.id); setShowModal(true) }

  function saveAutomation(e) {
    e.preventDefault()
    if (editId) {
      setAutomations(a => a.map(x => x.id === editId ? { ...x, ...form } : x))
    } else {
      setAutomations(a => [...a, { id: Date.now(), ...form, active: false, runs: 0, lastRun: null }])
    }
    setShowModal(false)
  }

  function toggleAutomation(id) { setAutomations(a => a.map(x => x.id === id ? { ...x, active: !x.active } : x)) }
  function deleteAutomation(id) { setAutomations(a => a.filter(x => x.id !== id)) }

  function getTriggerLabel(id) { return TRIGGERS.find(t => t.id === id)?.label || id }
  function getActionLabel(id) { return ACTIONS.find(a => a.id === id)?.label || id }
  const TriggerIcon = (id) => TRIGGERS.find(t => t.id === id)?.icon || Zap
  const ActionIcon = (id) => ACTIONS.find(a => a.id === id)?.icon || Zap

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Automations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Automate repetitive workflows and reminders</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNew}>
          <Plus size={16} /> New automation
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[['automations', 'Automations'], ['logs', 'Run logs']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {/* Automations list */}
      {tab === 'automations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {automations.map(auto => {
            const TIcon = TriggerIcon(auto.trigger)
            const AIcon = ActionIcon(auto.action)
            return (
              <motion.div key={auto.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Toggle */}
                  <div onClick={() => toggleAutomation(auto.id)}
                    style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: auto.active ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: auto.active ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </div>

                  {/* Trigger → Action flow */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>{auto.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.775rem', padding: '3px 9px', borderRadius: 6, background: '#6366f115', color: '#818cf8' }}>
                          <TIcon size={11} /> {getTriggerLabel(auto.trigger)}
                        </span>
                        <ArrowRight size={12} color="var(--text-muted)" />
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.775rem', padding: '3px 9px', borderRadius: 6, background: '#22c55e15', color: '#22c55e' }}>
                          <AIcon size={11} /> {getActionLabel(auto.action)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{auto.runs} runs</div>
                    {auto.lastRun && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last: {auto.lastRun}</div>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(auto)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteAutomation(auto.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Templates */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Suggested automations</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {[
                { name: 'Invoice +1 day reminder', trigger: 'invoice_overdue', action: 'send_reminder' },
                { name: 'Proposal follow-up (3 days)', trigger: 'proposal_viewed', action: 'send_email' },
                { name: 'Welcome email on new client', trigger: 'client_created', action: 'send_email' },
                { name: 'Booking confirmation', trigger: 'booking_created', action: 'send_email' },
              ].map(tmpl => (
                <button key={tmpl.name} onClick={() => { setForm({ ...EMPTY_FORM, ...tmpl, name: tmpl.name }); setEditId(null); setShowModal(true) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <Plus size={14} color="var(--accent)" />
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Run logs */}
      {tab === 'logs' && (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Automation', 'Entity', 'Status', 'Time'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOG_ENTRIES.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{log.automation}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>{log.entity}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, background: log.status === 'success' ? '#22c55e20' : '#ef444420', color: log.status === 'success' ? '#22c55e' : '#ef4444', width: 'fit-content' }}>
                      {log.status === 'success' ? <Check size={11} /> : <AlertCircle size={11} />}
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 500, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editId ? 'Edit automation' : 'New automation'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={saveAutomation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="label">Automation name</label>
                  <input className="input" placeholder="e.g. Invoice overdue reminder" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>

                {/* Visual trigger → action */}
                <div className="card" style={{ padding: '16px', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>When (trigger)</div>
                      <select className="input" value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                        {Object.entries(TRIGGERS.reduce((acc, t) => { if (!acc[t.group]) acc[t.group] = []; acc[t.group].push(t); return acc }, {})).map(([group, items]) => (
                          <optgroup key={group} label={group}>
                            {items.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 20 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Then (action)</div>
                      <select className="input" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
                        {ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Description (optional)</label>
                  <input className="input" placeholder="What does this automation do?" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="card" style={{ padding: '12px 14px', background: '#6366f108', border: '1px solid #6366f120' }}>
                  <p style={{ fontSize: '0.775rem', color: '#818cf8', margin: 0 }}>
                    Email content and advanced conditions will be configurable in Phase 1 when the backend is connected.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {editId ? 'Save changes' : 'Create automation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
