import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, CreditCard, CheckCircle2, Clock, AlertCircle, Send,
  X, Eye, RefreshCw, Calendar, MoreHorizontal, Download,
  Bell, Repeat,
} from 'lucide-react'

const CLIENTS = ['Acme Corporation', 'Sara Johnson', 'TechStart', 'Boutique XO', 'Lucas Müller']

const initialInvoices = [
  { id: 'INV-001', project: 'Webflow Redesign', client: 'Acme Corporation', amount: 1675, type: 'deposit', status: 'paid', due: '2026-03-15', paid: '2026-03-14', recurring: false, viewed: true, scheduled: null },
  { id: 'INV-002', project: 'Brand Identity', client: 'Sara Johnson', amount: 2100, type: 'final', status: 'paid', due: '2026-04-01', paid: '2026-03-30', recurring: false, viewed: true, scheduled: null },
  { id: 'INV-003', project: 'Mobile App UI', client: 'TechStart', amount: 2400, type: 'deposit', status: 'sent', due: '2026-04-20', paid: null, recurring: false, viewed: true, scheduled: null },
  { id: 'INV-004', project: 'E-commerce Site', client: 'Boutique XO', amount: 2600, type: 'deposit', status: 'overdue', due: '2026-04-08', paid: null, recurring: false, viewed: false, scheduled: null },
  { id: 'INV-005', project: 'Newsletter System', client: 'Lucas Müller', amount: 800, type: 'custom', status: 'draft', due: '2026-04-25', paid: null, recurring: false, viewed: false, scheduled: null },
  { id: 'INV-006', project: 'Monthly Retainer', client: 'Acme Corporation', amount: 600, type: 'recurring', status: 'sent', due: '2026-04-30', paid: null, recurring: true, viewed: true, scheduled: null, interval: 'monthly' },
]

