import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CreditCard, CheckCircle2, Clock, AlertCircle, Send, X, Eye, Repeat, Calendar, Download, Bell, Trash2 } from 'lucide-react'
import { useInvoiceStore, useClientStore, useNotificationStore } from '../../store'
import { createPortalLink } from '../../lib/portal'

const statusMeta = {
  paid: { label: 'Paid', icon: CheckCircle2, color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
  sent: { label: 'Sent', icon: Clock, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
  draft: { label: 'Draft', icon: CreditCard, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  scheduled: { label: 'Scheduled', icon: Calendar, color: '#9a7850', bg: 'rgba(129,140,248,0.15)' },
}

function NewInvoiceModal({ onClose }) {
  const { addInvoice } = useInvoiceStore()
  const { clients } = useClientStore()
  const [form, setForm] = useState({ client: '', clientId: null, project: '', amount: '', discount: 0, tax: 23, type: 'custom', due: '', recurring: false, interval: 'monthly', scheduled: false, send_date: '', notes: '', paymentUrl: '' })

  function handleSubmit(e) {
    e.preventDefault()
    const client = clients.find(c => c.id === parseInt(form.clientId))
    addInvoice({ ...form, amount: Number(form.amount), discount: Number(form.discount), tax: Number(form.tax), client: client?.name || form.client, clientId: client?.id || null, status: form.scheduled ? 'scheduled' : 'draft' })
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
          <div><label className="label">Client *</label>
            <select className="input" value={form.clientId || ''} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
              <option value="">Select client…</option>
              {clients.filter(c=>c.status==='active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Project *</label><input className="input" value={form.project} onChange={e => setForm(f=>({...f,project:e.target.value}))} placeholder="e.g. Brand Identity" required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Amount (€) *</label><input className="input" type="number" min="0" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} placeholder="1500" required /></div>
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                <option value="deposit">Deposit (50%)</option>
                <option value="final">Final invoice</option>
                <option value="recurring">Recurring</option>
                <option value="custom">Custom amount</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Discount (%)</label><input className="input" type="number" min="0" max="100" value={form.discount} onChange={e => setForm(f=>({...f,discount:e.target.value}))} /></div>
            <div><label className="label">Tax / IVA (%)</label><input className="input" type="number" min="0" max="100" value={form.tax} onChange={e => setForm(f=>({...f,tax:e.target.value}))} /></div>
          </div>
          <div><label className="label">Due date</label><input className="input" type="date" value={form.due} onChange={e => setForm(f=>({...f,due:e.target.value}))} /></div>
          <div><label className="label">Payment link</label><input className="input" type="url" value={form.paymentUrl} onChange={e => setForm(f=>({...f,paymentUrl:e.target.value}))} placeholder="https://buy.stripe.com/..." /></div>
          <div><label className="label">Notes (optional)</label><input className="input" placeholder="Payment instructions, notes..." value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>

          <div className="card" style={{ padding: '14px', background: 'var(--bg-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: form.recurring ? 12 : 0 }}>
              <div onClick={() => setForm(f=>({...f,recurring:!f.recurring}))} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: form.recurring ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: form.recurring ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Repeat size={13} /> Recurring invoice</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-sends on a schedule (Phase 1)</div>
              </div>
            </label>
            {form.recurring && (
              <div><label className="label">Billing interval</label>
                <select className="input" value={form.interval} onChange={e => setForm(f=>({...f,interval:e.target.value}))}>
                  {[['weekly','Weekly'],['monthly','Monthly'],['quarterly','Quarterly'],['yearly','Yearly']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '14px', background: 'var(--bg-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: form.scheduled ? 12 : 0 }}>
              <div onClick={() => setForm(f=>({...f,scheduled:!f.scheduled}))} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: form.scheduled ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: form.scheduled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Schedule send date</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-send on a future date (Phase 1)</div>
              </div>
            </label>
            {form.scheduled && (
              <div><label className="label">Send on</label><input type="date" className="input" value={form.send_date} onChange={e => setForm(f=>({...f,send_date:e.target.value}))} /></div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={14} /> Create invoice</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function exportCSV(invoices) {
  const header = 'ID,Project,Client,Amount,Discount,Tax,Net,Status,Due,Paid\n'
  const rows = invoices.map(inv => {
    const discounted = inv.amount * (1 - (inv.discount || 0) / 100)
    const net = discounted * (1 + (inv.tax || 0) / 100)
    return `${inv.id},"${inv.project}","${inv.client}",${inv.amount},${inv.discount || 0}%,${inv.tax || 0}%,€${net.toFixed(2)},${inv.status},${inv.due || ''},${inv.paid || ''}`
  }).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function Invoices() {
  const { invoices, markPaid, sendNow, deleteInvoice } = useInvoiceStore()
  const { addNotification } = useNotificationStore()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [portalUrl, setPortalUrl] = useState('')
  const [portalError, setPortalError] = useState('')

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter(i => ['sent','draft','scheduled'].includes(i.status)).reduce((s, i) => s + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  const handleMarkPaid = (inv) => {
    markPaid(inv.id)
    addNotification({ type: 'payment', text: `Payment received — €${inv.amount.toLocaleString()} from ${inv.client}` })
  }

  const computeNet = (inv) => {
    const discounted = inv.amount * (1 - (inv.discount || 0) / 100)
    return discounted * (1 + (inv.tax || 0) / 100)
  }

  const createInvoicePortalLink = async (inv) => {
    setPortalError('')
    setPortalUrl('')
    try {
      const link = await createPortalLink({ clientId: inv.clientId, projectId: inv.projectId || null, expiresInDays: 30 })
      setPortalUrl(link.url)
    } catch (error) {
      setPortalError(error.message || 'Could not create a portal link.')
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Invoices</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track payments · Stripe integration in Phase 1</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => exportCSV(invoices)}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={15} /> New invoice
          </button>
        </div>
      </motion.div>

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

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all','All'],['paid','Paid'],['sent','Sent'],['overdue','Overdue'],['draft','Draft'],['scheduled','Scheduled']].map(([f,l]) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: '0.82rem', cursor: 'pointer', background: filter === f ? 'rgba(169,130,82,0.15)' : 'transparent', borderColor: filter === f ? 'rgba(169,130,82,0.4)' : 'var(--border)', color: filter === f ? '#9a7850' : 'var(--text-secondary)' }}>{l}</button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 130px 1fr 190px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          <span>Invoice</span><span>Project</span><span>Client</span><span>Amount</span><span>Due</span><span>Status</span>
        </div>
        {filtered.map((inv, i) => {
          const s = statusMeta[inv.status] || statusMeta.draft
          const net = computeNet(inv)
          return (
            <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              style={{ display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 130px 1fr 190px', padding: '15px 20px', borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {inv.id}
                {inv.recurring && <Repeat size={10} style={{ marginLeft: 4, color: '#9a7850', verticalAlign: 'middle' }} />}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inv.project}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.client}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>€{net.toFixed(2)}</div>
                {(inv.discount > 0 || inv.tax > 0) && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {inv.discount > 0 && `-${inv.discount}% `}{inv.tax > 0 && `IVA ${inv.tax}%`}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.82rem', color: inv.status === 'overdue' ? '#f87171' : 'var(--text-secondary)' }}>{inv.due || '—'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.color }}>
                  <s.icon size={10} /> {s.label}
                </span>
                {inv.viewed && inv.status === 'sent' && <span title="Viewed" style={{ fontSize: '0.68rem', color: '#9a7850' }}><Eye size={11} /></span>}
                {inv.status === 'sent' && (
                  <button onClick={() => handleMarkPaid(inv)} title="Mark as paid" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', padding: 2 }}><CheckCircle2 size={13} /></button>
                )}
                {(inv.status === 'sent' || inv.status === 'overdue') && (
                  <button title="Send reminder (Phase 1)" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Bell size={12} /></button>
                )}
                {inv.status === 'draft' && (
                  <button onClick={() => sendNow(inv.id)} title="Send now" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24', padding: 2 }}><Send size={12} /></button>
                )}
                {inv.status !== 'draft' && (
                  <button onClick={() => createInvoicePortalLink(inv)} title="Create portal link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Send size={12} /></button>
                )}
                <button onClick={() => deleteInvoice(inv.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={12} /></button>
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found</div>}
      </motion.div>

      {(portalUrl || portalError) && (
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          {portalError ? (
            <div className="badge badge-red" style={{ padding: '8px 12px', borderRadius: 8 }}>{portalError}</div>
          ) : (
            <>
              <label className="label">Invoice portal link</label>
              <input className="input" readOnly value={portalUrl} onFocus={e => e.currentTarget.select()} style={{ marginTop: 8, fontSize: '0.78rem' }} />
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#a9825208', border: '1px solid #a9825220', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Repeat size={15} color="#9a7850" />
        <p style={{ fontSize: '0.78rem', color: '#9a7850', margin: 0 }}>Recurring invoices auto-send via cron · Stripe payment links · Resend email delivery — all in Phase 1</p>
      </div>

      <AnimatePresence>
        {showModal && <NewInvoiceModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
