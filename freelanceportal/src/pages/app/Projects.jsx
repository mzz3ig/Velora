import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Calendar, CheckCircle2, Circle, X, Briefcase, Trash2 } from 'lucide-react'
import { useProjectStore, useClientStore } from '../../store'

const statusMeta = {
  active: { label: 'In Progress', color: '#a98252', bg: 'rgba(169,130,82,0.15)' },
  in_review: { label: 'In Review', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
  archived: { label: 'Archived', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

function ProjectDetail({ project, onClose }) {
  const { toggleMilestone, updateProject, deleteProject } = useProjectStore()
  const [editMode, setEditMode] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const [form, setForm] = useState({ name: project.name, description: project.description, status: project.status, deadline: project.deadline, startDate: project.startDate })

  const s = statusMeta[project.onRender?.status || project.status] || statusMeta.active

  const saveEdit = (e) => {
    e.preventDefault()
    updateProject(project.id, form)
    setEditMode(false)
  }

  const addMilestone = (e) => {
    e.preventDefault()
    if (!newMilestone.trim()) return
    const milestones = [...project.milestones, { id: Date.now(), title: newMilestone, done: false }]
    updateProject(project.id, { milestones })
    setNewMilestone('')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)', boxShadow: 'var(--shadow-md)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{project.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.clientColor }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{project.client}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.color }}>{s.label}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditMode(!editMode)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {editMode ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div><label className="label">Project name</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
            <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{ resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                  {Object.entries(statusMeta).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div><label className="label">Deadline</label><input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Save changes</button>
          </form>
        ) : (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{project.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[{ label: 'Start date', value: project.startDate }, { label: 'Deadline', value: project.deadline }].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value || '—'}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{project.progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999 }}>
            <div style={{ height: '100%', borderRadius: 999, width: `${project.progress}%`, background: 'linear-gradient(90deg, var(--accent), #bca57d)', transition: 'width 0.4s' }} />
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Milestones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {project.milestones.map(m => (
              <div key={m.id} onClick={() => toggleMilestone(project.id, m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(169,130,82,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                {m.done ? <CheckCircle2 size={16} color="#4ade80" /> : <Circle size={16} color="var(--text-muted)" />}
                <span style={{ fontSize: '0.875rem', textDecoration: m.done ? 'line-through' : 'none', color: m.done ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{m.title}</span>
              </div>
            ))}
          </div>
          <form onSubmit={addMilestone} style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="Add milestone…" style={{ flex: 1, fontSize: '0.85rem' }} />
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}><Plus size={14} /></button>
          </form>
        </div>

        <button onClick={() => { deleteProject(project.id); onClose() }} style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'none', border: '1px solid #f8717130', borderRadius: 6, cursor: 'pointer', color: '#f87171', fontSize: '0.8rem' }}>
          <Trash2 size={13} /> Delete project
        </button>
      </motion.div>
    </motion.div>
  )
}

function NewProjectModal({ onClose }) {
  const { addProject } = useProjectStore()
  const { clients } = useClientStore()
  const [form, setForm] = useState({ name: '', clientId: '', client: '', clientColor: '#a98252', status: 'active', deadline: '', startDate: new Date().toISOString().split('T')[0], description: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const client = clients.find(c => c.id === parseInt(form.clientId))
    addProject({ ...form, clientId: client?.id || null, client: client?.name || form.client, clientColor: client?.color || '#a98252', progress: 0, milestones: [] })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>New project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">Project name *</label><input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Brand Identity" required /></div>
          <div><label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={e => setForm(f=>({...f,clientId:e.target.value}))}>
              <option value="">— No client —</option>
              {clients.filter(c=>c.status==='active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} style={{ resize: 'vertical' }} placeholder="Brief description..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Start date</label><input type="date" className="input" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} /></div>
            <div><label className="label">Deadline</label><input type="date" className="input" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Plus size={14} /> Create project</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const { projects } = useProjectStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const match = p.name.toLowerCase().includes(q) || (p.client||'').toLowerCase().includes(q)
    return match && (filter === 'all' || p.status === filter)
  })

  const liveProject = selected ? projects.find(p => p.id === selected.id) || selected : null

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{projects.filter(p=>p.status==='active').length} active projects</p>
        </div>
        <button className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }} onClick={() => setShowNew(true)}>
          <Plus size={15} /> New project
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all','All'], ['active','In Progress'], ['in_review','In Review'], ['completed','Completed']].map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: filter === f ? 'rgba(169,130,82,0.15)' : 'transparent', borderColor: filter === f ? 'rgba(169,130,82,0.4)' : 'var(--border)', color: filter === f ? 'var(--accent)' : 'var(--text-secondary)' }}>{label}</button>
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((p, i) => {
          const s = statusMeta[p.status] || statusMeta.active
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }}
              onClick={() => setSelected(p)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)', boxShadow: 'var(--shadow-sm)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${p.clientColor}50`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: `${p.clientColor}20`, border: `1px solid ${p.clientColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={16} color={p.clientColor} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.client}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{p.progress}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--border-light)', borderRadius: 999 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                    style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${p.clientColor}, ${p.clientColor}80)` }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <Calendar size={11} /> {p.deadline || 'No deadline'}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  {p.milestones.filter(m=>m.done).length}/{p.milestones.length} milestones
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {liveProject && <ProjectDetail project={liveProject} onClose={() => setSelected(null)} />}
        {showNew && <NewProjectModal onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  )
}
