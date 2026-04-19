import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MoreHorizontal, Mail, Phone, ExternalLink, Trash2, Archive, X } from 'lucide-react'

const initialClients = [
  { id: 1, name: 'Acme Corporation', email: 'hello@acme.com', phone: '+49 30 1234 5678', company: 'Acme Corp', projects: 3, billed: 6200, status: 'active', initials: 'AC', color: '#0071e3' },
  { id: 2, name: 'Sara Johnson', email: 'sara@saradesigns.co', phone: '+44 7700 900123', company: 'Sara Designs', projects: 2, billed: 3400, status: 'active', initials: 'SJ', color: '#22c55e' },
  { id: 3, name: 'Webflow Agency', email: 'contact@webflowag.com', phone: '+1 415 555 0100', company: 'Webflow Agency', projects: 1, billed: 8500, status: 'active', initials: 'WA', color: '#f59e0b' },
  { id: 4, name: 'Lucas Müller', email: 'lucas@lmdesign.de', phone: '+49 89 9876 5432', company: 'LM Design', projects: 4, billed: 12000, status: 'active', initials: 'LM', color: '#38bdf8' },
  { id: 5, name: 'Boutique XO', email: 'studio@boutiquexo.fr', phone: '+33 1 5555 6789', company: 'Boutique XO', projects: 1, billed: 2100, status: 'active', initials: 'BX', color: '#f472b6' },
  { id: 6, name: 'Markus GmbH', email: 'office@markusgmbh.de', phone: '+49 211 4321 000', company: 'Markus GmbH', projects: 2, billed: 4700, status: 'archived', initials: 'MG', color: '#0071e3' },
]

function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const colors = ['#0071e3','#2997ff','#22c55e','#f59e0b','#38bdf8','#f472b6','#fb923c']

  const handleSubmit = (e) => {
    e.preventDefault()
    const initials = form.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
    onAdd({ ...form, id: Date.now(), projects: 0, billed: 0, status: 'active', initials, color: colors[Math.floor(Math.random()*colors.length)] })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: 'var(--surface-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 32, width: '100%', maxWidth: 440,
          backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add new client</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full name *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Sara Johnson" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email *</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="sara@example.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+49 30 1234 5678" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Company</label>
            <input className="input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Acme Corp" />
          </div>
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}>
            <Plus size={15} /> Add client
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function Clients() {
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const handleAdd = (client) => setClients(prev => [client, ...prev])
  const handleArchive = (id) => setClients(prev => prev.map(c => c.id === id ? {...c, status: 'archived'} : c))
  const handleDelete = (id) => setClients(prev => prev.filter(c => c.id !== id))

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
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

      {/* Filters + Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','active','archived'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer',
              background: filter === f ? 'rgba(0,113,227,0.15)' : 'transparent',
              borderColor: filter === f ? 'rgba(0,113,227,0.4)' : 'var(--border)',
              color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Clients table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-muted)',
        }}>
          <span>Client</span><span>Contact</span><span>Projects</span><span>Total billed</span><span></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No clients found
          </div>
        ) : filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 80px',
              padding: '16px 20px', borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center', transition: 'background 0.15s', position: 'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: `${client.color}25`,
                border: `1px solid ${client.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: client.color,
              }}>
                {client.initials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{client.name}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{client.company}</div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 3 }}>
                <Mail size={11} />{client.email}
              </div>
              {client.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <Phone size={11} />{client.phone}
                </div>
              )}
            </div>

            {/* Projects */}
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{client.projects} project{client.projects !== 1 ? 's' : ''}</div>

            {/* Billed */}
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>€{client.billed.toLocaleString()}</div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', position: 'relative' }}>
              <span className={`badge ${client.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                {client.status}
              </span>
              <button
                onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
              >
                <MoreHorizontal size={15} />
              </button>
              <AnimatePresence>
                {menuOpen === client.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: 'absolute', right: 0, top: '100%', zIndex: 50,
                      background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: 6, minWidth: 150,
                      boxShadow: 'var(--shadow-lg)',
                      backdropFilter: 'var(--blur)',
                      WebkitBackdropFilter: 'var(--blur)',
                    }}
                  >
                    {[
                      { icon: ExternalLink, label: 'View profile', action: () => {} },
                      { icon: Archive, label: 'Archive', action: () => { handleArchive(client.id); setMenuOpen(null) } },
                      { icon: Trash2, label: 'Delete', action: () => { handleDelete(client.id); setMenuOpen(null) }, danger: true },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                          padding: '8px 10px', borderRadius: 7, border: 'none', background: 'none',
                          cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500,
                          color: item.danger ? '#f87171' : 'var(--text-secondary)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <item.icon size={13} /> {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showModal && <AddClientModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  )
}
