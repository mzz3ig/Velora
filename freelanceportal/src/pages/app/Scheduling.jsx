import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Plus, X, Clock, Link, Check, Edit2, Trash2,
  Globe, DollarSign, Video,
} from 'lucide-react'
import { useSchedulingStore } from '../../store'

const DURATIONS = [15, 30, 45, 60, 90, 120]
const EMPTY_EVENT = { name: '', duration: 30, color: '#a98252', description: '', price: 0, active: true, location: 'Google Meet' }

export default function Scheduling() {
  const { eventTypes, bookings, availability, bufferMinutes, addEventType, updateEventType, deleteEventType, toggleEventType, updateAvailability, setBuffer } = useSchedulingStore()
  const [tab, setTab] = useState('bookings')
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [copied, setCopied] = useState(null)
  const [localAvail, setLocalAvail] = useState([...availability])
  const [availSaved, setAvailSaved] = useState(false)

  function openNew() { setForm(EMPTY_EVENT); setEditEvent(null); setShowModal(true) }
  function openEdit(ev) { setForm({ name: ev.name, duration: ev.duration, color: ev.color || '#a98252', description: ev.description, price: ev.price, active: ev.active, location: ev.location }); setEditEvent(ev.id); setShowModal(true) }

  function saveEvent(e) {
    e.preventDefault()
    if (editEvent) {
      updateEventType(editEvent, { ...form })
    } else {
      addEventType({ ...form })
    }
    setShowModal(false)
  }

  function copyLink(id) { setCopied(id); setTimeout(() => setCopied(null), 2000) }

  function updateLocalAvail(index, updates) {
    setLocalAvail(a => a.map((x, i) => i === index ? { ...x, ...updates } : x))
  }

  function saveAvailability() {
    updateAvailability(localAvail)
    setAvailSaved(true)
    setTimeout(() => setAvailSaved(false), 2000)
  }

  const now = new Date()
  const upcoming = bookings.filter(b => new Date(b.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))
  const past = bookings.filter(b => new Date(b.date) < now)

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Scheduling</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Let clients book time with you — no back-and-forth</p>
        </div>
        {tab === 'event_types' && (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNew}>
            <Plus size={16} /> New event type
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[['bookings', 'Bookings'], ['event_types', 'Event types'], ['availability', 'Availability']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.15s', marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'bookings' && (
        <div>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Upcoming</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(b => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'center', minWidth: 52 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {new Date(b.date + 'T12:00:00').getDate()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {new Date(b.date + 'T12:00:00').toLocaleString('en-GB', { month: 'short' })}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.eventType}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{b.client}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      <Clock size={14} /> {b.time}
                    </div>
                    <span style={{
                      fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99,
                      background: b.status === 'confirmed' ? '#22c55e20' : '#f59e0b20',
                      color: b.status === 'confirmed' ? '#22c55e' : '#f59e0b',
                    }}>{b.status}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {upcoming.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <CalendarDays size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No upcoming bookings. Share your booking link to get started.</p>
              <div style={{ marginTop: 16, padding: '10px 16px', background: 'var(--bg-secondary)', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.825rem', display: 'inline-block', color: 'var(--text-muted)' }}>
                portal.velora.com/book/rodrigo
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Past</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {past.map(b => (
                  <div key={b.id} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.6 }}>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', minWidth: 80 }}>{b.date}</div>
                    <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{b.eventType} — {b.client}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{b.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'event_types' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {eventTypes.map(ev => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ padding: 20, opacity: ev.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 40, borderRadius: 3, background: ev.color || '#a98252', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>{ev.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={11} /> {ev.duration} min
                      {ev.price > 0 && <> · €{ev.price}</>}
                    </div>
                  </div>
                </div>
                <div onClick={() => toggleEventType(ev.id)}
                  style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: ev.active ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: ev.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{ev.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                <Video size={12} /> {ev.location}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => copyLink(ev.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '7px 0', borderRadius: 7, border: `1px solid ${copied === ev.id ? '#22c55e' : 'var(--border)'}`,
                  background: copied === ev.id ? '#22c55e10' : 'var(--bg-secondary)',
                  color: copied === ev.id ? '#22c55e' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.775rem',
                }}>
                  {copied === ev.id ? <><Check size={12} /> Copied!</> : <><Link size={12} /> Copy link</>}
                </button>
                <button onClick={() => openEdit(ev)} style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteEventType(ev.id)} style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.01 }} onClick={openNew}
            style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 180, opacity: 0.6 }}>
            <Plus size={24} color="var(--text-muted)" />
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>New event type</span>
          </motion.div>
        </div>
      )}

      {tab === 'availability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Buffer between meetings</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>Add padding time between bookings so you're never back-to-back.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select className="input" value={bufferMinutes || 0} onChange={e => setBuffer(parseInt(e.target.value))} style={{ maxWidth: 180 }}>
                {[0, 5, 10, 15, 30, 45, 60].map(v => <option key={v} value={v}>{v === 0 ? 'No buffer' : `${v} minutes`}</option>)}
              </select>
              {(bufferMinutes || 0) > 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>✓ {bufferMinutes} min buffer active</span>
              )}
            </div>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Globe size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Timezone: Europe/Lisbon (UTC+1)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>Calendar sync (Google, Apple, Outlook) — available in Phase 1</p>
            {localAvail.map((day, i) => (
              <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div onClick={() => updateLocalAvail(i, { enabled: !day.enabled })}
                  style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: day.enabled ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: day.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: day.enabled ? 'var(--text-primary)' : 'var(--text-muted)', width: 90 }}>{day.day}</span>
                {day.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="time" value={day.start} onChange={e => updateLocalAvail(i, { start: e.target.value })}
                      className="input" style={{ width: 100, padding: '6px 10px' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>to</span>
                    <input type="time" value={day.end} onChange={e => updateLocalAvail(i, { end: e.target.value })}
                      className="input" style={{ width: 100, padding: '6px 10px' }} />
                  </div>
                ) : (
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Unavailable</span>
                )}
              </div>
            ))}
            <button onClick={saveAvailability} className="btn-primary" style={{ marginTop: 8 }}>
              {availSaved ? <><Check size={14} /> Saved!</> : 'Save availability'}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 480, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editEvent ? 'Edit event type' : 'New event type'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={saveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Event name</label>
                  <input className="input" placeholder="e.g. Discovery Call" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={2} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Duration (min)</label>
                    <select className="input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}>
                      {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Price (€, 0 = free)</label>
                    <input type="number" min="0" className="input" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Location / Meeting link</label>
                  <input className="input" placeholder="Google Meet, Zoom, or physical address" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Color</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['#a98252', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#8f6d43', '#f97316'].map(color => (
                      <div key={color} onClick={() => setForm(f => ({ ...f, color }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: color, cursor: 'pointer', border: form.color === color ? '3px solid white' : '3px solid transparent', boxShadow: form.color === color ? `0 0 0 2px ${color}` : 'none' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {editEvent ? 'Save changes' : 'Create event type'}
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
