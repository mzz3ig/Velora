import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Plus, X, Trash2, Edit2, Copy,
  Eye, GripVertical, Check,
  Link, AlignLeft, Hash, Calendar, Mail,
  Phone, List, CheckSquare, Upload,
} from 'lucide-react'
import { useFormStore, useClientStore } from '../../store'
import { supabase } from '../../lib/supabase'

const FIELD_TYPES = [
  { type: 'short_text', label: 'Short text', icon: AlignLeft },
  { type: 'long_text', label: 'Long text', icon: AlignLeft },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'multiselect', label: 'Multiple choice', icon: CheckSquare },
  { type: 'file', label: 'File upload', icon: Upload },
]

const TEMPLATES = [
  { id: 't1', name: 'Client Intake Form', description: 'Collect project details from new clients', fields: [
    { id: 1, type: 'short_text', label: 'Full name', required: true, placeholder: '' },
    { id: 2, type: 'email', label: 'Email address', required: true, placeholder: '' },
    { id: 3, type: 'phone', label: 'Phone number', required: false, placeholder: '' },
    { id: 4, type: 'long_text', label: 'Project description', required: true, placeholder: 'Tell us about your project...' },
    { id: 5, type: 'select', label: 'Budget range', required: false, options: 'Under €1k, €1k–5k, €5k–15k, €15k+', placeholder: '' },
    { id: 6, type: 'date', label: 'Desired start date', required: false, placeholder: '' },
  ]},
  { id: 't2', name: 'Project Brief', description: 'Detailed creative brief for design projects', fields: [
    { id: 1, type: 'short_text', label: 'Project name', required: true, placeholder: '' },
    { id: 2, type: 'long_text', label: 'Goals & objectives', required: true, placeholder: '' },
    { id: 3, type: 'long_text', label: 'Target audience', required: false, placeholder: '' },
    { id: 4, type: 'select', label: 'Design style', required: false, options: 'Minimal, Bold, Classic, Modern, Playful', placeholder: '' },
    { id: 5, type: 'file', label: 'Reference files', required: false, placeholder: '' },
  ]},
  { id: 't3', name: 'Feedback Survey', description: 'Post-project satisfaction survey', fields: [
    { id: 1, type: 'select', label: 'Overall satisfaction', required: true, options: '⭐ Poor, ⭐⭐ Fair, ⭐⭐⭐ Good, ⭐⭐⭐⭐ Great, ⭐⭐⭐⭐⭐ Excellent', placeholder: '' },
    { id: 2, type: 'long_text', label: 'What did we do well?', required: false, placeholder: '' },
    { id: 3, type: 'long_text', label: 'What could we improve?', required: false, placeholder: '' },
    { id: 4, type: 'select', label: 'Would you recommend us?', required: true, options: 'Yes, definitely, Probably, Not sure, No', placeholder: '' },
  ]},
]

const EMPTY_FIELD = { type: 'short_text', label: '', required: false, placeholder: '', options: '' }
const CLIENT_COLORS = ['#a98252', '#8f6d43', '#22c55e', '#38bdf8', '#f59e0b', '#ef4444']

