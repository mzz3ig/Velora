import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Upload, FileText, Image, Archive } from 'lucide-react'
import { getPortalFileUrl } from '../../lib/portal'

const typeIcon = { pdf: FileText, image: Image, zip: Archive }
const typeColor = { pdf: '#ef4444', image: '#06b6d4', zip: '#f59e0b' }

export default function PortalFiles() {
  const { token, freelancer, portal } = useOutletContext()
  const files = portal?.files || []

  const formatSize = (size) => {
    if (!size || typeof size === 'string') return size || '—'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  async function openFile(file) {
    const directUrl = file.url || file.publicUrl
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (!file.storagePath) return
    const url = await getPortalFileUrl(token, file.storagePath)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Files</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Deliverables and shared assets</p>

      {/* Upload zone */}
      <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '24px', textAlign: 'center', marginBottom: 24, cursor: 'pointer', opacity: 0.7 }}>
        <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>Upload files to share with {freelancer.name}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Client uploads need a connected storage bucket before files can be accepted here.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {files.length === 0 ? (
          <div className="card" style={{ padding: 28, color: 'var(--text-muted)' }}>
            No files have been shared in this portal yet.
          </div>
        ) : files.map(file => {
          const Icon = typeIcon[file.type] || FileText
          const color = typeColor[file.type] || '#94a3b8'
          return (
            <motion.div key={file.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {formatSize(file.size)} · {file.uploadedAt || file.date || '—'} · {file.fromClient ? 'uploaded by you' : `from ${freelancer.name}`}
                </div>
              </div>
              <button onClick={() => openFile(file)} disabled={!file.url && !file.publicUrl && !file.storagePath}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 7, cursor: (file.url || file.publicUrl || file.storagePath) ? 'pointer' : 'not-allowed', color: 'var(--text-secondary)', fontSize: '0.775rem', opacity: (file.url || file.publicUrl || file.storagePath) ? 1 : 0.5 }}>
                <Download size={12} /> Download
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
