import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, Film, Archive, Download, Trash2, FolderOpen, Search, Filter } from 'lucide-react'
import { useFileStore } from '../../store'

const fileTypeMap = {
  pdf: { icon: FileText, color: '#f87171' },
  png: { icon: Image, color: '#38bdf8' },
  jpg: { icon: Image, color: '#38bdf8' },
  jpeg: { icon: Image, color: '#38bdf8' },
  mp4: { icon: Film, color: '#a98252' },
  zip: { icon: Archive, color: '#f59e0b' },
  image: { icon: Image, color: '#38bdf8' },
  default: { icon: FolderOpen, color: '#94a3b8' },
}

function formatSize(bytes) {
  if (!bytes || typeof bytes === 'string') return bytes || '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Files() {
  const { files, addFile, deleteFile } = useFileStore()
  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('All')
  const [filterProject, setFilterProject] = useState('All')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const filtered = files.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = f.name.toLowerCase().includes(q) || (f.project||'').toLowerCase().includes(q) || (f.client||'').toLowerCase().includes(q)
    const matchClient = filterClient === 'All' || f.client === filterClient
    const matchProject = filterProject === 'All' || f.project === filterProject
    return matchSearch && matchClient && matchProject
  })

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    processFiles([...e.dataTransfer.files])
  }

  const processFiles = (fileList) => {
    fileList.forEach(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      addFile({ name: f.name, size: f.size, project: null, projectId: null, client: null, clientId: null, type: ext, fromClient: false, folder: null })
    })
  }

  const totalBytes = files.reduce((s, f) => s + (typeof f.size === 'number' ? f.size : 0), 0)
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1)
  const storagePercent = Math.min((parseFloat(totalMB) / (20 * 1024)) * 100, 100)

  const clientNames = ['All', ...new Set(files.map(f => f.client).filter(Boolean))]
  const projectNames = ['All', ...new Set(files.map(f => f.project).filter(Boolean))]

  return (
    <div style={{ padding: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Files</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Share deliverables and receive assets from clients</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{totalMB} MB / 20 GB used</div>
            <div style={{ width: 120, height: 4, background: 'var(--border-light)', borderRadius: 999 }}>
              <div style={{ width: `${storagePercent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent), #bca57d)' }} />
            </div>
          </div>
          <button onClick={() => inputRef.current.click()} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }}>
            <Upload size={15} /> Upload files
          </button>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => { processFiles([...e.target.files]); e.target.value = '' }} />
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" style={{ paddingLeft: 36 }} />
        </div>
        <select className="input" value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ minWidth: 160 }}>
          {clientNames.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ minWidth: 180 }}>
          {projectNames.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{ borderColor: dragging ? 'var(--accent)' : 'var(--border-light)', background: dragging ? 'rgba(169,130,82,0.05)' : 'transparent' }}
        style={{ border: '2px dashed var(--border-light)', borderRadius: 8, padding: '28px', textAlign: 'center', marginBottom: 24, cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => inputRef.current.click()}>
        <Upload size={24} color={dragging ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.875rem', color: dragging ? 'var(--accent)' : 'var(--text-muted)' }}>
          {dragging ? 'Drop files here' : 'Drag & drop files here, or click to select'}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Max 100MB per file · PDF, PNG, JPG, MP4, ZIP and more</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        <AnimatePresence>
          {filtered.map((file, i) => {
            const ext = fileTypeMap[file.type] || fileTypeMap.default
            return (
              <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -2 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px', position: 'relative', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${ext.color}18`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ext.icon size={18} color={ext.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{file.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: 1 }}>{file.project || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(file.size)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: file.fromClient ? 'rgba(56,189,248,0.15)' : 'rgba(169,130,82,0.15)', color: file.fromClient ? '#38bdf8' : 'var(--accent)' }}>
                    {file.fromClient ? 'from client' : 'uploaded by you'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} title="Download"
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Download size={14} /></button>
                    <button onClick={() => deleteFile(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} title="Delete"
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No files found</div>
      )}
    </div>
  )
}
