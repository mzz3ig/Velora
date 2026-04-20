import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, Download, Upload, FileText, Image, Archive } from 'lucide-react'

const FILES = [
  { id: 1, name: 'Homepage Mockup v1.pdf', size: '4.2 MB', type: 'pdf', from: 'freelancer', date: '2026-04-12' },
  { id: 2, name: 'Brand Guidelines.pdf', size: '8.1 MB', type: 'pdf', from: 'freelancer', date: '2026-04-10' },
  { id: 3, name: 'Client Logo Files.zip', size: '12.4 MB', type: 'zip', from: 'client', date: '2026-04-08' },
]

const typeIcon = { pdf: FileText, image: Image, zip: Archive }
const typeColor = { pdf: '#ef4444', image: '#06b6d4', zip: '#f59e0b' }

export default function PortalFiles() {
  const { freelancer } = useOutletContext()
  const [files] = useState(FILES)

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Files</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Deliverables and shared assets</p>

      {/* Upload zone */}
      <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '24px', textAlign: 'center', marginBottom: 24, cursor: 'pointer', opacity: 0.7 }}>
        <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>Upload files to share with {freelancer.name}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Supabase Storage — Phase 1</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {files.map(file => {
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
                  {file.size} · {file.date} · {file.from === 'freelancer' ? `from ${freelancer.name}` : 'uploaded by you'}
                </div>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
                <Download size={12} /> Download
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