export default function Forms() {
  const { forms, addForm, updateForm, deleteForm } = useFormStore()
  const { addClient } = useClientStore()
  const [view, setView] = useState('list')
  const [activeForm, setActiveForm] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [formName, setFormName] = useState('')
  const [fields, setFields] = useState([])
  const [copied, setCopied] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(null)
  const [activeSubmissionForm, setActiveSubmissionForm] = useState(null)

  function openBuilder(form = null) {
    if (form) {
      setActiveForm(form)
      setFormName(form.name)
      setFields([...form.fields])
    } else {
      setActiveForm(null)
      setFormName('Untitled form')
      setFields([])
    }
    setView('builder')
  }

  function openFromTemplate(tmpl) {
    setActiveForm(null)
    setFormName(tmpl.name)
    setFields(tmpl.fields.map((f, index) => ({ ...f, id: Date.now() + index })))
    setShowTemplates(false)
    setView('builder')
  }

  function saveForm() {
    if (activeForm) {
      updateForm(activeForm.id, { name: formName, fields })
    } else {
      addForm({ name: formName, status: 'draft', fields, submissions: [] })
    }
    setView('list')
  }

  function addField(type) {
    const TypeDef = FIELD_TYPES.find(t => t.type === type)
    setFields(f => [...f, { id: Date.now(), type, label: TypeDef.label, required: false, placeholder: '', options: '' }])
  }

  function updateField(id, updates) {
    setFields(f => f.map(x => x.id === id ? { ...x, ...updates } : x))
  }

  function removeField(id) { setFields(f => f.filter(x => x.id !== id)) }

  function toggleStatus(form) {
    updateForm(form.id, { status: form.status === 'active' ? 'draft' : 'active' })
  }

  async function publicFormUrl(formId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You need to be signed in to share forms.')
    return `${window.location.origin}/form/${user.id}/${formId}`
  }

  async function copyLink(formId) {
    const url = await publicFormUrl(formId)
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(formId)
    setTimeout(() => setCopied(null), 2000)
  }

  async function copyEmbed(formId) {
    const url = await publicFormUrl(formId)
    const snippet = `<iframe src="${url}" style="width:100%;height:600px;border:none;border-radius:8px;" title="Contact form"></iframe>`
    navigator.clipboard.writeText(snippet).catch(() => {})
    setCopiedEmbed(formId)
    setTimeout(() => setCopiedEmbed(null), 2000)
  }

  function createClientFromSubmission(sub) {
    const name = sub.data?.['Full name'] || sub.data?.['Your name'] || sub.data?.['Name'] || ''
    const email = sub.data?.['Email address'] || sub.data?.['Email'] || ''
    const phone = sub.data?.['Phone number'] || sub.data?.['Phone'] || ''
    if (!name && !email) { alert('No name or email found in submission to create a client.'); return }
    addClient({ name: name || email, email, phone, company: '', status: 'active', color: CLIENT_COLORS[sub.id % CLIENT_COLORS.length] })
    alert(`Client "${name || email}" added to CRM.`)
  }

  function viewSubmissions(form) {
    setActiveSubmissionForm(form)
    setView('submissions')
  }

  if (view === 'submissions' && activeSubmissionForm) {
    const subs = activeSubmissionForm.submissions || []
    return (
      <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => setView('list')} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.825rem' }}>← Back</button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeSubmissionForm.name} — Submissions</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subs.length} responses</p>
          </div>
        </div>
        {subs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <ClipboardList size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subs.map(sub => (
              <div key={sub.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sub.data?.['Full name'] || sub.data?.['Your name'] || 'Anonymous'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <button onClick={() => createClientFromSubmission(sub)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#a9825215', border: '1px solid rgba(169,130,82,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}
                      title="Add this person to your CRM as a client">
                      + Add to CRM
                    </button>
                  </div>
                </div>
                {Object.entries(sub.data || {}).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{key}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{val}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (view === 'builder') {
    return (
      <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('list')} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.825rem' }}>← Back</button>
            <input value={formName} onChange={e => setFormName(e.target.value)}
              style={{ fontSize: '1.2rem', fontWeight: 700, background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', borderBottom: '2px solid var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost">Preview</button>
            <button className="btn-primary" onClick={saveForm}>Save form</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24 }}>
          <div>
            <AnimatePresence>
              {fields.map((field) => (
                <motion.div key={field.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="card" style={{ padding: '14px 16px', marginBottom: 10, cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: editingField === field.id ? 12 : 0 }}>
                    <GripVertical size={14} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {field.label || 'Untitled field'}
                        {field.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {FIELD_TYPES.find(t => t.type === field.type)?.label}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => removeField(field.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {editingField === field.id && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label className="label">Field label</label>
                        <input className="input" value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} />
                      </div>
                      <div>
                        <label className="label">Placeholder (optional)</label>
                        <input className="input" value={field.placeholder} onChange={e => updateField(field.id, { placeholder: e.target.value })} />
                      </div>
                      {['select', 'multiselect'].includes(field.type) && (
                        <div>
                          <label className="label">Options (comma-separated)</label>
                          <input className="input" placeholder="Option A, Option B, Option C" value={field.options} onChange={e => updateField(field.id, { options: e.target.value })} />
                        </div>
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} />
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Required</span>
                      </label>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {fields.length === 0 && (
              <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ClipboardList size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>Add fields from the right panel</p>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '16px', height: 'fit-content' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Add field</div>
            {FIELD_TYPES.map(ft => (
              <button key={ft.type} onClick={() => addField(ft.type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: 7,
                  color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: 2,
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <ft.icon size={14} /> {ft.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Forms</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Collect structured data from clients and leads</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowTemplates(true)}>
            From template
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => openBuilder()}>
            <Plus size={16} /> New form
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {forms.map(form => (
          <motion.div key={form.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#a9825220', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ClipboardList size={18} color="#a98252" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{form.name}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {(form.fields || []).length} fields · {(form.submissions || []).length} submissions
                {form.submissions?.length > 0 && ` · Last: ${new Date(form.submissions[form.submissions.length - 1].submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
              </div>
            </div>
            <div onClick={() => toggleStatus(form)} style={{
              fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, cursor: 'pointer',
              background: form.status === 'active' ? '#22c55e20' : 'var(--border-light)',
              color: form.status === 'active' ? '#22c55e' : 'var(--text-muted)',
            }}>{form.status}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => viewSubmissions(form)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Eye size={13} /> {(form.submissions || []).length}
              </button>
              <button onClick={() => copyLink(form.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: copied === form.id ? '#22c55e20' : 'var(--bg-secondary)', border: `1px solid ${copied === form.id ? '#22c55e' : 'var(--border)'}`, borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', color: copied === form.id ? '#22c55e' : 'var(--text-secondary)' }}>
                {copied === form.id ? <><Check size={13} /> Copied!</> : <><Link size={13} /> Copy link</>}
              </button>
              <button onClick={() => copyEmbed(form.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: copiedEmbed === form.id ? '#a9825220' : 'var(--bg-secondary)', border: `1px solid ${copiedEmbed === form.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', color: copiedEmbed === form.id ? 'var(--accent)' : 'var(--text-secondary)' }}
                title="Copy HTML embed snippet for your website">
                {copiedEmbed === form.id ? <><Check size={13} /> Embed copied</> : <><Copy size={13} /> Embed</>}
              </button>
              <button onClick={() => openBuilder(form)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => deleteForm(form.id)}
                style={{ padding: '6px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Trash2 size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 560, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Choose a template</h2>
                <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => openFromTemplate(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#a9825220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardList size={16} color="#a98252" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{t.description} · {t.fields.length} fields</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
