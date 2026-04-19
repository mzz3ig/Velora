import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, MessageSquare } from 'lucide-react'

const conversations = [
  {
    id: 1, project: 'Webflow Redesign', client: 'Acme Corporation', clientColor: '#0071e3', unread: 0,
    messages: [
      { id: 1, from: 'client', text: 'Hi! Just wanted to check in on the progress. Are we still on track for the April 28 deadline?', time: '10:32 AM' },
      { id: 2, from: 'you', text: 'Hey! Yes, absolutely on track. I finished the Webflow build yesterday and I\'m doing QA today. I\'ll send you a preview link this afternoon.', time: '10:45 AM' },
      { id: 3, from: 'client', text: 'Amazing, sounds great! Looking forward to it.', time: '10:47 AM' },
    ],
  },
  {
    id: 2, project: 'Brand Identity', client: 'Sara Johnson', clientColor: '#22c55e', unread: 2,
    messages: [
      { id: 1, from: 'you', text: 'Hi Sara! I\'ve uploaded the final brand guidelines to your portal. Take a look and let me know if you\'d like any tweaks.', time: 'Yesterday' },
      { id: 2, from: 'client', text: 'I just reviewed it - the colors and typography are perfect! One small thing: can we make the logo slightly larger in the horizontal version?', time: 'Yesterday' },
      { id: 3, from: 'client', text: 'Also, is the final invoice ready? I\'d like to get that processed this week.', time: '9:12 AM' },
    ],
  },
  {
    id: 3, project: 'Mobile App UI', client: 'TechStart', clientColor: '#f59e0b', unread: 0,
    messages: [
      { id: 1, from: 'client', text: 'Can we schedule a quick call this week to review the wireframes?', time: '2 days ago' },
      { id: 2, from: 'you', text: 'Of course! I\'m free Thursday 2-4pm or Friday morning. What works for you?', time: '2 days ago' },
    ],
  },
  {
    id: 4, project: 'E-commerce Site', client: 'Boutique XO', clientColor: '#f472b6', unread: 1,
    messages: [
      { id: 1, from: 'client', text: 'We uploaded the new product photos to the files section. Can you integrate them into the product pages?', time: '3 days ago' },
    ],
  },
]

export default function Messages() {
  const [selected, setSelected] = useState(conversations[0])
  const [convos, setConvos] = useState(conversations)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected])

  const send = () => {
    if (!input.trim()) return
    const msg = { id: Date.now(), from: 'you', text: input, time: 'Just now' }
    const updated = convos.map(c => c.id === selected.id
      ? { ...c, messages: [...c.messages, msg], unread: 0 }
      : c
    )
    setConvos(updated)
    setSelected(prev => ({ ...prev, messages: [...prev.messages, msg] }))
    setInput('')
  }

  const filtered = convos.filter(c =>
    c.client.toLowerCase().includes(search.toLowerCase()) ||
    c.project.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '32px 32px 0', paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Messages</h1>
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
            {filtered.map(c => (
              <div key={c.id}
                onClick={() => { setSelected(c); setConvos(prev => prev.map(cv => cv.id === c.id ? {...cv, unread: 0} : cv)) }}
                style={{
                  padding: '14px 16px', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: selected.id === c.id ? 'rgba(0,113,227,0.08)' : 'transparent',
                  borderLeft: selected.id === c.id ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: selected.id === c.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {c.client}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.unread > 0 && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>
                        {c.unread}
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.messages[c.messages.length-1].time}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: 3 }}>{c.project}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.messages[c.messages.length-1].from === 'you' ? 'You: ' : ''}{c.messages[c.messages.length-1].text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${selected.clientColor}25`,
              border: `1px solid ${selected.clientColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: selected.clientColor }}>
              {selected.client.split(' ').map(w=>w[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selected.client}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{selected.project}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selected.messages.map((msg, i) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', justifyContent: msg.from === 'you' ? 'flex-end' : 'flex-start' }}
              >
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: msg.from === 'you' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.from === 'you'
                      ? 'var(--accent)'
                      : 'var(--surface)',
                    border: msg.from === 'you' ? 'none' : '1px solid var(--border)',
                    fontSize: '0.875rem', lineHeight: 1.6,
                    color: msg.from === 'you' ? 'white' : 'var(--text-secondary)',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4,
                    textAlign: msg.from === 'you' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message… (Enter to send)"
              style={{ flex: 1 }}
            />
            <button onClick={send} className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
