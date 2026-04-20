import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Plus, Trash2, X, Upload, Tag, DollarSign,
  TrendingDown, Calendar, Briefcase, Filter, Download, Edit2,
} from 'lucide-react'
import { useExpenseStore, useProjectStore } from '../../store'

const CATEGORIES = [
  'Software & Subscriptions', 'Hardware & Equipment', 'Travel & Transport',
  'Marketing & Advertising', 'Office & Supplies', 'Professional Services',
  'Meals & Entertainment', 'Education & Training', 'Utilities', 'Other',
]

const EMPTY_FORM = {
  merchant: '', date: new Date().toISOString().split('T')[0],
  amount: '', category: CATEGORIES[0], projectId: '',
  reimbursable: false, billable: false, notes: '',
}

function exportCSV(expenses) {
  const header = 'Date,Description,Category,Amount,Project,Reimbursable,Billable,Notes\n'
  const rows = expenses.map(e => `${e.date},"${e.merchant}","${e.category}",${e.amount},"${e.project || ''}",${e.reimbursable ? 'Yes' : 'No'},${e.billable ? 'Yes' : 'No'},"${e.notes || ''}"`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseStore()
  const { projects } = useProjectStore()
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterCat, setFilterCat] = useState('All')
  const [search, setSearch] = useState('')

  function openNew() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }
  function openEdit(exp) {
    setForm({ merchant: exp.merchant, date: exp.date, amount: exp.amount, category: exp.category, projectId: exp.projectId || '', reimbursable: exp.reimbursable, billable: exp.billable, notes: exp.notes || '' })
    setEditId(exp.id); setShowModal(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (!form.merchant || !form.amount) return
    const proj = projects.find(p => p.id === parseInt(form.projectId))
    const data = { ...form, amount: parseFloat(form.amount), project: proj?.name || null, projectId: proj?.id || null, receipt: null }
    if (editId) { updateExpense(editId, data) } else { addExpense(data) }
    setShowModal(false)
  }

  const filtered = expenses.filter(e => {
    if (filterCat !== 'All' && e.category !== filterCat) return false
    if (search && !e.merchant.toLowerCase().includes(search.toLowerCase()) && !(e.notes||'').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0)
  const billableAmount = filtered.filter(e => e.billable).reduce((s, e) => s + e.amount, 0)
  const reimbursableAmount = filtered.filter(e => e.reimbursable).reduce((s, e) => s + e.amount, 0)

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
    if (total > 0) acc[cat] = total
    return acc
  }, {})

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Expenses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track business costs and billable expenses</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => exportCSV(expenses)}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={openNew}>
            <Plus size={16} /> Add expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total expenses', value: `€${totalAmount.toFixed(2)}`, icon: TrendingDown, color: '#ef4444' },
          { label: 'Billable to clients', value: `€${billableAmount.toFixed(2)}`, icon: DollarSign, color: '#22c55e' },
          { label: 'Reimbursable', value: `€${reimbursableAmount.toFixed(2)}`, icon: Receipt, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        {/* Main table */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <input className="input" placeholder="Search expenses..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
            <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ minWidth: 200 }}>
              <option>All</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Merchant', 'Date', 'Category', 'Amount', 'Flags', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => (
                  <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{exp.merchant}</div>
                      {exp.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.notes}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.825rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(exp.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.775rem', padding: '3px 8px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      €{exp.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {exp.billable && <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 99, background: '#22c55e20', color: '#22c55e' }}>billable</span>}
                        {exp.reimbursable && <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 99, background: '#f59e0b20', color: '#f59e0b' }}>reimburse</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(exp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Edit2 size={14} /></button>
                        <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Receipt size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No expenses found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>By category</h3>
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, total]) => {
              const pct = Math.round((total / expenses.reduce((s, e) => s + e.amount, 0)) * 100)
              return (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{cat}</span>
                    <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)' }}>€{total.toFixed(0)}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--border-light)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 2, background: 'var(--accent)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card" style={{ width: '100%', maxWidth: 500, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{editId ? 'Edit expense' : 'Add expense'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Merchant / Description</label>
                  <input className="input" placeholder="e.g. Adobe Creative Cloud" value={form.merchant}
                    onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Amount (€)</label>
                    <input type="number" step="0.01" min="0" className="input" placeholder="0.00"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" className="input" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Project (optional)</label>
                  <select className="input" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                    <option value="">— No project —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input className="input" placeholder="Any notes..." value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[['billable', 'Billable to client'], ['reimbursable', 'Reimbursable']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <div onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                        style={{
                          width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                          background: form[key] ? 'var(--accent)' : 'var(--border-light)',
                          position: 'relative', transition: 'background 0.2s',
                        }}>
                        <div style={{
                          position: 'absolute', top: 2, left: form[key] ? 18 : 2,
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          transition: 'left 0.2s',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{label}</span>
                    </label>
                  ))}
                </div>
                {/* Receipt upload (Supabase Storage ready) */}
                <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                  <Upload size={18} style={{ margin: '0 auto 6px', color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Attach receipt (PDF, PNG, JPG)</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Storage via Supabase — coming in Phase 1</p>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editId ? 'Save changes' : 'Add expense'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
