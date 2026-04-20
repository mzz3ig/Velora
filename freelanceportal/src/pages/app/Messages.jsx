import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, MessageSquare } from 'lucide-react'
import { useMessageStore } from '../../store'

export default function Messages() {
  const { conversations, sendMessage, markRead } = useMessageStore()
  const [selectedId, setSelectedId] = useState(conversations[0]?.id)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const bottomRef = useRef()

  const selected = conversations.find(c => c.id === selectedId) || conversations[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId, conversations])

  const send = () => {
    if (!input.trim() || !selected) return
    sendMessage(selected.id, input.trim())
    setInput('')
  }

  const selectConv = (c) => {
    setSelectedId(c.id)
    markRead(c.id)
  }

  const filtered = conversations.filter(c =>
    c.client.toLowerCase().includes(search.toLowerCase()) ||
    c.project.toLowerCase().includes(search.toLowerCase())
  )

  if (!selected) return null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '32px 32px 0', paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Messages</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Per-project client communication</p>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ paddingLeft: 32, fontSize: '0.85rem' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(c => {
              const last = c.messages[c.messages.length - 1]
              const lastTime = last ? new Date(last.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
              return (
                <div key={c.id} onClick={() => selectConv(c)}
                  style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: selected.id === c.id ? 'rgba(169,130,82,0.08)' : 'transparent', borderLeft: selected.id === c.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: selected.id === c.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{c.client}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>{c.unread}</div>}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lastTime}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: 3 }}>{c.project}</div>
                  {last && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {last.from === 'me' ? 'You: ' : ''}{last.text}
                  </div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${selected.color}25`, border: `1px solid ${selected.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: selected.color }}>
              {selected.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selected.client}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{selected.project}</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selected.messages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ padding: '12px 16px', borderRadius: msg.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.from === 'me' ? 'var(--accent)' : 'var(--surface)', border: msg.from === 'me' ? 'none' : '1px solid var(--border)', fontSize: '0.875rem', lineHeight: 1.6, color: msg.from === 'me' ? 'white' : 'var(--text-secondary)' }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>
                    {new Date(msg.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Type a message… (Enter to send)" style={{ flex: 1 }} />
            <button onClick={send} className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}><Send size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
