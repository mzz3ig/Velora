import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, ClipboardList } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || ''

function optionsFor(field) {
  return String(field.options || '')
    .split(',')
    .map(option => option.trim())
    .filter(Boolean)
}

function FieldInput({ field, value, onChange }) {
  const common = {
    className: 'input',
    required: Boolean(field.required),
    value,
    onChange: event => onChange(event.target.value),
    placeholder: field.placeholder || '',
  }

  if (field.type === 'long_text') {
    return <textarea {...common} rows={4} style={{ resize: 'vertical' }} />
  }

  if (field.type === 'select') {
    return (
      <select {...common}>
        <option value="">Choose an option...</option>
        {optionsFor(field).map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value : []
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {optionsFor(field).map(option => (
          <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={event => {
                onChange(event.target.checked
                  ? [...selected, option]
                  : selected.filter(item => item !== option))
              }}
            />
            {option}
          </label>
        ))}
      </div>
    )
  }

  if (field.type === 'file') {
    return (
      <div className="input" style={{ color: 'var(--text-muted)' }}>
        File upload is not available on public forms yet.
      </div>
    )
  }

  const typeMap = {
    email: 'email',
    phone: 'tel',
    number: 'number',
    date: 'date',
  }

  return <input {...common} type={typeMap[field.type] || 'text'} />
}

export default function PublicForm() {
  const { ownerId, formId } = useParams()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadForm() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ ownerId, formId })
        const res = await fetch(`${API_BASE}/public/form/payload?${params.toString()}`)
        const data = await res.json()

        if (!mounted) return
        if (!res.ok) {
          setError('This form is unavailable.')
          setForm(null)
        } else {
          setForm(data)
        }
        setLoading(false)
      } catch {
        if (!mounted) return
        setError('This form is unavailable.')
        setForm(null)
        setLoading(false)
      }
    }

    loadForm()
    return () => { mounted = false }
  }, [ownerId, formId])

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/public/form/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId, formId, response: answers }),
      })
      const data = await res.json()
      setSubmitting(false)
      if (!res.ok || data?.error) {
        setError('Could not submit this form. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setSubmitting(false)
      setError('Could not submit this form. Please try again.')
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg-primary)' }}>
      <section className="card" style={{ width: '100%', maxWidth: 640, padding: 28 }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading form...</div>
        ) : submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={42} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Response received</h1>
            <p style={{ color: 'var(--text-muted)' }}>Thanks. Your response was sent successfully.</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
            <ClipboardList size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            {error}
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <ClipboardList size={28} color="var(--accent)" style={{ marginBottom: 12 }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>{form.name}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete the fields below and submit your response.</p>
            </div>

            {(form.fields || []).map(field => (
              <div key={field.id}>
                <label className="label">
                  {field.label || 'Untitled field'}{field.required ? ' *' : ''}
                </label>
                <FieldInput
                  field={field}
                  value={answers[field.label] || (field.type === 'multiselect' ? [] : '')}
                  onChange={value => setAnswers(current => ({ ...current, [field.label]: value }))}
                />
              </div>
            ))}

            {error && <div className="badge badge-red" style={{ padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
            <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: 'center', padding: '12px 18px' }}>
              {submitting ? 'Submitting...' : 'Submit response'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
