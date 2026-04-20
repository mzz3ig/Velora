import { useState, useRef, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { sendPortalMessage } from '../../lib/portal'

export default function PortalMessages() {
  const { token, freelancer, portal, setPortal } = useOutletContext()
  const conversation = portal?.messages?.[0]
  const messages = useMemo(() => conversation?.messages || [], [conversation])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim()) return
    const text = input.trim()
    setSending(true)
    setError('')
    try {
      const next = await sendPortalMessage(token, text)
      if (next?.error) setError('Unable to send this message.')
      else {
        setPortal(next)
        setInput('')
      }
    } catch (err) {
      setError(err.message || 'Unable to send this message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Messages</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Direct line to {freelancer.name}</p>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
              No messages yet. Start the conversation below.
            </div>
          )}
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'client' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '10px 14px', borderRadius: msg.from === 'client' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.from === 'client' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: msg.from === 'client' ? 'white' : 'var(--text-primary)',
                fontSize: '0.875rem', lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {msg.time ? new Date(msg.time).toLocaleString() : ''}
              </span>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: 10, flexDirection: 'column' }}>
          {error && <div className="badge badge-red" style={{ width: 'fit-content', padding: '6px 10px', borderRadius: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message… (Enter to send)"
            style={{ flex: 1 }} />
          <button onClick={send} disabled={sending} style={{
            padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8,
            cursor: sending ? 'not-allowed' : 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6,
            opacity: sending ? 0.7 : 1,
          }}>
            <Send size={15} />
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}
