import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Calendar, ChevronRight, CheckCircle2, Circle, X, Briefcase } from 'lucide-react'

const initial = [
  {
    id: 1, name: 'Webflow Redesign', client: 'Acme Corporation', clientColor: '#0071e3',
    status: 'active', progress: 65, deadline: '2026-04-28', startDate: '2026-03-01',
    description: 'Full redesign of the Acme website using Webflow CMS.',
    milestones: [
      { id: 1, title: 'Discovery & wireframes', done: true },
      { id: 2, title: 'Design mockups approved', done: true },
      { id: 3, title: 'Webflow build', done: false },
      { id: 4, title: 'QA & launch', done: false },
    ],
  },
  {
    id: 2, name: 'Brand Identity', client: 'Sara Johnson', clientColor: '#22c55e',
    status: 'in_review', progress: 90, deadline: '2026-04-22', startDate: '2026-03-15',
    description: 'Complete brand identity package including logo, typography, and color system.',
    milestones: [
      { id: 1, title: 'Brand discovery session', done: true },
      { id: 2, title: 'Logo concepts (3 directions)', done: true },
      { id: 3, title: 'Final logo approved', done: true },
      { id: 4, title: 'Brand guidelines doc', done: false },
    ],
  },
  {
    id: 3, name: 'Mobile App UI', client: 'TechStart', clientColor: '#f59e0b',
    status: 'active', progress: 30, deadline: '2026-05-10', startDate: '2026-04-01',
    description: 'UI/UX design for a fintech mobile application.',
    milestones: [
      { id: 1, title: 'User flows & IA', done: true },
      { id: 2, title: 'Lo-fi wireframes', done: false },
      { id: 3, title: 'Hi-fi screens', done: false },
      { id: 4, title: 'Prototype & handoff', done: false },
    ],
  },
  {
    id: 4, name: 'E-commerce Site', client: 'Boutique XO', clientColor: '#f472b6',
    status: 'active', progress: 50, deadline: '2026-05-05', startDate: '2026-03-20',
    description: 'Shopify store design and development for a luxury fashion brand.',
    milestones: [
      { id: 1, title: 'Design system', done: true },
      { id: 2, title: 'Homepage & product pages', done: true },
      { id: 3, title: 'Checkout flow', done: false },
      { id: 4, title: 'Testing & launch', done: false },
    ],
  },
]

const statusMeta = {
  active: { label: 'In Progress', color: '#0071e3', bg: 'rgba(0,113,227,0.15)' },
  in_review: { label: 'In Review', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(34,197,94,0.15)' },
  archived: { label: 'Archived', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

function ProjectDetail({ project, onClose, onToggleMilestone }) {
  const s = statusMeta[project.status]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8,
          padding: 32, width: '100%', maxWidth: 540,
          backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{project.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.clientColor }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{project.client}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.color }}>{s.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{project.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[{ label: 'Start date', value: project.startDate }, { label: 'Deadline', value: project.deadline }].map(item => (
            <div key={item.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{project.progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999 }}>
            <div style={{ height: '100%', borderRadius: 999, width: `${project.progress}%`, background: 'linear-gradient(90deg, var(--accent), #2997ff)' }} />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Milestones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.milestones.map(m => (
              <div key={m.id}
                onClick={() => onToggleMilestone(project.id, m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,113,227,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {m.done
                  ? <CheckCircle2 size={16} color="#4ade80" />
                  : <Circle size={16} color="var(--text-muted)" />
                }
                <span style={{ fontSize: '0.875rem', textDecoration: m.done ? 'line-through' : 'none', color: m.done ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState(initial)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const match = p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)
    return match && (filter === 'all' || p.status === filter)
  })

  const toggleMilestone = (projectId, milestoneId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const milestones = p.milestones.map(m => m.id === milestoneId ? {...m, done: !m.done} : m)
      const done = milestones.filter(m => m.done).length
      const progress = Math.round((done / milestones.length) * 100)
      return {...p, milestones, progress}
    }))
    setSelected(prev => {
      if (!prev || prev.id !== projectId) return prev
      const milestones = prev.milestones.map(m => m.id === milestoneId ? {...m, done: !m.done} : m)
      const done = milestones.filter(m => m.done).length
      const progress = Math.round((done / milestones.length) * 100)
      return {...prev, milestones, progress}
    })
  }

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{projects.filter(p=>p.status==='active').length} active projects</p>
        </div>
        <button className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }}>
          <Plus size={15} /> New project
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all','All'], ['active','In Progress'], ['in_review','In Review'], ['completed','Completed']].map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid',
              fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              background: filter === f ? 'rgba(0,113,227,0.15)' : 'transparent',
              borderColor: filter === f ? 'rgba(0,113,227,0.4)' : 'var(--border)',
              color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
            }}>{label}</button>
          ))}
        </div>
      </motion.div>

      {/* Projects grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((p, i) => {
          const s = statusMeta[p.status]
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelected(p)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s',
                backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${p.clientColor}50`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: `${p.clientColor}20`, border: `1px solid ${p.clientColor}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
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
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                    style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${p.clientColor}, ${p.clientColor}80)` }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <Calendar size={11} /> {p.deadline}
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
        {selected && (
          <ProjectDetail
            project={selected}
            onClose={() => setSelected(null)}
            onToggleMilestone={toggleMilestone}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
