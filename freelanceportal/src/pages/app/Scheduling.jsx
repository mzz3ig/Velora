import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Plus, X, Clock, Link, Check, Edit2, Trash2,
  Globe, DollarSign, Video, Copy, ToggleLeft, Users, Calendar,
} from 'lucide-react'

const DURATIONS = [15, 30, 45, 60, 90, 120]

const INITIAL_EVENT_TYPES = [
  {
    id: 1, name: 'Discovery Call', duration: 30, color: '#6366f1',
    description: 'Initial 30-min call to understand your needs and see if we are a good fit.',
    price: 0, active: true, location: 'Google Meet',
  },
  {
    id: 2, name: 'Strategy Session', duration: 60, color: '#f59e0b',
    description: 'Deep-dive session to plan your project roadmap.',
    price: 150, active: true, location: 'Zoom',
  },
  {
    id: 3, name: 'Design Review', duration: 45, color: '#22c55e',
    description: 'Review designs and collect feedback.',
    price: 0, active: false, location: 'Google Meet',
  },
]

const BOOKINGS = [
  { id: 1, event_type: 'Discovery Call', client: 'Lucas Müller', email: 'lucas@example.com', date: '2026-04-22', time: '14:00', status: 'confirmed', notes: 'Wants website and branding' },
  { id: 2, event_type: 'Strategy Session', client: 'Sara Johnson', email: 'sara@example.com', date: '2026-04-24', time: '10:00', status: 'confirmed', notes: '' },
  { id: 3, event_type: 'Discovery Call', client: 'Marcus Webb', email: 'marcus@example.com', date: '2026-04-19', time: '16:30', status: 'pending', notes: '' },
]

const AVAILABILITY = [
  { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '15:00' },
  { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
  { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
]

const EMPTY_EVENT = {
  name: '', duration: 30, color: '#6366f1', description: '',
  price: 0, active: true, location: 'Google Meet',
}

export default function Scheduling() {
  const [eventTypes, setEventTypes] = useState(INITIAL_EVENT_TYPES)
  const [bookings, setBookings] = useState(BOOKINGS)
  const [availability, setAvailability] = useState(AVAILABILITY)
  const [tab, setTab] = useState('bookings') // bookings | event_types | availability
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [copied, setCopied] = useState(null)

  function openNew() { setForm(EMPTY_EVENT); setEditEvent(null); setShowModal(true) }
  function openEdit(ev) { setForm({ ...ev }); setEditEvent(ev.id); setShowModal(true) }

  function saveEvent(e) {
    e.preventDefault()
    if (editEvent) {
      setEventTypes(et => et.map(x => x.id === editEvent ? { ...x, ...form } : x))
    } else {
      setEventTypes(et => [...et, { id: Date.now(), ...form }])
    }
    setShowModal(false)
  }

  function deleteEvent(id) { setEventTypes(et => et.filter(x => x.id !== id)) }
  function toggleEvent(id) { setEventTypes(et => et.map(x => x.id === id ? { ...x, active: !x.active } : x)) }

  function copyLink(id) {
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function updateAvailability(index, updates) {
    setAvailability(a => a.map((x, i) => i === index ? { ...x, ...updates } : x))
  }

  const upcoming = bookings.filter(b => new Date(b.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date))
  const past = bookings.filter(b => new Date(b.date) < new Date())

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

      {/* Tabs */}
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

      {/* Bookings tab */}
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
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.event_type}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{b.client} · {b.email}</div>
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
                portal.freelanceportal.com/book/rodrigo
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
                    <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{b.event_type} — {b.client}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{b.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event types tab */}
      {tab === 'event_types' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {eventTypes.map(ev => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ padding: 20, opacity: ev.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 40, borderRadius: 3, background: ev.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>{ev.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={11} /> {ev.duration} min
                      {ev.price > 0 && <> · <DollarSign size={11} /> €{ev.price}</>}
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => toggleEvent(ev.id)}
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
                <button onClick={() => deleteEvent(ev.id)} style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)' }}
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

      {/* Availability tab */}
      {tab === 'availability' && (
        <div>
          <div className="card" style={{ padding: '24px', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Globe size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Timezone: Europe/Lisbon (UTC+1)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>Calendar sync (Google, Apple, Outlook) — available in Phase 1</p>
            {availability.map((day, i) => (
              <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div onClick={() => updateAvailability(i, { enabled: !day.enabled })}
                  style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: day.enabled ? 'var(--accent)' : 'var(--border-light)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: day.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: day.enabled ? 'var(--text-primary)' : 'var(--text-muted)', width: 90 }}>{day.day}</span>
                {day.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="time" value={day.start} onChange={e => updateAvailability(i, { start: e.target.value })}
                      className="input" style={{ width: 100, padding: '6px 10px' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>to</span>
                    <input type="time" value={day.end} onChange={e => updateAvailability(i, { end: e.target.value })}
                      className="input" style={{ width: 100, padding: '6px 10px' }} />
                  </div>
                ) : (
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Unavailable</span>
                )}
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }}>Save availability</button>
          </div>
        </div>
      )}

      {/* Event type modal */}
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
                    {['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#8b5cf6', '#f97316'].map(color => (
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
