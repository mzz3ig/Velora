import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Send, Eye, ArrowLeft, FileText, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useClientStore, useProjectStore, useProposalStore } from '../../store'
import { createPortalLink } from '../../lib/portal'

const defaultItems = [
  { id: 1, name: 'Strategy & Discovery', qty: 1, price: 800 },
  { id: 2, name: 'UI Design (3 screens)', qty: 3, price: 350 },
  { id: 3, name: 'Development', qty: 1, price: 2200 },
]

export default function ProposalBuilder() {
  const { clients } = useClientStore()
  const { projects } = useProjectStore()
  const { addProposal } = useProposalStore()
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [items, setItems] = useState(defaultItems)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [expiry, setExpiry] = useState('')
  const [preview, setPreview] = useState(false)
  const [sent, setSent] = useState(false)
  const [portalUrl, setPortalUrl] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedClient = clients.find(c => String(c.id) === String(clientId))
  const selectedProject = projects.find(p => String(p.id) === String(projectId))
  const client = selectedClient?.name || ''

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0)
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), name: '', qty: 1, price: 0 }])
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id, field, value) => setItems(prev => prev.map(i => i.id === id ? {...i, [field]: value} : i))

  const handleSend = async () => {
    if (!selectedClient || !projectName) return
    setSending(true)
    setSendError('')
    try {
      const proposal = {
        clientId: selectedClient.id,
        client: selectedClient.name,
        projectId: selectedProject?.id || null,
        project: projectName,
        expiry,
        items: items.map(item => ({ ...item, service: item.name, subtotal: Number(item.qty) * Number(item.price) })),
        discount,
        notes,
        subtotal,
        total,
        status: 'sent',
      }
      addProposal(proposal)
      const link = await createPortalLink({ clientId: selectedClient.id, projectId: selectedProject?.id || null, expiresInDays: 30 })
      setPortalUrl(link.url)
      setSent(true)
    } catch (error) {
      setSendError(error.message || 'Could not send this proposal.')
    } finally {
      setSending(false)
    }
  }

  const copyPortalLink = async () => {
    await navigator.clipboard.writeText(portalUrl)
    setCopied(true)
  }

  if (preview) {
    return (
      <div style={{ padding: '32px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <button onClick={() => setPreview(false)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            <ArrowLeft size={14} /> Back to editor
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            This is exactly what your client will see
          </span>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 40,
          backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <FileText size={18} color="white" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Rodrigo Mendes Studio</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>hello@rodrigo.studio</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>PROPOSAL</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{projectName || 'Project Name'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>For: {client || 'Client Name'}</div>
              {expiry && <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: 4 }}>Expires: {expiry}</div>}
            </div>
          </div>

          {/* Line items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr>
                {['Service', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Service' ? 'left' : 'right', padding: '8px 0', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '12px 0', fontSize: '0.9rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{item.name || '-'}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{item.qty}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>€{item.price.toLocaleString()}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>€{(item.qty * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontSize: '0.875rem' }}>€{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.875rem', color: '#4ade80' }}>Discount ({discount}%)</span>
                  <span style={{ fontSize: '0.875rem', color: '#4ade80' }}>−€{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a98252' }}>€{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div style={{ marginTop: 28, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>NOTES</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{notes}</p>
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" style={{ padding: '12px 28px' }}>Accept proposal</button>
            <button className="btn-ghost" style={{ padding: '12px 28px' }}>Decline</button>
          </div>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 8, margin: '0 auto 16px',
            background: 'rgba(34,197,94,0.12)', color: '#065f46',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 800,
          }}>✓</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Proposal sent!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Your proposal was saved and a secure portal link was created for <strong>{client}</strong>.
          </p>
          {portalUrl && (
            <div className="card" style={{ padding: 14, marginBottom: 18, textAlign: 'left' }}>
              <label className="label">Magic link</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input className="input" readOnly value={portalUrl} style={{ fontSize: '0.78rem' }} />
                <button onClick={copyPortalLink} className="btn-primary btn-sm" style={{ flexShrink: 0 }}>
                  <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setSent(false)} className="btn-ghost" style={{ padding: '10px 20px' }}>Create another</button>
            <Link to="/app/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '10px 20px' }}>Back to dashboard</button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: 800 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Proposal Builder</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Build and send a professional proposal to your client</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPreview(true)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            <Eye size={14} /> Preview
          </button>
          <button onClick={handleSend} disabled={sending} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem', opacity: sending ? 0.7 : 1 }}>
            <Send size={14} /> {sending ? 'Sending...' : 'Send proposal'}
          </button>
        </div>
      </motion.div>

      {sendError && <div className="badge badge-red" style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 8 }}>{sendError}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Project info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Client *</label>
              <select className="input" value={clientId} onChange={e => {
                  const nextClientId = e.target.value
                  setClientId(nextClientId)
                  setProjectId('')
                }}
                style={{ appearance: 'none' }}>
                <option value="">Select client…</option>
                {clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Project name *</label>
              <input className="input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Website Redesign" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Connect project</label>
              <select className="input" value={projectId} onChange={e => {
                  const nextProject = projects.find(p => String(p.id) === e.target.value)
                  setProjectId(e.target.value)
                  if (nextProject) setProjectName(nextProject.name)
                }}>
                <option value="">No project</option>
                {projects.filter(p => !clientId || String(p.clientId) === String(clientId)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Expiry date</label>
              <input className="input" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Discount (%)</label>
              <input className="input" type="number" min="0" max="100" value={discount} onChange={e => setDiscount(Number(e.target.value))} placeholder="0" />
            </div>
          </div>
        </motion.div>

        {/* Line items */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Services</h2>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 40px', gap: 8, marginBottom: 8 }}>
              {['Service', 'Qty', 'Unit price', 'Subtotal', ''].map(h => (
                <div key={h} style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '0 4px' }}>{h}</div>
              ))}
            </div>

            {items.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 40px', gap: 8, marginBottom: 8 }}>
                <input className="input" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} placeholder="Service description" style={{ fontSize: '0.875rem' }} />
                <input className="input" type="number" min="1" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} style={{ textAlign: 'center', fontSize: '0.875rem' }} />
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>€</span>
                  <input className="input" type="number" min="0" value={item.price} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} style={{ paddingLeft: 22, fontSize: '0.875rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.875rem', fontWeight: 600 }}>
                  €{(item.qty * item.price).toLocaleString()}
                </div>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          <button onClick={addItem} className="btn-ghost" style={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            <Plus size={14} /> Add line item
          </button>

          {/* Totals */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subtotal</span>
                <span>€{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>Discount ({discount}%)</span>
                  <span style={{ color: '#4ade80' }}>−€{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 800 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a98252' }}>€{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes & Terms</h2>
          <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add any notes, payment terms, or additional info for your client…"
            style={{ minHeight: 100, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
          />
        </motion.div>
      </div>
    </div>
  )
}
