import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Plus, X, Edit2, Trash2, Copy, Archive,
  DollarSign, Tag, Clock, CheckCircle2, Search,
} from 'lucide-react'

const CATEGORIES = ['Design', 'Development', 'Consulting', 'Photography', 'Writing', 'Marketing', 'Video', 'Other']

const PRICING_MODELS = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'hourly', label: 'Hourly rate' },
  { value: 'monthly', label: 'Monthly retainer' },
  { value: 'daily', label: 'Daily rate' },
]

const INITIAL_SERVICES = [
  { id: 1, name: 'Website Design', description: 'Full website design including wireframes, mockups, and final assets.', category: 'Design', pricing_model: 'fixed', default_price: 1500, unit: '', archived: false },
  { id: 2, name: 'Brand Identity Package', description: 'Logo, color palette, typography, and brand guidelines.', category: 'Design', pricing_model: 'fixed', default_price: 2200, unit: '', archived: false },
  { id: 3, name: 'Hourly Consulting', description: 'Strategy, audits, and advisory sessions.', category: 'Consulting', pricing_model: 'hourly', default_price: 120, unit: 'hour', archived: false },
  { id: 4, name: 'Webflow Development', description: 'Custom Webflow build from approved designs.', category: 'Development', pricing_model: 'fixed', default_price: 800, unit: '', archived: false },
  { id: 5, name: 'Monthly Retainer', description: 'Ongoing support, updates, and maintenance.', category: 'Consulting', pricing_model: 'monthly', default_price: 600, unit: 'month', archived: false },
  { id: 6, name: 'Product Photography', description: 'Studio photography session, 20+ edited images.', category: 'Photography', pricing_model: 'fixed', default_price: 350, unit: '', archived: false },
]

const EMPTY_FORM = {
  name: '', description: '', category: 'Design',
  pricing_model: 'fixed', default_price: '', unit: '',
}

export default function Services() {
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [showModal, setShowModal] = useState(false)
  const [editService, setEditService] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showArchived, setShowArchived] = useState(false)

  function openNew() { setForm(EMPTY_FORM); setEditService(null); setShowModal(true) }
  function openEdit(svc) { setForm({ ...svc }); setEditService(svc.id); setShowModal(true) }

  function saveService(e) {
    e.preventDefault()
    if (!form.name || !form.default_price) return
    if (editService) {
      setServices(s => s.map(x => x.id === editService ? { ...x, ...form, default_price: parseFloat(form.default_price) } : x))
    } else {
      setServices(s => [{ id: Date.now(), ...form, default_price: parseFloat(form.default_price), archived: false }, ...s])
    }
    setShowModal(false)
  }

  function duplicateService(svc) {
    setServices(s => [{ ...svc, id: Date.now(), name: svc.name + ' (copy)' }, ...s])
  }

  function archiveService(id) {
    setServices(s => s.map(x => x.id === id ? { ...x, archived: !x.archived } : x))
  }

  function deleteService(id) { setServices(s => s.filter(x => x.id !== id)) }

  const filtered = services.filter(s => {
    if (!showArchived && s.archived) return false
    if (filterCat !== 'All' && s.category !== filterCat) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activeCount = services.filter(s => !s.archived).length

  function priceLabel(svc) {
    const pm = PRICING_MODELS.find(p => p.value === svc.pricing_model)
    const suffix = svc.pricing_model === 'fixed' ? '' : ` / ${svc.unit || svc.pricing_model}`
    return `€${Number(svc.default_price).toLocaleString()}${suffix}`
  }

  const catColors = {
    Design: '#6366f1', Development: '#22c55e', Consulting: '#f59e0b',
    Photography: '#ec4899', Writing: '#06b6d4', Marketing: '#8b5cf6',
    Video: '#f97316', Other: '#94a3b8',
  }

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Services Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activeCount} services · reuse in proposals and invoices</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNew}>
          <Plus size={16} /> New service
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search services..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: filterCat === cat ? 'var(--accent)' : 'var(--surface)',
              color: filterCat === cat ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: filterCat === cat ? 600 : 400,
            }}>{cat}</button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {/* Services grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(svc => (
          <motion.div key={svc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card" style={{ padding: 20, opacity: svc.archived ? 0.5 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: (catColors[svc.category] || '#94a3b8') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color={catColors[svc.category] || '#94a3b8'} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{svc.name}</div>
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 99, background: (catColors[svc.category] || '#94a3b8') + '20', color: catColors[svc.category] || '#94a3b8' }}>
                    {svc.category}
                  </span>
                </div>
              </div>
              {svc.archived && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: 'var(--border-light)', color: 'var(--text-muted)' }}>archived</span>}
            </div>

            {svc.description && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {svc.description}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{priceLabel(svc)}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {PRICING_MODELS.find(p => p.value === svc.pricing_model)?.label}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => openEdit(svc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => duplicateService(svc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Copy size={14} />
                </button>
                <button onClick={() => archiveService(svc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Archive size={14} />
                </button>
                <button onClick={() => deleteService(svc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add new card */}
        <motion.div whileHover={{ scale: 1.01 }} onClick={openNew}
          style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140, opacity: 0.6 }}>
          <Plus size={24} color="var(--text-muted)" />
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Add service</span>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editService ? 'Edit service' : 'New service'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={saveService} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Service name</label>
                  <input className="input" placeholder="e.g. Website Design" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Description (optional)</label>
                  <textarea className="input" rows={2} placeholder="What's included..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pricing model</label>
                    <select className="input" value={form.pricing_model} onChange={e => setForm(f => ({ ...f, pricing_model: e.target.value }))}>
                      {PRICING_MODELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Default price (€)</label>
                    <input type="number" step="0.01" min="0" className="input" placeholder="0.00"
                      value={form.default_price} onChange={e => setForm(f => ({ ...f, default_price: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Unit label (optional)</label>
                    <input className="input" placeholder="e.g. hour, page, shoot"
                      value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {editService ? 'Save changes' : 'Create service'}
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
