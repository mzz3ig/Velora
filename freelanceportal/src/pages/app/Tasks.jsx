import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, Plus, X, Trash2, Edit2, ChevronDown, ChevronRight,
  Calendar, User, Flag, Circle, CheckCircle2, AlignLeft,
  Filter, Search, Briefcase,
} from 'lucide-react'

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low', label: 'Low', color: '#22c55e' },
]

const PROJECTS = [
  { id: 0, name: '— No project —' },
  { id: 1, name: 'Webflow Redesign' },
  { id: 2, name: 'Brand Identity' },
  { id: 3, name: 'Mobile App UI' },
  { id: 4, name: 'E-commerce Site' },
]

const INITIAL_TASKS = [
  {
    id: 1, title: 'Design homepage wireframe', project: 'Webflow Redesign', priority: 'high',
    due_date: '2026-04-22', done: false, notes: 'Include mobile version', portal_visible: false,
    subtasks: [
      { id: 11, title: 'Sketch initial layout', done: true },
      { id: 12, title: 'Create desktop wireframe', done: false },
      { id: 13, title: 'Create mobile wireframe', done: false },
    ],
  },
  {
    id: 2, title: 'Finalize logo concepts', project: 'Brand Identity', priority: 'high',
    due_date: '2026-04-20', done: false, notes: '', portal_visible: true,
    subtasks: [
      { id: 21, title: 'Present 3 concepts', done: true },
      { id: 22, title: 'Gather feedback', done: true },
      { id: 23, title: 'Refine chosen concept', done: false },
    ],
  },
  {
    id: 3, title: 'Send invoice INV-003', project: '— No project —', priority: 'medium',
    due_date: '2026-04-19', done: false, notes: 'Check amount with client first', portal_visible: false,
    subtasks: [],
  },
  {
    id: 4, title: 'Set up project kickoff call', project: 'Mobile App UI', priority: 'low',
    due_date: '2026-04-25', done: false, notes: '', portal_visible: false,
    subtasks: [],
  },
  {
    id: 5, title: 'Deliver final brand assets', project: 'Brand Identity', priority: 'medium',
    due_date: '2026-04-18', done: true, notes: 'Export all formats: SVG, PNG, PDF', portal_visible: true,
    subtasks: [
      { id: 51, title: 'Export SVG files', done: true },
      { id: 52, title: 'Create brand guidelines PDF', done: true },
    ],
  },
]

const TEMPLATES = [
  { name: 'Client onboarding', tasks: ['Send welcome email', 'Schedule kickoff call', 'Share project brief', 'Set up client portal'] },
  { name: 'Website project', tasks: ['Wireframes', 'Design mockups', 'Client review', 'Development', 'QA testing', 'Launch'] },
  { name: 'Brand identity', tasks: ['Research', 'Logo concepts', 'Client presentation', 'Revisions', 'Final delivery'] },
]

const EMPTY_FORM = {
  title: '', project: '— No project —', priority: 'medium',
  due_date: '', notes: '', portal_visible: false,
}

function PriorityDot({ priority }) {
  const p = PRIORITIES.find(x => x.value === priority)
  return <div style={{ width: 8, height: 8, borderRadius: '50%', background: p?.color || '#94a3b8', flexShrink: 0 }} title={p?.label} />
}

