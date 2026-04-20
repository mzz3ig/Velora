import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, ScrollText, CheckCircle2, Clock, Send, FileDown, X,
  PenTool, Type, RotateCcw, Check, Shield, Calendar,
} from 'lucide-react'

const CLIENTS = ['Acme Corporation', 'Sara Johnson', 'TechStart', 'Boutique XO', 'Lucas Müller']

const initialContracts = [
  { id: 1, project: 'Webflow Redesign', client: 'Acme Corporation', status: 'signed', date: '2026-03-05', value: '€3,350', signed_at: '2026-03-05T14:32:00', signer_ip: '85.245.x.x' },
  { id: 2, project: 'Brand Identity', client: 'Sara Johnson', status: 'signed', date: '2026-03-18', value: '€2,100', signed_at: '2026-03-18T10:15:00', signer_ip: '92.251.x.x' },
  { id: 3, project: 'Mobile App UI', client: 'TechStart', status: 'sent', date: '2026-04-02', value: '€4,800', signed_at: null, signer_ip: null },
  { id: 4, project: 'E-commerce Site', client: 'Boutique XO', status: 'signed', date: '2026-03-22', value: '€5,200', signed_at: '2026-03-22T09:45:00', signer_ip: '78.130.x.x' },
  { id: 5, project: 'Newsletter System', client: 'Lucas Müller', status: 'draft', date: '2026-04-14', value: '€1,600', signed_at: null, signer_ip: null },
]

const clauses = [
  { title: 'Payment Terms', text: 'Payment is due within 14 days of invoice date. A late payment fee of 2% per month applies to overdue invoices.' },
  { title: 'Revision Policy', text: 'This agreement includes up to 2 rounds of revisions. Additional revisions are billed at €80/hour.' },
  { title: 'Kill Fee', text: 'If the project is cancelled by the client after work has begun, a kill fee of 50% of the remaining project value is due.' },
  { title: 'IP Ownership', text: 'All intellectual property rights transfer to the client upon receipt of final payment in full.' },
  { title: 'Confidentiality', text: 'Both parties agree to keep all project-related information confidential and not disclose it to third parties.' },
]

const DEFAULT_CONTRACT = `This Service Agreement ("Agreement") is entered into as of the date signed below, between the Freelancer and the Client named below.

1. SERVICES
The Freelancer agrees to provide the following services: [describe services here].

2. PAYMENT
The Client agrees to pay the Freelancer the total amount specified in the associated proposal. A deposit of 50% is due before work commences.

3. TIMELINE
The project will be completed within the timeline agreed upon in the proposal.

4. REVISIONS
This agreement includes up to 2 rounds of revisions.`

