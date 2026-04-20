import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function DangerAction({ title, description, buttonLabel, icon: Icon, onRun, delay }) {
  const [phase, setPhase] = useState('idle')
  const [typed, setTyped] = useState('')
  const confirmWord = title.toUpperCase().split(' ')[0]

  const execute = async () => {
    if (typed !== confirmWord) return
    setPhase('running')
    try {
      await onRun()
      setPhase('done')
    } catch (error) {
      alert(`Error: ${error.message}`)
      setPhase('idle')
    }
    setTyped('')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card" style={{ borderColor: 'rgba(248,113,113,0.24)' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(248,113,113,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color="#f87171" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</div>
        </div>
      </div>

      {phase === 'idle' && (
        <button onClick={() => setPhase('confirm')} className="btn-secondary btn-sm" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.26)' }}>
          <Icon size={12} /> {buttonLabel}
        </button>
      )}

      {phase === 'confirm' && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: '0.8rem', color: '#b42318', marginBottom: 8 }}>Type <strong>{confirmWord}</strong> to confirm:</div>
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value.toUpperCase())}
            placeholder={confirmWord}
            className="input"
            style={{ marginBottom: 8, fontFamily: 'monospace', letterSpacing: '0.08em' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={execute} disabled={typed !== confirmWord} className="btn-primary btn-sm" style={{ background: typed === confirmWord ? '#f87171' : 'var(--text-light)' }}>Confirm</button>
            <button onClick={() => { setPhase('idle'); setTyped('') }} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div className="badge badge-yellow" style={{ marginTop: 10 }}>
          <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> Running...
        </div>
      )}

      {phase === 'done' && <div className="badge badge-green" style={{ marginTop: 10 }}>Completed</div>}
    </motion.div>
  )
}

export default function AdminDanger() {
  const signOutGlobal = async () => {
    await supabase.auth.signOut({ scope: 'global' })
    window.location.assign('/login')
  }

  const actions = [
    {
      title: 'Sign Out Everywhere',
      description: 'Invalidates all active sessions for the admin account globally. You will be redirected to /login.',
      buttonLabel: 'Sign out globally',
      icon: LogOut,
      onRun: signOutGlobal,
      delay: 0.05,
    },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <AlertTriangle size={22} color="#f87171" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Danger Zone</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Irreversible platform-level operations. All require confirmation.</p>
      </motion.div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 22, padding: '12px 16px', borderColor: 'rgba(248,113,113,0.24)' }}>
        <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Admin actions cannot inspect, modify, or delete individual user content from this screen.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {actions.map((action) => <DangerAction key={action.title} {...action} />)}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="panel-soft" style={{ marginTop: 24, padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10 }}>Planned</div>
        {[
          'Suspend a user account while keeping data',
          'Delete a user account after a GDPR request',
          'Force-expire sessions for a specific user',
          'Send a platform-wide maintenance announcement',
        ].map((item) => (
          <div key={item} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 8, padding: '4px 0' }}>
            <span>-</span> {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
