import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Plus, X, MoreHorizontal, DollarSign, Calendar, User, Trash2, Edit2 } from 'lucide-react'
import { usePipelineStore, useClientStore } from '../../store'

const STAGE_CONFIG = [
  { id: 'lead', label: 'Lead', color: '#94a3b8' },
  { id: 'qualified', label: 'Qualified', color: '#a98252' },
  { id: 'proposal', label: 'Proposal Sent', color: '#f59e0b' },
  { id: 'negotiation', label: 'Negotiation', color: '#8f6d43' },
  { id: 'won', label: 'Won', color: '#22c55e' },
  { id: 'lost', label: 'Lost', color: '#ef4444' },
]

const EMPTY_FORM = { title: '', client: '', value: '', stage: 'lead', close_date: '', probability: 30, notes: '' }

export default function Pipeline() {
  const { deals, addDeal, updateDeal, deleteDeal, moveDeal } = usePipelineStore()
  const { clients } = useClientStore()
  const [showModal, setShowModal] = useState(false)
  const [editDeal, setEditDeal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [draggedDeal, setDraggedDeal] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const clientNames = ['New Lead', ...clients.filter(c=>c.status==='active').map(c=>c.name)]

  function openNew(stage = 'lead') { setForm({ ...EMPTY_FORM, stage }); setEditDeal(null); setShowModal(true) }
  function openEdit(deal) { setForm({ ...deal }); setEditDeal(deal.id); setShowModal(true) }

  function saveDeal(e) {
    e.preventDefault()
    if (!form.title || !form.value) return
    if (editDeal) { updateDeal(editDeal, { ...form, value: parseFloat(form.value) }) }
    else { addDeal({ ...form, value: parseFloat(form.value) }) }
    setShowModal(false)
  }

  const handleDrop = (stageId) => {
    if (draggedDeal && draggedDeal.stage !== stageId) moveDeal(draggedDeal.id, stageId)
    setDraggedDeal(null); setDragOverStage(null)
  }

  const totalPipeline = deals.filter(d => !['won','lost'].includes(d.stage)).reduce((s,d) => s + d.value * (d.probability/100), 0)
  const wonRevenue = deals.filter(d => d.stage === 'won').reduce((s,d) => s + d.value, 0)
  const activeDeals = deals.filter(d => !['won','lost'].includes(d.stage)).length

  return (
    <div style={{ padding: '32px 24px', height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Pipeline</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeDeals} active deals · €{totalPipeline.toFixed(0)} weighted · €{wonRevenue.toLocaleString()} won
          </p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => openNew()}>
          <Plus size={16} /> New deal
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flex: 1, overflowX: 'auto', paddingBottom: 16 }}>
        {STAGE_CONFIG.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.id)
          const stageTotal = stageDeals.reduce((s,d) => s + d.value, 0)
          const isOver = dragOverStage === stage.id
          return (
            <div key={stage.id}
              onDragOver={e => { e.preventDefault(); setDragOverStage(stage.id) }}
              onDrop={() => handleDrop(stage.id)}
              style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', background: isOver ? 'rgba(169,130,82,0.06)' : 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
              <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>{stage.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--border-light)', padding: '1px 6px', borderRadius: 99 }}>{stageDeals.length}</span>
                  </div>
                  <button onClick={() => openNew(stage.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Plus size={14} /></button>
                </div>
                {stageTotal > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>€{stageTotal.toLocaleString()}</div>}
              </div>
              <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                {stageDeals.map(deal => (
                  <motion.div key={deal.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    draggable onDragStart={() => setDraggedDeal(deal)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', cursor: 'grab', position: 'relative', opacity: draggedDeal?.id === deal.id ? 0.5 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = stage.color + '60'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', flex: 1, paddingRight: 8 }}>{deal.title}</div>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setOpenMenuId(openMenuId === deal.id ? null : deal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><MoreHorizontal size={14} /></button>
                        {openMenuId === deal.id && (
                          <div style={{ position: 'absolute', right: 0, top: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 20, minWidth: 130, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                            <button onClick={() => { openEdit(deal); setOpenMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}><Edit2 size={13} /> Edit</button>
                            <button onClick={() => { deleteDeal(deal.id); setOpenMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem' }}><Trash2 size={13} /> Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><User size={11} color="var(--text-muted)" /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deal.client}</span></div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>€{deal.value.toLocaleString()}</div>
                    {deal.close_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Calendar size={11} color="var(--text-muted)" /><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Close {new Date(deal.close_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Probability</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{deal.probability}%</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: 'var(--border-light)' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: stage.color, width: `${deal.probability}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
                {stageDeals.length === 0 && (
                  <div onClick={() => openNew(stage.id)} style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.775rem', cursor: 'pointer', opacity: 0.7 }}>+ Add deal</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editDeal ? 'Edit deal' : 'New deal'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={saveDeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label className="label">Deal title</label><input className="input" placeholder="e.g. Website Redesign" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label className="label">Client</label>
                    <select className="input" value={form.client} onChange={e => setForm(f=>({...f,client:e.target.value}))}>
                      {clientNames.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Stage</label>
                    <select className="input" value={form.stage} onChange={e => setForm(f=>({...f,stage:e.target.value}))}>
                      {STAGE_CONFIG.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label className="label">Value (€)</label><input type="number" min="0" className="input" placeholder="0" value={form.value} onChange={e => setForm(f=>({...f,value:e.target.value}))} required /></div>
                  <div><label className="label">Close date</label><input type="date" className="input" value={form.close_date} onChange={e => setForm(f=>({...f,close_date:e.target.value}))} /></div>
                </div>
                <div><label className="label">Probability: {form.probability}%</label>
                  <input type="range" min="0" max="100" step="5" value={form.probability} onChange={e => setForm(f=>({...f,probability:parseInt(e.target.value)}))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                </div>
                <div><label className="label">Notes (optional)</label><input className="input" placeholder="Any notes..." value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editDeal ? 'Save changes' : 'Create deal'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
