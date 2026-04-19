import { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

const INITIAL_MSGS = [
  { id: 1, from: 'freelancer', text: 'Hi! Welcome to your client portal. Feel free to ask me anything about the project.', time: '2026-04-07 09:30' },
  { id: 2, from: 'client', text: 'Thanks! When can I expect the first mockups?', time: '2026-04-07 10:15' },
  { id: 3, from: 'freelancer', text: 'I\'ll have the homepage mockup ready by Friday. I\'ll upload it here for your review.', time: '2026-04-07 10:22' },
]

export default function PortalMessages() {
  const { freelancer, client } = useOutletContext()
  const [messages, setMessages] = useState(INITIAL_MSGS)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function send() {
    if (!input.trim()) return
    setMessages(m => [...m, { id: Date.now(), from: 'client', text: input, time: 'Just now' }])
    setInput('')
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now() + 1, from: 'freelancer', text: 'Got your message! I\'ll get back to you shortly.', time: 'Just now' }])
    }, 1200)
  }

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Messages</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Direct line to {freelancer.name}</p>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>{msg.time}</span>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: 10 }}>
          <input className="input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message… (Enter to send)"
            style={{ flex: 1 }} />
          <button onClick={send} style={{
            padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8,
            cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