const statusMeta = {
  signed: { label: 'Signed', icon: CheckCircle2, color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
  sent: { label: 'Awaiting signature', icon: Clock, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  draft: { label: 'Draft', icon: ScrollText, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

// E-Signature Canvas component
function SignatureCanvas({ onSave, onClose }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [mode, setMode] = useState('draw') // draw | type
  const [typedName, setTypedName] = useState('')
  const [hasDrawing, setHasDrawing] = useState(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'transparent'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1d1d1f'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [mode])

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function startDraw(e) {
    e.preventDefault()
    setDrawing(true)
    setHasDrawing(true)
    lastPos.current = getPos(e, canvasRef.current)
  }

  function draw(e) {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() { setDrawing(false) }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
  }

  function saveSignature() {
    let signatureData
    if (mode === 'type') {
      signatureData = `typed:${typedName}`
    } else {
      signatureData = canvasRef.current.toDataURL('image/png')
    }
    onSave(signatureData)
  }

  const canSave = mode === 'draw' ? hasDrawing : typedName.trim().length > 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="card" style={{ width: '100%', maxWidth: 520, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add your signature</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['draw', PenTool, 'Draw signature'], ['type', Type, 'Type name']].map(([m, Icon, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)',
              background: mode === m ? 'var(--accent)' : 'var(--surface)',
              color: mode === m ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {mode === 'draw' ? (
          <div>
            <div style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
              <canvas ref={canvasRef} width={460} height={160}
                style={{ display: 'block', width: '100%', height: 160, cursor: 'crosshair', touchAction: 'none' }}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
              {!hasDrawing && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sign here</span>
                </div>
              )}
            </div>
            <button onClick={clearCanvas} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        ) : (
          <div>
            <input className="input" placeholder="Type your full name" value={typedName}
              onChange={e => setTypedName(e.target.value)}
              style={{ fontSize: '1.6rem', fontFamily: 'cursive', textAlign: 'center', height: 80, letterSpacing: 2 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
              Your typed name constitutes a legally binding signature
            </p>
          </div>
        )}

        {/* Legal note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14, padding: '10px 12px', background: '#22c55e10', border: '1px solid #22c55e30', borderRadius: 8 }}>
          <Shield size={14} color="#22c55e" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: '0.72rem', color: '#22c55e', margin: 0, lineHeight: 1.5 }}>
            Signature will be stored with timestamp and IP address. Supabase Storage integration in Phase 1 will generate a signed PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={saveSignature} disabled={!canSave} className="btn-primary" style={{ flex: 1, opacity: canSave ? 1 : 0.5 }}>
            <Check size={14} /> Apply signature
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function NewContractModal({ onClose, onAdd }) {
  const [content, setContent] = useState(DEFAULT_CONTRACT)
  const [client, setClient] = useState('')
  const [project, setProject] = useState('')
  const [value, setValue] = useState('')
  const [showClauses, setShowClauses] = useState(false)

  function submit(asDraft) {
    if (!client || !project) return
    onAdd({
      id: Date.now(), project, client, status: asDraft ? 'draft' : 'sent',
      date: new Date().toISOString().split('T')[0], value: value ? `€${value}` : '—',
      signed_at: null, signer_ip: null,
    })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="card" style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', padding: 32 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>New Contract</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label className="label">Client</label>
            <select className="input" value={client} onChange={e => setClient(e.target.value)}>
              <option value="">Select client…</option>
              {CLIENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Project</label>
            <input className="input" placeholder="Project name" value={project} onChange={e => setProject(e.target.value)} />
          </div>
          <div>
            <label className="label">Value (€)</label>
            <input type="number" className="input" placeholder="0" value={value} onChange={e => setValue(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="label" style={{ marginBottom: 0 }}>Contract content</label>
            <button onClick={() => setShowClauses(!showClauses)} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              + Add clause
            </button>
          </div>
          <textarea className="input" value={content} onChange={e => setContent(e.target.value)}
            style={{ minHeight: 240, resize: 'vertical', lineHeight: 1.7, fontSize: '0.875rem', fontFamily: 'inherit' }} />
        </div>
        {showClauses && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clause Library</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {clauses.map(clause => (
                <button key={clause.title}
                  onClick={() => { setContent(prev => prev + '\n\n' + clause.title.toUpperCase() + '\n' + clause.text); setShowClauses(false) }}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', textAlign: 'left', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2 }}>{clause.title}</div>
                  <div style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clause.text}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => submit(true)}>Save as draft</button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => submit(false)}>
            <Send size={14} /> Send for signature
          </button>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
          Sending via magic link (JWT) — Resend email integration in Phase 1
        </p>
      </motion.div>
    </motion.div>
  )
}

// Client-side signature view (simulates portal)
function SignContractModal({ contract, onSign, onClose }) {
  const [showSig, setShowSig] = useState(false)
  const [signed, setSigned] = useState(false)

  function handleSave() {
    setShowSig(false)
    setSigned(true)
    onSign(contract.id)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="card" style={{ width: '100%', maxWidth: 560, padding: 28 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sign contract — {contract.project}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '16px', marginBottom: 20, maxHeight: 200, overflowY: 'auto' }}>
          <pre style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
            {DEFAULT_CONTRACT}
          </pre>
        </div>
        {signed ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Contract signed!</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Signed at {new Date().toLocaleString()} · IP recorded
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              PDF generated via pdf-lib · Stored in Supabase Storage (Phase 1)
            </div>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}
              onClick={() => setShowSig(true)}>
              <PenTool size={20} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>Click to add your signature</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowSig(true)}>
                <PenTool size={14} /> Sign contract
              </button>
            </div>
          </>
        )}
        <AnimatePresence>
          {showSig && <SignatureCanvas onSave={handleSave} onClose={() => setShowSig(false)} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function Contracts() {
  const [contracts, setContracts] = useState(initialContracts)
  const [showModal, setShowModal] = useState(false)
  const [signContract, setSignContract] = useState(null)

  function addContract(c) { setContracts(prev => [c, ...prev]) }

  function markSigned(id) {
    setContracts(c => c.map(x => x.id === id ? {
      ...x, status: 'signed',
      signed_at: new Date().toISOString(),
      signer_ip: '192.168.x.x',
    } : x))
    setSignContract(null)
  }

  const stats = [
    { label: 'Total contracts', value: contracts.length },
    { label: 'Signed', value: contracts.filter(c => c.status === 'signed').length, color: '#4ade80' },
    { label: 'Awaiting', value: contracts.filter(c => c.status === 'sent').length, color: '#fbbf24' },
    { label: 'Drafts', value: contracts.filter(c => c.status === 'draft').length, color: '#94a3b8' },
  ]

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Contracts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create, send, and collect e-signatures · PDF generation in Phase 1</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={15} /> New contract
        </button>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 160px',
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          <span>Project</span><span>Client</span><span>Value</span><span>Date</span><span>Status</span>
        </div>

        {contracts.map((c, i) => {
          const s = statusMeta[c.status]
          return (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 160px', padding: '16px 20px',
                borderBottom: i < contracts.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#a9825215', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScrollText size={14} color="#a98252" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.project}</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.client}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.value}</span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{c.date}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.color }}>
                  <s.icon size={10} /> {s.label}
                </span>
                {c.status === 'sent' && (
                  <button onClick={() => setSignContract(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: 2 }} title="Preview signing (demo)">
                    <PenTool size={13} />
                  </button>
                )}
                {c.status === 'signed' && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }} title="Download PDF (Phase 1)">
                    <FileDown size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {showModal && <NewContractModal onClose={() => setShowModal(false)} onAdd={addContract} />}
        {signContract && <SignContractModal contract={signContract} onSign={markSigned} onClose={() => setSignContract(null)} />}
      </AnimatePresence>
    </div>
  )
}
