import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, Film, Archive, Download, Trash2, FolderOpen, Search } from 'lucide-react'

const fileTypes = {
  pdf: { icon: FileText, color: '#f87171' },
  png: { icon: Image, color: '#38bdf8' },
  jpg: { icon: Image, color: '#38bdf8' },
  mp4: { icon: Film, color: '#0071e3' },
  zip: { icon: Archive, color: '#f59e0b' },
  default: { icon: FolderOpen, color: '#94a3b8' },
}

const initialFiles = [
  { id: 1, name: 'Webflow-Redesign-Final.pdf', project: 'Webflow Redesign', client: 'Acme Co.', size: '2.4 MB', type: 'pdf', uploaded: '2026-04-10', by: 'you' },
  { id: 2, name: 'Logo-Final-v3.png', project: 'Brand Identity', client: 'Sara Johnson', size: '540 KB', type: 'png', uploaded: '2026-04-08', by: 'you' },
  { id: 3, name: 'App-Screens-Review.mp4', project: 'Mobile App UI', client: 'TechStart', size: '18.2 MB', type: 'mp4', uploaded: '2026-04-06', by: 'you' },
  { id: 4, name: 'Brief-Assets.zip', project: 'E-commerce Site', client: 'Boutique XO', size: '6.1 MB', type: 'zip', uploaded: '2026-04-04', by: 'client' },
  { id: 5, name: 'Contract-Signed.pdf', project: 'Brand Identity', client: 'Sara Johnson', size: '124 KB', type: 'pdf', uploaded: '2026-03-18', by: 'you' },
  { id: 6, name: 'Inspiration-Board.jpg', project: 'E-commerce Site', client: 'Boutique XO', size: '3.8 MB', type: 'jpg', uploaded: '2026-03-25', by: 'client' },
]

export default function Files() {
  const [files, setFiles] = useState(initialFiles)
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.project.toLowerCase().includes(search.toLowerCase()) ||
    f.client.toLowerCase().includes(search.toLowerCase())
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const droppedFiles = [...e.dataTransfer.files]
    const newFiles = droppedFiles.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      project: 'General',
      client: 'You',
      size: `${(f.size / 1024).toFixed(0)} KB`,
      type: f.name.split('.').pop().toLowerCase(),
      uploaded: new Date().toISOString().split('T')[0],
      by: 'you',
    }))
    setFiles(prev => [...newFiles, ...prev])
  }

  const handleDelete = (id) => setFiles(prev => prev.filter(f => f.id !== id))

  const totalSize = '31.2 MB'
  const storagePercent = 31

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Files</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Share deliverables and receive assets from clients</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              {totalSize} / 20 GB used
            </div>
            <div style={{ width: 120, height: 4, background: 'var(--border-light)', borderRadius: 999 }}>
              <div style={{ width: `${storagePercent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent), #2997ff)' }} />
            </div>
          </div>
          <button onClick={() => inputRef.current.click()} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }}>
            <Upload size={15} /> Upload files
          </button>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
            onChange={e => {
              const f = [...e.target.files].map(f => ({
                id: Date.now() + Math.random(), name: f.name, project: 'General', client: 'You',
                size: `${(f.size / 1024).toFixed(0)} KB`, type: f.name.split('.').pop().toLowerCase(),
                uploaded: new Date().toISOString().split('T')[0], by: 'you',
              }))
              setFiles(prev => [...f, ...prev])
            }}
          />
        </div>
      </motion.div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search files…" style={{ paddingLeft: 36, maxWidth: 360 }} />
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{ borderColor: dragging ? 'var(--accent)' : 'var(--border-light)', background: dragging ? 'rgba(0,113,227,0.05)' : 'transparent' }}
        style={{
          border: '2px dashed var(--border-light)', borderRadius: 8, padding: '28px',
          textAlign: 'center', marginBottom: 24, cursor: 'pointer', transition: 'all 0.2s',
        }}
        onClick={() => inputRef.current.click()}
      >
        <Upload size={24} color={dragging ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.875rem', color: dragging ? 'var(--accent)' : 'var(--text-muted)' }}>
          {dragging ? 'Drop files here' : 'Drag & drop files here, or click to select'}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Max 100MB per file · PDF, PNG, JPG, MP4, ZIP and more</p>
      </motion.div>

      {/* Files grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        <AnimatePresence>
          {filtered.map((file, i) => {
            const ext = fileTypes[file.type] || fileTypes.default
            return (
              <motion.div key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '16px', position: 'relative', overflow: 'hidden',
                  backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${ext.color}18`, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ext.icon size={18} color={ext.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: 1 }}>{file.project}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.size}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                      background: file.by === 'client' ? 'rgba(56,189,248,0.15)' : 'rgba(0,113,227,0.15)',
                      color: file.by === 'client' ? '#38bdf8' : 'var(--accent)',
                    }}>
                      {file.by === 'client' ? 'from client' : 'uploaded by you'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Download">
                      <Download size={14} />
                    </button>
                    <button onClick={() => handleDelete(file.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          No files found
        </div>
      )}
    </div>
  )
}
