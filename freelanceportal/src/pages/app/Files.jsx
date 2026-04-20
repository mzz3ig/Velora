import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, Film, Archive, Download, Trash2, FolderOpen, Search, X, Folder, Eye, Loader2, AlertCircle } from 'lucide-react'
import { useFileStore } from '../../store'
import { uploadFile, deleteStorageFile, getSignedUrl } from '../../lib/storage'
import { supabase } from '../../lib/supabase'

const fileTypeMap = {
  pdf: { icon: FileText, color: '#f87171' },
  png: { icon: Image, color: '#38bdf8' },
  jpg: { icon: Image, color: '#38bdf8' },
  jpeg: { icon: Image, color: '#38bdf8' },
  gif: { icon: Image, color: '#38bdf8' },
  webp: { icon: Image, color: '#38bdf8' },
  svg: { icon: Image, color: '#38bdf8' },
  mp4: { icon: Film, color: '#a98252' },
  mov: { icon: Film, color: '#a98252' },
  zip: { icon: Archive, color: '#f59e0b' },
  rar: { icon: Archive, color: '#f59e0b' },
  default: { icon: FolderOpen, color: '#94a3b8' },
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])

function formatSize(bytes) {
  if (!bytes || typeof bytes === 'string') return bytes || '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilePreviewModal({ file, onClose }) {
  const isImage = IMAGE_EXTS.has((file.type || '').toLowerCase())
  const isPdf = file.type === 'pdf'
  const previewSrc = file.signedUrl || file.publicUrl || file.dataUrl
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', maxWidth: 860, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{file.name}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-secondary)' }}>
          {isImage && previewSrc ? (
            <img src={previewSrc} alt={file.name} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
          ) : isPdf && previewSrc ? (
            <iframe src={previewSrc} title={file.name} style={{ width: '100%', height: '65vh', border: 'none', borderRadius: 8 }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <FolderOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.875rem' }}>Preview not available for this file type.</p>
              <p style={{ fontSize: '0.78rem', marginTop: 4 }}>{file.name}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Files() {
  const { files, addFile, deleteFile } = useFileStore()
  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('All')
  const [filterProject, setFilterProject] = useState('All')
  const [dragging, setDragging] = useState(false)
  const [groupBy, setGroupBy] = useState('none')
  const [previewFile, setPreviewFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef()

  const filtered = files.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = f.name.toLowerCase().includes(q) || (f.project || '').toLowerCase().includes(q) || (f.client || '').toLowerCase().includes(q)
    const matchClient = filterClient === 'All' || f.client === filterClient
    const matchProject = filterProject === 'All' || f.project === filterProject
    return matchSearch && matchClient && matchProject
  })

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    processFiles([...e.dataTransfer.files])
  }

  const processFiles = async (fileList) => {
    if (fileList.length === 0) return
    setUploading(true)
    setUploadError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadError('You must be signed in to upload files.'); setUploading(false); return }

    for (const f of fileList) {
      const ext = f.name.split('.').pop().toLowerCase()
      try {
        const { path } = await uploadFile(f, user.id)
        addFile({
          name: f.name,
          size: f.size,
          project: null,
          projectId: null,
          client: null,
          clientId: null,
          type: ext,
          fromClient: false,
          folder: null,
          storagePath: path,
        })
      } catch (err) {
        setUploadError(`Failed to upload ${f.name}: ${err.message}`)
      }
    }
    setUploading(false)
  }

  const handleDelete = async (file) => {
    if (file.storagePath) {
      try { await deleteStorageFile(file.storagePath) } catch { /* best effort */ }
    }
    deleteFile(file.id)
  }

  const handleDownload = async (file) => {
    if (!file.storagePath && !file.publicUrl) return
    const href = file.storagePath ? await getSignedUrl(file.storagePath, 300) : file.publicUrl
    const a = document.createElement('a')
    a.href = href
    a.download = file.name
    a.target = '_blank'
    a.click()
  }

  const openPreview = async (file) => {
    if (file.storagePath) {
      const signedUrl = await getSignedUrl(file.storagePath, 300)
      setPreviewFile({ ...file, signedUrl })
      return
    }
    setPreviewFile(file)
  }

  const totalBytes = files.reduce((s, f) => s + (typeof f.size === 'number' ? f.size : 0), 0)
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1)
  const storagePercent = Math.min((parseFloat(totalMB) / (20 * 1024)) * 100, 100)

  const clientNames = ['All', ...new Set(files.map(f => f.client).filter(Boolean))]
  const projectNames = ['All', ...new Set(files.map(f => f.project).filter(Boolean))]

  const grouped = (() => {
    if (groupBy === 'client') {
      const groups = {}
      filtered.forEach(f => { const k = f.client || 'Unassigned'; if (!groups[k]) groups[k] = []; groups[k].push(f) })
      return groups
    }
    if (groupBy === 'project') {
      const groups = {}
      filtered.forEach(f => { const k = f.project || 'Unassigned'; if (!groups[k]) groups[k] = []; groups[k].push(f) })
      return groups
    }
    return { 'All files': filtered }
  })()

  const canPreview = (f) => {
    const isImg = IMAGE_EXTS.has((f.type || '').toLowerCase())
    const isPdf = f.type === 'pdf'
    return (isImg || isPdf) && (f.storagePath || f.publicUrl || f.dataUrl)
  }

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
          <button onClick={() => inputRef.current.click()} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }} disabled={uploading}>
            {uploading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</> : <><Upload size={15} /> Upload files</>}
          </button>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => { processFiles([...e.target.files]); e.target.value = '' }} />
        </div>
      </motion.div>

      {uploadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', color: '#f87171' }}>
          <AlertCircle size={15} />
          {uploadError}
          <button onClick={() => setUploadError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><X size={14} /></button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <select className="input" value={groupBy} onChange={e => setGroupBy(e.target.value)} style={{ minWidth: 160 }}>
          <option value="none">No grouping</option>
          <option value="client">Group by client</option>
          <option value="project">Group by project</option>
        </select>
      </div>

      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{ borderColor: dragging ? 'var(--accent)' : 'var(--border-light)', background: dragging ? 'rgba(169,130,82,0.05)' : 'transparent' }}
        style={{ border: '2px dashed var(--border-light)', borderRadius: 8, padding: '28px', textAlign: 'center', marginBottom: 24, cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s' }}
        onClick={() => !uploading && inputRef.current.click()}>
        {uploading ? (
          <><Loader2 size={24} color="var(--accent)" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>Uploading to Supabase Storage…</p></>
        ) : (
          <><Upload size={24} color={dragging ? 'var(--accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.875rem', color: dragging ? 'var(--accent)' : 'var(--text-muted)' }}>
            {dragging ? 'Drop files here' : 'Drag & drop files here, or click to select'}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Files stored in Supabase Storage · Max 50MB per file</p></>
        )}
      </motion.div>

      {Object.entries(grouped).map(([group, groupFiles]) => (
        <div key={group} style={{ marginBottom: 28 }}>
          {groupBy !== 'none' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Folder size={15} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{group}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--border-light)', padding: '1px 7px', borderRadius: 99 }}>{groupFiles.length}</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            <AnimatePresence>
              {groupFiles.map((file, i) => {
                const ext = fileTypeMap[file.type] || fileTypeMap.default
                const previewable = canPreview(file)
                const previewSrc = file.publicUrl || file.dataUrl
                return (
                  <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -2 }}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', position: 'relative', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)', boxShadow: 'var(--shadow-sm)' }}>
                    {IMAGE_EXTS.has((file.type || '').toLowerCase()) && previewSrc && (
                      <div style={{ height: 120, overflow: 'hidden', background: 'var(--bg-secondary)', cursor: 'pointer' }} onClick={() => openPreview(file)}>
                        <img src={previewSrc} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${ext.color}18`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ext.icon size={16} color={ext.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{file.name}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: 1 }}>{file.project || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(file.size)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: file.fromClient ? 'rgba(56,189,248,0.15)' : 'rgba(169,130,82,0.15)', color: file.fromClient ? '#38bdf8' : 'var(--accent)' }}>
                          {file.fromClient ? 'from client' : 'uploaded by you'}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {previewable && (
                            <button onClick={() => openPreview(file)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} title="Preview"
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Eye size={14} /></button>
                          )}
                          {(file.storagePath || file.publicUrl) && (
                            <button onClick={() => handleDownload(file)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} title="Download"
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Download size={14} /></button>
                          )}
                          <button onClick={() => handleDelete(file)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }} title="Delete"
                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {filtered.length === 0 && !uploading && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No files found</div>
      )}

      <AnimatePresence>
        {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