export default function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedTask, setExpandedTask] = useState(null)
  const [filterProject, setFilterProject] = useState('All')
  const [filterStatus, setFilterStatus] = useState('active') // all | active | done
  const [search, setSearch] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [newSubtask, setNewSubtask] = useState({})

  function openNew() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }
  function openEdit(task) {
    setForm({ title: task.title, project: task.project, priority: task.priority, due_date: task.due_date, notes: task.notes, portal_visible: task.portal_visible })
    setEditId(task.id); setShowModal(true)
  }

  function saveTask(e) {
    e.preventDefault()
    if (editId) {
      setTasks(t => t.map(x => x.id === editId ? { ...x, ...form } : x))
    } else {
      setTasks(t => [...t, { id: Date.now(), ...form, done: false, subtasks: [] }])
    }
    setShowModal(false)
  }

  function toggleTask(id) { setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)) }
  function deleteTask(id) { setTasks(t => t.filter(x => x.id !== id)) }

  function toggleSubtask(taskId, subId) {
    setTasks(t => t.map(x => x.id === taskId
      ? { ...x, subtasks: x.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) }
      : x
    ))
  }

  function addSubtask(taskId) {
    const text = newSubtask[taskId]?.trim()
    if (!text) return
    setTasks(t => t.map(x => x.id === taskId
      ? { ...x, subtasks: [...x.subtasks, { id: Date.now(), title: text, done: false }] }
      : x
    ))
    setNewSubtask(n => ({ ...n, [taskId]: '' }))
  }

  function deleteSubtask(taskId, subId) {
    setTasks(t => t.map(x => x.id === taskId
      ? { ...x, subtasks: x.subtasks.filter(s => s.id !== subId) }
      : x
    ))
  }

  const filtered = tasks.filter(t => {
    if (filterProject !== 'All' && t.project !== filterProject) return false
    if (filterStatus === 'active' && t.done) return false
    if (filterStatus === 'done' && !t.done) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activeCount = tasks.filter(t => !t.done).length
  const doneCount = tasks.filter(t => t.done).length

  const isOverdue = (dateStr) => dateStr && new Date(dateStr) < new Date() && dateStr !== new Date().toISOString().split('T')[0]

  return (
    <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activeCount} active · {doneCount} completed</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowTemplates(true)}>
            From template
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNew}>
            <Plus size={16} /> New task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input" value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ minWidth: 180 }}>
          <option>All</option>
          {PROJECTS.slice(1).map(p => <option key={p.id}>{p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['active', 'Active'], ['all', 'All'], ['done', 'Done']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: filterStatus === val ? 'var(--accent)' : 'var(--surface)',
              color: filterStatus === val ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.825rem',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {filtered.map(task => {
            const expanded = expandedTask === task.id
            const completedSubs = task.subtasks.filter(s => s.done).length
            const overdue = !task.done && isOverdue(task.due_date)

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Checkbox */}
                  <button onClick={() => toggleTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                    {task.done
                      ? <CheckCircle2 size={20} color="#22c55e" />
                      : <Circle size={20} color="var(--text-muted)" />}
                  </button>

                  <PriorityDot priority={task.priority} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                      {task.project !== '— No project —' && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Briefcase size={10} /> {task.project}
                        </span>
                      )}
                      {task.subtasks.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completedSubs}/{task.subtasks.length} subtasks</span>
                      )}
                      {task.portal_visible && (
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 99, background: '#6366f115', color: '#818cf8' }}>client visible</span>
                      )}
                    </div>
                  </div>

                  {task.due_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.775rem', color: overdue ? '#ef4444' : 'var(--text-muted)', flexShrink: 0 }}>
                      <Calendar size={12} />
                      {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 2 }}>
                    {task.subtasks.length > 0 && (
                      <button onClick={() => setExpandedTask(expanded ? null : task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}
                    <button onClick={() => openEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Subtasks */}
                <AnimatePresence>
                  {(expanded || task.subtasks.length === 0 ? false : false) || expanded ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid var(--border)', padding: '10px 16px 12px 48px', background: 'var(--bg-secondary)' }}>
                      {task.subtasks.map(sub => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                          <button onClick={() => toggleSubtask(task.id, sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            {sub.done ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="var(--text-muted)" />}
                          </button>
                          <span style={{ flex: 1, fontSize: '0.825rem', color: sub.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: sub.done ? 'line-through' : 'none' }}>
                            {sub.title}
                          </span>
                          <button onClick={() => deleteSubtask(task.id, sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {/* Add subtask */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <input className="input" placeholder="Add subtask..." value={newSubtask[task.id] || ''}
                          onChange={e => setNewSubtask(n => ({ ...n, [task.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addSubtask(task.id)}
                          style={{ fontSize: '0.8rem', padding: '6px 10px', flex: 1 }} />
                        <button onClick={() => addSubtask(task.id)} style={{ padding: '6px 10px', background: 'var(--accent)', border: 'none', borderRadius: 7, cursor: 'pointer', color: 'white' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <CheckSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No tasks found.</p>
          </div>
        )}
      </div>

      {/* New/Edit Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editId ? 'Edit task' : 'New task'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={saveTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Task title</label>
                  <input className="input" placeholder="What needs to be done?" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Project</label>
                    <select className="input" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))}>
                      {PROJECTS.map(p => <option key={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Priority</label>
                    <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Due date</label>
                  <input type="date" className="input" value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea className="input" rows={2} value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div onClick={() => setForm(f => ({ ...f, portal_visible: !f.portal_visible }))}
                    style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: form.portal_visible ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: form.portal_visible ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Visible to client in portal</span>
                </label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editId ? 'Save changes' : 'Create task'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Task templates</h2>
                <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              {TEMPLATES.map(tmpl => (
                <div key={tmpl.name} className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 8 }}>{tmpl.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {tmpl.tasks.map(t => (
                      <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>
                    ))}
                  </div>
                  <button onClick={() => {
                    const now = new Date()
                    tmpl.tasks.forEach((title, i) => {
                      setTasks(prev => [...prev, { id: Date.now() + i, title, project: '— No project —', priority: 'medium', due_date: '', done: false, notes: '', portal_visible: false, subtasks: [] }])
                    })
                    setShowTemplates(false)
                  }} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                    Use template
                  </button>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
