import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Plus, X, Trash2, Edit2, ChevronDown, ChevronRight, Calendar, Circle, CheckCircle2, Search, Briefcase, MessageSquare, Send, Columns, List } from 'lucide-react'
import { useTaskStore, useProjectStore } from '../../store'

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low', label: 'Low', color: '#22c55e' },
]

const TEMPLATES = [
  { name: 'Client onboarding', tasks: ['Send welcome email', 'Schedule kickoff call', 'Share project brief', 'Set up client portal'] },
  { name: 'Website project', tasks: ['Wireframes', 'Design mockups', 'Client review', 'Development', 'QA testing', 'Launch'] },
  { name: 'Brand identity', tasks: ['Research', 'Logo concepts', 'Client presentation', 'Revisions', 'Final delivery'] },
]

const EMPTY_FORM = { title: '', projectId: '', project: '— No project —', priority: 'medium', due_date: '', notes: '', portal_visible: false, assignee: '' }

function PriorityDot({ priority }) {
  const p = PRIORITIES.find(x => x.value === priority)
  return <div style={{ width: 8, height: 8, borderRadius: '50%', background: p?.color || '#94a3b8', flexShrink: 0 }} title={p?.label} />
}

function CommentPanel({ task, onClose }) {
  const { addComment } = useTaskStore()
  const [text, setText] = useState('')
  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addComment(task.id, text.trim())
    setText('')
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="card" style={{ width: '100%', maxWidth: 460, padding: 24, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Comments — {task.title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
          {(task.comments || []).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: 20 }}>No comments yet.</div>
          ) : (task.comments || []).map(c => (
            <div key={c.id} style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.text}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(c.time).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
        </div>
        <form onSubmit={send} style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Add a comment…" value={text} onChange={e => setText(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}><Send size={14} /></button>
        </form>
      </motion.div>
    </motion.div>
  )
}

const KANBAN_COLS = [
  { id: 'todo', label: 'To Do', color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'in_review', label: 'In Review', color: '#a98252' },
  { id: 'done', label: 'Done', color: '#22c55e' },
]

function KanbanView({ tasks, updateTask, deleteTask, onEdit, onComment }) {
  const [draggedId, setDraggedId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  const getColTasks = (colId) => tasks.filter(t => {
    if (colId === 'done') return t.done
    if (colId === 'todo') return !t.done && !t.kanban_col
    return !t.done && t.kanban_col === colId
  })

  const drop = (colId) => {
    if (!draggedId) return
    if (colId === 'done') {
      updateTask(draggedId, { done: true, kanban_col: 'done' })
    } else {
      updateTask(draggedId, { done: false, kanban_col: colId })
    }
    setDraggedId(null); setOverCol(null)
  }

  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, minHeight: 400 }}>
      {KANBAN_COLS.map(col => {
        const colTasks = getColTasks(col.id)
        const isOver = overCol === col.id
        return (
          <div key={col.id}
            onDragOver={e => { e.preventDefault(); setOverCol(col.id) }}
            onDrop={() => drop(col.id)}
            onDragLeave={() => setOverCol(null)}
            style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: isOver ? 'rgba(169,130,82,0.06)' : 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
            <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>{col.label}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--border-light)', padding: '1px 6px', borderRadius: 99, marginLeft: 'auto' }}>{colTasks.length}</span>
            </div>
            <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {colTasks.map(task => {
                const p = PRIORITIES.find(x => x.value === task.priority)
                return (
                  <motion.div key={task.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    draggable onDragStart={() => setDraggedId(task.id)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'grab', opacity: draggedId === task.id ? 0.45 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = col.color + '60'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: p?.color || '#94a3b8', marginTop: 4, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, flex: 1, color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
                    </div>
                    {task.project !== '— No project —' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={9} />{task.project}</div>
                    )}
                    {task.due_date && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <Calendar size={10} />{new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => onComment(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><MessageSquare size={12} /></button>
                      <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><Edit2 size={12} /></button>
                      <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={12} /></button>
                    </div>
                  </motion.div>
                )
              })}
              {colTasks.length === 0 && (
                <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', opacity: 0.6 }}>Drop here</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Tasks() {
  const { tasks, addTask, updateTask, toggleTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask } = useTaskStore()
  const { projects } = useProjectStore()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedTask, setExpandedTask] = useState(null)
  const [filterProject, setFilterProject] = useState('All')
  const [filterStatus, setFilterStatus] = useState('active')
  const [search, setSearch] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [newSubtask, setNewSubtask] = useState({})
  const [commentTask, setCommentTask] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  function openNew() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }
  function openEdit(task) {
    setForm({ title: task.title, projectId: task.projectId || '', project: task.project, priority: task.priority, due_date: task.due_date, notes: task.notes, portal_visible: task.portal_visible, assignee: task.assignee || '' })
    setEditId(task.id); setShowModal(true)
  }

  function saveTask(e) {
    e.preventDefault()
    const proj = projects.find(p => p.id === parseInt(form.projectId))
    const data = { ...form, project: proj?.name || '— No project —', projectId: proj?.id || null }
    if (editId) { updateTask(editId, data) } else { addTask(data) }
    setShowModal(false)
  }

  const filtered = tasks.filter(t => {
    if (filterProject !== 'All' && t.project !== filterProject) return false
    if (filterStatus === 'active' && t.done) return false
    if (filterStatus === 'done' && !t.done) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const isOverdue = (dateStr) => dateStr && new Date(dateStr) < new Date() && dateStr !== new Date().toISOString().split('T')[0]

  return (
    <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tasks.filter(t=>!t.done).length} active · {tasks.filter(t=>t.done).length} completed</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', background: viewMode === 'list' ? 'var(--surface)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}><List size={14} /> List</button>
            <button onClick={() => setViewMode('kanban')} style={{ padding: '6px 10px', background: viewMode === 'kanban' ? 'var(--surface)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}><Columns size={14} /> Kanban</button>
          </div>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowTemplates(true)}>From template</button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNew}><Plus size={16} /> New task</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input" value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ minWidth: 180 }}>
          <option>All</option>
          {projects.map(p => <option key={p.id}>{p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['active','Active'],['all','All'],['done','Done']].map(([val,label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: filterStatus === val ? 'var(--accent)' : 'var(--surface)', color: filterStatus === val ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.825rem' }}>{label}</button>
          ))}
        </div>
      </div>

      {viewMode === 'kanban' && (
        <KanbanView tasks={tasks.filter(t => {
          if (filterProject !== 'All' && t.project !== filterProject) return false
          if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
          return true
        })} updateTask={updateTask} deleteTask={deleteTask} onEdit={openEdit} onComment={setCommentTask} />
      )}

      {viewMode === 'list' && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {filtered.map(task => {
            const expanded = expandedTask === task.id
            const completedSubs = task.subtasks.filter(s => s.done).length
            const overdue = !task.done && isOverdue(task.due_date)
            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => toggleTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                    {task.done ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} color="var(--text-muted)" />}
                  </button>
                  <PriorityDot priority={task.priority} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                      {task.project !== '— No project —' && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={10} /> {task.project}</span>
                      )}
                      {task.subtasks.length > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completedSubs}/{task.subtasks.length} subtasks</span>}
                      {task.portal_visible && <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 99, background: '#a9825215', color: '#9a7850' }}>client visible</span>}
                      {task.assignee && <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{task.assignee}</span>}
                      {(task.comments||[]).length > 0 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}><MessageSquare size={9} /> {task.comments.length}</span>}
                    </div>
                  </div>
                  {task.due_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.775rem', color: overdue ? '#ef4444' : 'var(--text-muted)', flexShrink: 0 }}>
                      <Calendar size={12} />{new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button onClick={() => setCommentTask(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#9a7850'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><MessageSquare size={13} /></button>
                    {task.subtasks.length > 0 && (
                      <button onClick={() => setExpandedTask(expanded ? null : task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}
                    <button onClick={() => openEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Edit2 size={13} /></button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={13} /></button>
                  </div>
                </div>
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid var(--border)', padding: '10px 16px 12px 48px', background: 'var(--bg-secondary)' }}>
                      {task.subtasks.map(sub => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                          <button onClick={() => toggleSubtask(task.id, sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            {sub.done ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="var(--text-muted)" />}
                          </button>
                          <span style={{ flex: 1, fontSize: '0.825rem', color: sub.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: sub.done ? 'line-through' : 'none' }}>{sub.title}</span>
                          <button onClick={() => deleteSubtask(task.id, sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><X size={12} /></button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <input className="input" placeholder="Add subtask..." value={newSubtask[task.id] || ''}
                          onChange={e => setNewSubtask(n => ({ ...n, [task.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') { addSubtask(task.id, newSubtask[task.id] || ''); setNewSubtask(n => ({...n,[task.id]:''})) }}}
                          style={{ fontSize: '0.8rem', padding: '6px 10px', flex: 1 }} />
                        <button onClick={() => { addSubtask(task.id, newSubtask[task.id] || ''); setNewSubtask(n => ({...n,[task.id]:''})) }} style={{ padding: '6px 10px', background: 'var(--accent)', border: 'none', borderRadius: 7, cursor: 'pointer', color: 'white' }}><Plus size={14} /></button>
                      </div>
                    </motion.div>
                  )}
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
      </div>}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editId ? 'Edit task' : 'New task'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={saveTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label className="label">Task title</label><input className="input" placeholder="What needs to be done?" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label className="label">Project</label>
                    <select className="input" value={form.projectId} onChange={e => setForm(f=>({...f,projectId:e.target.value}))}>
                      <option value="">— No project —</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Priority</label>
                    <select className="input" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label className="label">Due date</label><input type="date" className="input" value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))} /></div>
                  <div><label className="label">Assignee</label><input className="input" placeholder="e.g. Rodrigo" value={form.assignee} onChange={e => setForm(f=>({...f,assignee:e.target.value}))} /></div>
                </div>
                <div><label className="label">Notes (optional)</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} style={{ resize: 'vertical' }} /></div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div onClick={() => setForm(f=>({...f,portal_visible:!f.portal_visible}))} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: form.portal_visible ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
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
        {showTemplates && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Task templates</h2>
                <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              {TEMPLATES.map(tmpl => (
                <div key={tmpl.name} className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>{tmpl.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {tmpl.tasks.map(t => <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>)}
                  </div>
                  <button onClick={() => {
                    tmpl.tasks.forEach((title) => {
                      addTask({ title, projectId: null, project: '— No project —', priority: 'medium', due_date: '', notes: '', portal_visible: false, assignee: '' })
                    })
                    setShowTemplates(false)
                  }} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>Use template</button>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
        {commentTask && <CommentPanel task={commentTask} onClose={() => setCommentTask(null)} />}
      </AnimatePresence>
    </div>
  )
}
