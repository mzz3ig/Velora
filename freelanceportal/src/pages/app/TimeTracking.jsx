import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Clock, Plus, Trash2, X, Calendar, DollarSign, Timer, BarChart2, Download } from 'lucide-react'
import { useTimeStore, useProjectStore } from '../../store'

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function formatHours(h) {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

function exportCSV(entries) {
  const header = 'Date,Project,Client,Task,Hours,Billable,Invoiced,Notes\n'
  const rows = entries.map(e => `${e.date},"${e.project}","${e.client}","${e.task}",${e.hours},${e.billable ? 'Yes' : 'No'},${e.invoiced ? 'Yes' : 'No'},"${e.notes}"`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'timesheet.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function TimeTracking() {
  const { entries, addEntry, deleteEntry } = useTimeStore()
  const { projects } = useProjectStore()
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [timerProjectId, setTimerProjectId] = useState(projects[0]?.id || '')
  const [timerTask, setTimerTask] = useState('')
  const [timerBillable, setTimerBillable] = useState(true)
  const [showManual, setShowManual] = useState(false)
  const [filterProject, setFilterProject] = useState('All')
  const [filterDate, setFilterDate] = useState('all')
  const intervalRef = useRef(null)

  const timerProject = projects.find(p => p.id === parseInt(timerProjectId)) || projects[0]

  const [manualForm, setManualForm] = useState({
    projectId: projects[0]?.id || '', task: '', date: new Date().toISOString().split('T')[0], hours: '', billable: true, notes: '',
  })

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else { clearInterval(intervalRef.current) }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function stopTimer() {
    setRunning(false)
    if (elapsed > 60 && timerProject) {
      addEntry({ project: timerProject.name, projectId: timerProject.id, client: timerProject.client || '', task: timerTask || 'Untitled task', date: new Date().toISOString().split('T')[0], hours: Math.round((elapsed / 3600) * 100) / 100, billable: timerBillable, notes: '' })
    }
    setElapsed(0)
  }

  function addManual(e) {
    e.preventDefault()
    if (!manualForm.task || !manualForm.hours) return
    const proj = projects.find(p => p.id === parseInt(manualForm.projectId))
    addEntry({ project: proj?.name || '', projectId: proj?.id || null, client: proj?.client || '', ...manualForm, hours: parseFloat(manualForm.hours) })
    setManualForm({ projectId: projects[0]?.id || '', task: '', date: new Date().toISOString().split('T')[0], hours: '', billable: true, notes: '' })
    setShowManual(false)
  }

  const filtered = entries.filter(e => {
    if (filterProject !== 'All' && e.project !== filterProject) return false
    if (filterDate === 'today') return e.date === new Date().toISOString().split('T')[0]
    if (filterDate === 'week') { const d = new Date(e.date); const now = new Date(); return (now - d) / (1000*60*60*24) <= 7 }
    return true
  })

  const totalHours = filtered.reduce((s, e) => s + e.hours, 0)
  const billableHours = filtered.filter(e => e.billable).reduce((s, e) => s + e.hours, 0)
  const unbillableHours = totalHours - billableHours
  const billableRate = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0

  const grouped = filtered.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Time Tracking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track hours per project and task</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => exportCSV(entries)}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowManual(true)}>
            <Plus size={16} /> Log time manually
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '2.8rem', fontWeight: 700, color: running ? '#22c55e' : 'var(--text-primary)', minWidth: 200, transition: 'color 0.3s' }}>
            {formatDuration(elapsed)}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="input" style={{ flex: 1, minWidth: 180 }} value={timerProjectId} onChange={e => setTimerProjectId(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="What are you working on?" value={timerTask} onChange={e => setTimerTask(e.target.value)} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              <div onClick={() => setTimerBillable(b => !b)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: timerBillable ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: timerBillable ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
              <DollarSign size={14} /> Billable
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!running ? (
              <button onClick={() => setRunning(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <Play size={16} fill="white" /> Start
              </button>
            ) : (
              <>
                <button onClick={() => setRunning(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Pause size={16} /> Pause
                </button>
                <button onClick={stopTimer} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Square size={16} fill="white" /> Stop & Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total hours', value: formatHours(totalHours), icon: Clock, color: '#a98252' },
          { label: 'Billable', value: formatHours(billableHours), icon: DollarSign, color: '#22c55e' },
          { label: 'Non-billable', value: formatHours(unbillableHours), icon: Timer, color: '#94a3b8' },
          { label: 'Billable rate', value: `${billableRate}%`, icon: BarChart2, color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={18} color={stat.color} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="input" style={{ minWidth: 180 }} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option>All</option>
          {projects.map(p => <option key={p.id}>{p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all','All time'],['week','This week'],['today','Today']].map(([val,label]) => (
            <button key={val} onClick={() => setFilterDate(val)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: filterDate === val ? 'var(--accent)' : 'var(--surface)', color: filterDate === val ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.825rem' }}>{label}</button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).sort((a,b) => new Date(b[0]) - new Date(a[0])).map(([date, dayEntries]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{formatHours(dayEntries.reduce((s,e)=>s+e.hours,0))}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dayEntries.map(entry => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: entry.billable ? '#22c55e' : '#94a3b8' }} title={entry.billable ? 'Billable' : 'Non-billable'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{entry.task}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{entry.project} · {entry.client}</div>
                </div>
                {entry.notes && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', flex: 1, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.notes}</div>}
                {entry.invoiced && <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: '#a9825220', color: '#9a7850' }}>invoiced</span>}
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', minWidth: 50, textAlign: 'right' }}>{formatHours(entry.hours)}</div>
                <button onClick={() => deleteEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No time entries yet. Start the timer or log time manually.</p>
        </div>
      )}

      <AnimatePresence>
        {showManual && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card modal-surface" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Log time manually</h2>
                <button onClick={() => setShowManual(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={addManual} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label className="label">Project</label>
                    <select className="input" value={manualForm.projectId} onChange={e => setManualForm(f=>({...f,projectId:e.target.value}))}>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Date</label><input type="date" className="input" value={manualForm.date} onChange={e => setManualForm(f=>({...f,date:e.target.value}))} /></div>
                </div>
                <div><label className="label">Task description</label><input className="input" placeholder="What did you work on?" value={manualForm.task} onChange={e => setManualForm(f=>({...f,task:e.target.value}))} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label className="label">Hours</label><input type="number" step="0.25" min="0.25" max="24" className="input" placeholder="e.g. 2.5" value={manualForm.hours} onChange={e => setManualForm(f=>({...f,hours:e.target.value}))} required /></div>
                  <div><label className="label">Billable</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10 }}>
                      <div onClick={() => setManualForm(f=>({...f,billable:!f.billable}))} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: manualForm.billable ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s' }}>
                        <div style={{ position: 'absolute', top: 3, left: manualForm.billable ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{manualForm.billable ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                <div><label className="label">Notes (optional)</label><input className="input" placeholder="Any notes..." value={manualForm.notes} onChange={e => setManualForm(f=>({...f,notes:e.target.value}))} /></div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowManual(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Log time</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