const statusMeta = {
  paid: { label: 'Paid', icon: CheckCircle2, color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
  sent: { label: 'Sent', icon: Clock, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
  draft: { label: 'Draft', icon: CreditCard, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  scheduled: { label: 'Scheduled', icon: Calendar, color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },
}

function NewInvoiceModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    client: '', project: '', amount: '', type: 'custom', due: '',
    recurring: false, interval: 'monthly', scheduled: false, send_date: '',
    notes: '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    const id = `INV-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`
    onAdd({
      id, ...form, amount: Number(form.amount), paid: null, viewed: false,
      status: form.scheduled ? 'scheduled' : 'draft',
    })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="card" style={{ width: '100%', maxWidth: 520, padding: 32, maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>New Invoice</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Client *</label>
            <select className="input" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required>
              <option value="">Select client…</option>
              {CLIENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Project *</label>
            <input className="input" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} placeholder="e.g. Brand Identity" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Amount (€) *</label>
              <input className="input" type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="1500" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="deposit">Deposit (50%)</option>
                <option value="final">Final invoice</option>
                <option value="recurring">Recurring</option>
                <option value="custom">Custom amount</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due date</label>
            <input className="input" type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="Payment instructions, notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          {/* Recurring */}
          <div className="card" style={{ padding: '14px', background: 'var(--bg-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: form.recurring ? 12 : 0 }}>
              <div onClick={() => setForm(f => ({ ...f, recurring: !f.recurring }))}
                style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: form.recurring ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: form.recurring ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Repeat size={13} /> Recurring invoice
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-sends on a schedule (backend in Phase 1)</div>
              </div>
            </label>
            {form.recurring && (
              <div>
                <label className="label">Billing interval</label>
                <select className="input" value={form.interval} onChange={e => setForm(f => ({ ...f, interval: e.target.value }))}>
                  {[['weekly', 'Weekly'], ['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['yearly', 'Yearly']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Scheduled send */}
          <div className="card" style={{ padding: '14px', background: 'var(--bg-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: form.scheduled ? 12 : 0 }}>
              <div onClick={() => setForm(f => ({ ...f, scheduled: !f.scheduled }))}
                style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: form.scheduled ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: form.scheduled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} /> Schedule send date
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-send on a future date (Resend integration in Phase 1)</div>
              </div>
            </label>
            {form.scheduled && (
              <div>
                <label className="label">Send on</label>
                <input type="date" className="input" value={form.send_date} onChange={e => setForm(f => ({ ...f, send_date: e.target.value }))} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={14} /> Create invoice
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function Invoices() {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter(i => ['sent', 'draft', 'scheduled'].includes(i.status)).reduce((s, i) => s + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  function markPaid(id) { setInvoices(inv => inv.map(x => x.id === id ? { ...x, status: 'paid', paid: new Date().toISOString().split('T')[0] } : x)) }
  function sendNow(id) { setInvoices(inv => inv.map(x => x.id === id ? { ...x, status: 'sent' } : x)) }

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Invoices</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track payments · Stripe integration in Phase 1</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={15} /> New invoice
          </button>
        </div>
      </motion.div>

      {/* Revenue cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Collected', value: `€${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: '#4ade80' },
          { label: 'Pending', value: `€${totalPending.toLocaleString()}`, icon: Clock, color: '#fbbf24' },
          { label: 'Overdue', value: `€${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: '#f87171' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card" style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${s.color}25` }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={16} color={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['paid', 'Paid'], ['sent', 'Sent'], ['overdue', 'Overdue'], ['draft', 'Draft'], ['scheduled', 'Scheduled']].map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid',
            fontSize: '0.82rem', cursor: 'pointer',
            background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
            borderColor: filter === f ? 'rgba(99,102,241,0.4)' : 'var(--border)',
            color: filter === f ? '#818cf8' : 'var(--text-secondary)',
          }}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 120px 1fr 180px',
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          <span>Invoice</span><span>Project</span><span>Client</span><span>Amount</span><span>Due</span><span>Status</span>
        </div>
        {filtered.map((inv, i) => {
          const s = statusMeta[inv.status] || statusMeta.draft
          return (
            <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              style={{ display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 120px 1fr 180px',
                padding: '15px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {inv.id}
                {inv.recurring && <Repeat size={10} style={{ marginLeft: 4, color: '#818cf8', verticalAlign: 'middle' }} title="Recurring" />}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inv.project}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.client}</span>
              <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>€{inv.amount.toLocaleString()}</span>
              <span style={{ fontSize: '0.82rem', color: inv.status === 'overdue' ? '#f87171' : 'var(--text-secondary)' }}>
                {inv.due || '—'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.color }}>
                  <s.icon size={10} /> {s.label}
                </span>
                {inv.viewed && inv.status === 'sent' && (
                  <span title="Viewed" style={{ fontSize: '0.68rem', color: '#818cf8' }}><Eye size={11} /></span>
                )}
                {inv.status === 'sent' && (
                  <button onClick={() => markPaid(inv.id)} title="Mark as paid"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', padding: 2 }}>
                    <CheckCircle2 size={13} />
                  </button>
                )}
                {inv.status === 'sent' && (
                  <button title="Send reminder (Resend — Phase 1)"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                    <Bell size={12} />
                  </button>
                )}
                {inv.status === 'draft' && (
                  <button onClick={() => sendNow(inv.id)} title="Send now"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24', padding: 2 }}>
                    <Send size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recurring info banner */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#6366f108', border: '1px solid #6366f120', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Repeat size={15} color="#818cf8" />
        <p style={{ fontSize: '0.78rem', color: '#818cf8', margin: 0 }}>
          Recurring invoices auto-send via cron job · Stripe payment links · Resend email delivery — all in Phase 1
        </p>
      </div>

      <AnimatePresence>
        {showModal && <NewInvoiceModal onClose={() => setShowModal(false)} onAdd={(inv) => setInvoices(prev => [inv, ...prev])} />}
      </AnimatePresence>
    </div>
  )
}
