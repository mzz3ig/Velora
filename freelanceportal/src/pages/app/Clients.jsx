import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MoreHorizontal, Mail, Phone, ExternalLink, Trash2, Archive, X, Tag, StickyNote, Activity, ChevronDown } from 'lucide-react'
import { useClientStore } from '../../store'

const COLORS = ['#a98252','#bca57d','#22c55e','#f59e0b','#38bdf8','#f472b6','#fb923c']
const ALL_TAGS = ['vip', 'design', 'development', 'agency', 'ecommerce', 'retainer', 'new']

function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const handleSubmit = (e) => {
    e.preventDefault()
    const initials = form.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
    onAdd({ ...form, status: 'active', initials, color: COLORS[Math.floor(Math.random()*COLORS.length)] })
    onClose()
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 32, width: '100%', maxWidth: 440, backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)', boxShadow: 'var(--shadow-md)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add new client</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label className="label">Full name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Sara Johnson" required /></div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="sara@example.com" required /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+49 30 1234 5678" /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Acme Corp" /></div>
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}><Plus size={15} /> Add client</button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function ClientDetailPanel({ client, onClose, onUpdate }) {
  const [note, setNote] = useState(client.notes || '')
  const [noteEditing, setNoteEditing] = useState(false)

  const saveNote = () => { onUpdate(client.id, { notes: note }); setNoteEditing(false) }
  const addTag = (tag) => {
    const tags = client.tags || []
    if (!tags.includes(tag)) onUpdate(client.id, { tags: [...tags, tag] })
  }
  const removeTag = (tag) => onUpdate(client.id, { tags: (client.tags || []).filter(t => t !== tag) })

  const activity = client.activity || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${client.color}25`, border: `1px solid ${client.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: client.color }}>{client.initials}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{client.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.company}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Mail size={13} />{client.email}</div>
          {client.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Phone size={13} />{client.phone}</div>}
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={12} /> Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {(client.tags || []).map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', padding: '3px 8px', borderRadius: 99, background: '#a9825215', color: '#9a7850', border: '1px solid #a9825230' }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a7850', padding: 0, lineHeight: 1 }}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALL_TAGS.filter(t => !(client.tags||[]).includes(t)).map(t => (
              <button key={t} onClick={() => addTag(t)} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, border: '1px dashed var(--border)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>+ {t}</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><StickyNote size={12} /> Internal notes</div>
            {!noteEditing && <button onClick={() => setNoteEditing(true)} style={{ fontSize: '0.75rem', color: '#9a7850', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>}
          </div>
          {noteEditing ? (
            <div>
              <textarea className="input" rows={3} value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'vertical', marginBottom: 8 }} placeholder="Private notes about this client..." />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setNoteEditing(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '6px' }}>Cancel</button>
                <button onClick={saveNote} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '6px' }}>Save</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: note ? 'var(--text-secondary)' : 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)', minHeight: 48, lineHeight: 1.6 }}>
              {note || 'No notes yet. Click Edit to add.'}
            </div>
          )}
        </div>

        {/* Activity */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={12} /> Recent activity</div>
          {activity.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity recorded yet.</div>
          ) : activity.slice(0, 6).map(ev => (
            <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{new Date(ev.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              <span>{ev.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Clients() {
  const { clients, addClient, updateClient, archiveClient, deleteClient } = useClientStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [detailClient, setDetailClient] = useState(null)

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company||'').toLowerCase().includes(q)
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Clients</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{clients.filter(c=>c.status==='active').length} active clients</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '9px 18px', fontSize: '0.875rem' }}>
          <Plus size={15} /> New client
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','active','archived'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid', fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer', background: filter === f ? 'rgba(169,130,82,0.15)' : 'transparent', borderColor: filter === f ? 'rgba(169,130,82,0.4)' : 'var(--border)', color: filter === f ? 'var(--accent)' : 'var(--text-secondary)' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 580, display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          <span>Client</span><span>Contact</span><span>Tags</span><span>Status</span><span></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No clients found</div>
        ) : filtered.map((client, i) => (
          <motion.div key={client.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 100px', minWidth: 580, padding: '16px 20px', borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none', alignItems: 'center', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `${client.color}25`, border: `1px solid ${client.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: client.color }}>{client.initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{client.name}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{client.company}</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 3 }}><Mail size={11} />{client.email}</div>
              {client.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.775rem', color: 'var(--text-muted)' }}><Phone size={11} />{client.phone}</div>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {(client.tags||[]).slice(0,2).map(tag => (
                <span key={tag} style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 99, background: '#a9825210', color: '#9a7850', border: '1px solid #a9825225' }}>{tag}</span>
              ))}
              {(client.tags||[]).length > 2 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{client.tags.length - 2}</span>}
            </div>

            <span className={`badge ${client.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{client.status}</span>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', position: 'relative' }}>
              <button onClick={() => setDetailClient(client)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} title="View profile"><ExternalLink size={13} /></button>
              <button onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}><MoreHorizontal size={15} /></button>
              <AnimatePresence>
                {menuOpen === client.id && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, minWidth: 150, boxShadow: 'var(--shadow-lg)', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)' }}>
                    {[
                      { icon: Archive, label: 'Archive', action: () => { archiveClient(client.id); setMenuOpen(null) } },
                      { icon: Trash2, label: 'Delete', action: () => { deleteClient(client.id); setMenuOpen(null) }, danger: true },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500, color: item.danger ? '#f87171' : 'var(--text-secondary)' }}>
                        <item.icon size={13} /> {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
        </div>{/* end scroll wrapper */}
      </motion.div>

      <AnimatePresence>
        {showModal && <AddClientModal onClose={() => setShowModal(false)} onAdd={addClient} />}
        {detailClient && <ClientDetailPanel client={detailClient} onClose={() => setDetailClient(null)} onUpdate={updateClient} />}
      </AnimatePresence>
    </div>
  )
}
