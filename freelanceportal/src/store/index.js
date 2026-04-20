import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabaseStorage } from './supabaseStorage'

const dbStorage = createJSONStorage(() => supabaseStorage)

// ─── CLIENTS ───────────────────────────────────────────────────────────────
export const useClientStore = create(
  persist(
    (set) => ({
      clients: [
        { id: 1, name: 'Acme Corporation', email: 'hello@acme.com', phone: '+49 30 1234 5678', company: 'Acme Corp', status: 'active', initials: 'AC', color: '#a98252', notes: '', tags: [], createdAt: '2026-01-10' },
        { id: 2, name: 'Sara Johnson', email: 'sara@saradesigns.co', phone: '+44 7700 900123', company: 'Sara Designs', status: 'active', initials: 'SJ', color: '#22c55e', notes: 'Prefers communication via email.', tags: ['design', 'vip'], createdAt: '2026-01-22' },
        { id: 3, name: 'Webflow Agency', email: 'contact@webflowag.com', phone: '+1 415 555 0100', company: 'Webflow Agency', status: 'active', initials: 'WA', color: '#f59e0b', notes: '', tags: ['agency'], createdAt: '2026-02-05' },
        { id: 4, name: 'Lucas Müller', email: 'lucas@lmdesign.de', phone: '+49 89 9876 5432', company: 'LM Design', status: 'active', initials: 'LM', color: '#38bdf8', notes: '', tags: [], createdAt: '2026-02-14' },
        { id: 5, name: 'Boutique XO', email: 'studio@boutiquexo.fr', phone: '+33 1 5555 6789', company: 'Boutique XO', status: 'active', initials: 'BX', color: '#f472b6', notes: '', tags: ['ecommerce'], createdAt: '2026-03-01' },
        { id: 6, name: 'Markus GmbH', email: 'office@markusgmbh.de', phone: '+49 211 4321 000', company: 'Markus GmbH', status: 'archived', initials: 'MG', color: '#a98252', notes: '', tags: [], createdAt: '2025-11-20' },
      ],
      addClient: (client) => set(s => ({ clients: [{ ...client, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], notes: '', tags: [] }, ...s.clients] })),
      updateClient: (id, data) => set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) })),
      archiveClient: (id) => set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, status: 'archived' } : c) })),
      deleteClient: (id) => set(s => ({ clients: s.clients.filter(c => c.id !== id) })),
      addActivity: (clientId, event) => set(s => ({
        clients: s.clients.map(c => c.id === clientId ? { ...c, activity: [{ id: Date.now(), ...event, time: new Date().toISOString() }, ...(c.activity || [])] } : c)
      })),
    }),
    { name: 'velora-clients', storage: dbStorage }
  )
)

// ─── PROJECTS ──────────────────────────────────────────────────────────────
export const useProjectStore = create(
  persist(
    (set) => ({
      projects: [
        { id: 1, name: 'Webflow Redesign', clientId: 1, client: 'Acme Corporation', clientColor: '#a98252', status: 'active', progress: 65, deadline: '2026-04-28', startDate: '2026-03-01', description: 'Full redesign of the Acme website using Webflow CMS.', milestones: [{ id: 1, title: 'Discovery & wireframes', done: true }, { id: 2, title: 'Design mockups approved', done: true }, { id: 3, title: 'Webflow build', done: false }, { id: 4, title: 'QA & launch', done: false }] },
        { id: 2, name: 'Brand Identity', clientId: 2, client: 'Sara Johnson', clientColor: '#22c55e', status: 'in_review', progress: 90, deadline: '2026-04-22', startDate: '2026-03-15', description: 'Complete brand identity package including logo, typography, and color system.', milestones: [{ id: 1, title: 'Brand discovery session', done: true }, { id: 2, title: 'Logo concepts (3 directions)', done: true }, { id: 3, title: 'Final logo approved', done: true }, { id: 4, title: 'Brand guidelines doc', done: false }] },
        { id: 3, name: 'Mobile App UI', clientId: 3, client: 'TechStart', clientColor: '#f59e0b', status: 'active', progress: 30, deadline: '2026-05-10', startDate: '2026-04-01', description: 'UI/UX design for a fintech mobile application.', milestones: [{ id: 1, title: 'User flows & IA', done: true }, { id: 2, title: 'Lo-fi wireframes', done: false }, { id: 3, title: 'Hi-fi screens', done: false }, { id: 4, title: 'Prototype & handoff', done: false }] },
        { id: 4, name: 'E-commerce Site', clientId: 5, client: 'Boutique XO', clientColor: '#f472b6', status: 'active', progress: 50, deadline: '2026-05-05', startDate: '2026-03-20', description: 'Shopify store design and development for a luxury fashion brand.', milestones: [{ id: 1, title: 'Design system', done: true }, { id: 2, title: 'Homepage & product pages', done: true }, { id: 3, title: 'Checkout flow', done: false }, { id: 4, title: 'Testing & launch', done: false }] },
      ],
      addProject: (project) => set(s => ({ projects: [{ ...project, id: Date.now() }, ...s.projects] })),
      updateProject: (id, data) => set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p) })),
      deleteProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),
      toggleMilestone: (projectId, milestoneId) => set(s => ({
        projects: s.projects.map(p => {
          if (p.id !== projectId) return p
          const milestones = p.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m)
          const done = milestones.filter(m => m.done).length
          const progress = Math.round((done / milestones.length) * 100)
          return { ...p, milestones, progress }
        })
      })),
    }),
    { name: 'velora-projects', storage: dbStorage }
  )
)

// ─── INVOICES ──────────────────────────────────────────────────────────────
const nextInvNumber = (invoices) => {
  const nums = invoices.map(i => parseInt(i.id.replace('INV-', ''))).filter(n => !isNaN(n))
  return `INV-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`
}

export const useInvoiceStore = create(
  persist(
    (set) => ({
      invoices: [
        { id: 'INV-001', project: 'Webflow Redesign', clientId: 1, client: 'Acme Corporation', amount: 1675, discount: 0, tax: 23, type: 'deposit', status: 'paid', due: '2026-03-15', paid: '2026-03-14', recurring: false, viewed: true, scheduled: null, notes: '' },
        { id: 'INV-002', project: 'Brand Identity', clientId: 2, client: 'Sara Johnson', amount: 2100, discount: 0, tax: 23, type: 'final', status: 'paid', due: '2026-04-01', paid: '2026-03-30', recurring: false, viewed: true, scheduled: null, notes: '' },
        { id: 'INV-003', project: 'Mobile App UI', clientId: 3, client: 'TechStart', amount: 2400, discount: 0, tax: 23, type: 'deposit', status: 'sent', due: '2026-04-20', paid: null, recurring: false, viewed: true, scheduled: null, notes: '' },
        { id: 'INV-004', project: 'E-commerce Site', clientId: 5, client: 'Boutique XO', amount: 2600, discount: 5, tax: 23, type: 'deposit', status: 'overdue', due: '2026-04-08', paid: null, recurring: false, viewed: false, scheduled: null, notes: '' },
        { id: 'INV-005', project: 'Newsletter System', clientId: 4, client: 'Lucas Müller', amount: 800, discount: 0, tax: 23, type: 'custom', status: 'draft', due: '2026-04-25', paid: null, recurring: false, viewed: false, scheduled: null, notes: '' },
        { id: 'INV-006', project: 'Monthly Retainer', clientId: 1, client: 'Acme Corporation', amount: 600, discount: 0, tax: 23, type: 'recurring', status: 'sent', due: '2026-04-30', paid: null, recurring: true, viewed: true, scheduled: null, interval: 'monthly', notes: '' },
      ],
      addInvoice: (data) => set(s => {
        const id = nextInvNumber(s.invoices)
        return { invoices: [{ ...data, id, viewed: false, paid: null }, ...s.invoices] }
      }),
      updateInvoice: (id, data) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data } : i) })),
      markPaid: (id) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status: 'paid', paid: new Date().toISOString().split('T')[0] } : i) })),
      sendNow: (id) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status: 'sent' } : i) })),
      deleteInvoice: (id) => set(s => ({ invoices: s.invoices.filter(i => i.id !== id) })),
    }),
    { name: 'velora-invoices', storage: dbStorage }
  )
)

// ─── TASKS ─────────────────────────────────────────────────────────────────
export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [
        { id: 1, title: 'Design homepage wireframe', projectId: 1, project: 'Webflow Redesign', priority: 'high', due_date: '2026-04-22', done: false, notes: 'Include mobile version', portal_visible: false, assignee: '', comments: [], subtasks: [{ id: 11, title: 'Sketch initial layout', done: true }, { id: 12, title: 'Create desktop wireframe', done: false }, { id: 13, title: 'Create mobile wireframe', done: false }] },
        { id: 2, title: 'Finalize logo concepts', projectId: 2, project: 'Brand Identity', priority: 'high', due_date: '2026-04-20', done: false, notes: '', portal_visible: true, assignee: '', comments: [], subtasks: [{ id: 21, title: 'Present 3 concepts', done: true }, { id: 22, title: 'Gather feedback', done: true }, { id: 23, title: 'Refine chosen concept', done: false }] },
        { id: 3, title: 'Send invoice INV-003', projectId: null, project: '— No project —', priority: 'medium', due_date: '2026-04-19', done: false, notes: 'Check amount with client first', portal_visible: false, assignee: '', comments: [], subtasks: [] },
        { id: 4, title: 'Set up project kickoff call', projectId: 3, project: 'Mobile App UI', priority: 'low', due_date: '2026-04-25', done: false, notes: '', portal_visible: false, assignee: '', comments: [], subtasks: [] },
        { id: 5, title: 'Deliver final brand assets', projectId: 2, project: 'Brand Identity', priority: 'medium', due_date: '2026-04-18', done: true, notes: 'Export all formats: SVG, PNG, PDF', portal_visible: true, assignee: '', comments: [], subtasks: [{ id: 51, title: 'Export SVG files', done: true }, { id: 52, title: 'Create brand guidelines PDF', done: true }] },
      ],
      addTask: (task) => set(s => ({ tasks: [...s.tasks, { id: Date.now(), ...task, done: false, subtasks: [], comments: [] }] })),
      updateTask: (id, data) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) })),
      toggleTask: (id) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      addSubtask: (taskId, title) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: Date.now(), title, done: false }] } : t) })),
      toggleSubtask: (taskId, subId) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t) })),
      deleteSubtask: (taskId, subId) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) } : t) })),
      addComment: (taskId, text) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), { id: Date.now(), text, time: new Date().toISOString() }] } : t) })),
    }),
    { name: 'velora-tasks', storage: dbStorage }
  )
)

// ─── TIME ENTRIES ──────────────────────────────────────────────────────────
export const useTimeStore = create(
  persist(
    (set) => ({
      entries: [
        { id: 1, project: 'Webflow Redesign', projectId: 1, client: 'Acme Co.', task: 'Homepage layout', date: '2026-04-17', hours: 2.5, billable: true, invoiced: false, notes: 'Worked on hero section and nav' },
        { id: 2, project: 'Brand Identity', projectId: 2, client: 'Sara Johnson', task: 'Logo concepts', date: '2026-04-17', hours: 1.75, billable: true, invoiced: false, notes: '' },
        { id: 3, project: 'Mobile App UI', projectId: 3, client: 'TechStart', task: 'Onboarding screens', date: '2026-04-16', hours: 3.0, billable: true, invoiced: true, notes: 'Completed 4 screens' },
        { id: 4, project: 'Webflow Redesign', projectId: 1, client: 'Acme Co.', task: 'Internal meeting', date: '2026-04-16', hours: 0.5, billable: false, invoiced: false, notes: '' },
        { id: 5, project: 'E-commerce Site', projectId: 4, client: 'Boutique XO', task: 'Product page', date: '2026-04-15', hours: 4.0, billable: true, invoiced: false, notes: '' },
      ],
      addEntry: (entry) => set(s => ({ entries: [{ ...entry, id: Date.now(), invoiced: false }, ...s.entries] })),
      updateEntry: (id, data) => set(s => ({ entries: s.entries.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteEntry: (id) => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),
    }),
    { name: 'velora-time', storage: dbStorage }
  )
)

// ─── PIPELINE / DEALS ──────────────────────────────────────────────────────
export const usePipelineStore = create(
  persist(
    (set) => ({
      deals: [
        { id: 1, title: 'E-commerce Redesign', client: 'Boutique XO', value: 3500, stage: 'negotiation', close_date: '2026-05-15', probability: 70, notes: 'Client wants proposal with 3 tiers' },
        { id: 2, title: 'Brand Identity', client: 'Lucas Müller', value: 2200, stage: 'proposal', close_date: '2026-04-30', probability: 50, notes: '' },
        { id: 3, title: 'Monthly Retainer', client: 'TechStart', value: 1200, stage: 'qualified', close_date: '2026-05-01', probability: 40, notes: 'Needs onboarding call' },
        { id: 4, title: 'Photography Session', client: 'New Lead', value: 450, stage: 'lead', close_date: '', probability: 20, notes: 'Came via Instagram' },
        { id: 5, title: 'Webflow Rebuild', client: 'Acme Co.', value: 4800, stage: 'won', close_date: '2026-04-10', probability: 100, notes: 'Contract signed' },
        { id: 6, title: 'Logo Design', client: 'Sara Johnson', value: 800, stage: 'lost', close_date: '2026-04-05', probability: 0, notes: 'Went with another agency' },
      ],
      addDeal: (deal) => set(s => ({ deals: [...s.deals, { id: Date.now(), ...deal }] })),
      updateDeal: (id, data) => set(s => ({ deals: s.deals.map(d => d.id === id ? { ...d, ...data } : d) })),
      deleteDeal: (id) => set(s => ({ deals: s.deals.filter(d => d.id !== id) })),
      moveDeal: (id, stage) => set(s => ({ deals: s.deals.map(d => d.id === id ? { ...d, stage } : d) })),
    }),
    { name: 'velora-pipeline', storage: dbStorage }
  )
)

// ─── SERVICES ──────────────────────────────────────────────────────────────
export const useServiceStore = create(
  persist(
    (set) => ({
      services: [
        { id: 1, name: 'Website Design', description: 'Full website design including wireframes, mockups, and final assets ready for development.', category: 'Design', pricingModel: 'fixed', defaultPrice: 2500, unit: 'project', archived: false },
        { id: 2, name: 'Brand Identity', description: 'Logo, color palette, typography system, and brand guidelines document.', category: 'Branding', pricingModel: 'fixed', defaultPrice: 1800, unit: 'project', archived: false },
        { id: 3, name: 'Webflow Development', description: 'Building fully responsive Webflow sites from approved design files.', category: 'Development', pricingModel: 'fixed', defaultPrice: 1500, unit: 'project', archived: false },
        { id: 4, name: 'Monthly Retainer', description: 'Ongoing design and development support on a monthly basis.', category: 'Retainer', pricingModel: 'recurring', defaultPrice: 600, unit: 'month', archived: false },
        { id: 5, name: 'Hourly Consulting', description: 'Strategy, feedback sessions, and design consulting by the hour.', category: 'Consulting', pricingModel: 'hourly', defaultPrice: 90, unit: 'hour', archived: false },
        { id: 6, name: 'SEO Audit', description: 'Full technical SEO audit with actionable recommendations report.', category: 'Marketing', pricingModel: 'fixed', defaultPrice: 450, unit: 'project', archived: false },
      ],
      addService: (service) => set(s => ({ services: [...s.services, { id: Date.now(), ...service, archived: false }] })),
      updateService: (id, data) => set(s => ({ services: s.services.map(sv => sv.id === id ? { ...sv, ...data } : sv) })),
      archiveService: (id) => set(s => ({ services: s.services.map(sv => sv.id === id ? { ...sv, archived: !sv.archived } : sv) })),
      deleteService: (id) => set(s => ({ services: s.services.filter(sv => sv.id !== id) })),
      duplicateService: (id) => set(s => {
        const orig = s.services.find(sv => sv.id === id)
        if (!orig) return s
        return { services: [...s.services, { ...orig, id: Date.now(), name: orig.name + ' (copy)' }] }
      }),
    }),
    { name: 'velora-services', storage: dbStorage }
  )
)

// ─── FILES ─────────────────────────────────────────────────────────────────
export const useFileStore = create(
  persist(
    (set) => ({
      files: [
        { id: 1, name: 'webflow-brief.pdf', size: 1240000, project: 'Webflow Redesign', projectId: 1, client: 'Acme Co.', clientId: 1, type: 'pdf', fromClient: false, uploadedAt: '2026-04-10', folder: null },
        { id: 2, name: 'brand-guide-v2.pdf', size: 3800000, project: 'Brand Identity', projectId: 2, client: 'Sara Johnson', clientId: 2, type: 'pdf', fromClient: false, uploadedAt: '2026-04-12', folder: null },
        { id: 3, name: 'logo-finals.zip', size: 8200000, project: 'Brand Identity', projectId: 2, client: 'Sara Johnson', clientId: 2, type: 'zip', fromClient: false, uploadedAt: '2026-04-15', folder: null },
        { id: 4, name: 'client-feedback.png', size: 540000, project: 'Mobile App UI', projectId: 3, client: 'TechStart', clientId: 3, type: 'image', fromClient: true, uploadedAt: '2026-04-16', folder: null },
        { id: 5, name: 'contract-signed.pdf', size: 210000, project: 'Webflow Redesign', projectId: 1, client: 'Acme Co.', clientId: 1, type: 'pdf', fromClient: false, uploadedAt: '2026-03-05', folder: null },
      ],
      addFile: (file) => set(s => ({ files: [{ ...file, id: Date.now(), uploadedAt: new Date().toISOString().split('T')[0] }, ...s.files] })),
      deleteFile: (id) => set(s => ({ files: s.files.filter(f => f.id !== id) })),
    }),
    { name: 'velora-files', storage: dbStorage }
  )
)

// ─── MESSAGES ──────────────────────────────────────────────────────────────
export const useMessageStore = create(
  persist(
    (set) => ({
      conversations: [
        { id: 1, client: 'Acme Corporation', clientId: 1, project: 'Webflow Redesign', avatar: 'AC', color: '#a98252', unread: 2, messages: [{ id: 1, from: 'client', text: 'Hi! Can we get an update on the homepage section?', time: '2026-04-17T09:00:00Z' }, { id: 2, from: 'me', text: 'Of course! Working on the hero section today, should have it ready by Friday.', time: '2026-04-17T09:15:00Z' }, { id: 3, from: 'client', text: 'Perfect, looking forward to it!', time: '2026-04-17T09:20:00Z' }] },
        { id: 2, client: 'Sara Johnson', clientId: 2, project: 'Brand Identity', avatar: 'SJ', color: '#22c55e', unread: 0, messages: [{ id: 1, from: 'me', text: 'The brand guide is ready for review. Please check the link I sent.', time: '2026-04-16T14:30:00Z' }, { id: 2, from: 'client', text: 'Looks amazing! Just a few tweaks on the secondary colors.', time: '2026-04-16T16:00:00Z' }] },
        { id: 3, client: 'TechStart', clientId: 3, project: 'Mobile App UI', avatar: 'TS', color: '#f59e0b', unread: 1, messages: [{ id: 1, from: 'client', text: 'When can we schedule the kickoff call?', time: '2026-04-15T11:00:00Z' }] },
        { id: 4, client: 'Boutique XO', clientId: 5, project: 'E-commerce Site', avatar: 'BX', color: '#f472b6', unread: 0, messages: [{ id: 1, from: 'me', text: 'Invoice sent — please let me know if you have any questions.', time: '2026-04-14T10:00:00Z' }] },
      ],
      sendMessage: (convId, text) => set(s => ({
        conversations: s.conversations.map(c => c.id === convId ? { ...c, messages: [...c.messages, { id: Date.now(), from: 'me', text, time: new Date().toISOString() }] } : c)
      })),
      markRead: (convId) => set(s => ({ conversations: s.conversations.map(c => c.id === convId ? { ...c, unread: 0 } : c) })),
      addConversation: (conv) => set(s => ({ conversations: [{ id: Date.now(), ...conv, messages: [], unread: 0 }, ...s.conversations] })),
    }),
    { name: 'velora-messages', storage: dbStorage }
  )
)

// ─── FORMS ─────────────────────────────────────────────────────────────────
export const useFormStore = create(
  persist(
    (set) => ({
      forms: [
        { id: 1, name: 'New Client Intake', status: 'active', fields: [{ id: 1, type: 'short_text', label: 'Full name', placeholder: 'Your full name', required: true }, { id: 2, type: 'email', label: 'Email address', placeholder: 'your@email.com', required: true }, { id: 3, type: 'long_text', label: 'Project description', placeholder: 'Tell me about your project...', required: false }], submissions: [{ id: 1, data: { 'Full name': 'Emma Clarke', 'Email address': 'emma@example.com', 'Project description': 'Need a new website for my bakery.' }, submittedAt: '2026-04-18T10:30:00Z' }] },
        { id: 2, name: 'Project Feedback', status: 'active', fields: [{ id: 1, type: 'short_text', label: 'Your name', required: true }, { id: 2, type: 'dropdown', label: 'Rating', options: ['Excellent', 'Good', 'Average', 'Poor'], required: true }, { id: 3, type: 'long_text', label: 'Comments', required: false }], submissions: [] },
        { id: 3, name: 'Discovery Call Request', status: 'draft', fields: [], submissions: [] },
      ],
      addForm: (form) => set(s => ({ forms: [...s.forms, { id: Date.now(), ...form, submissions: [] }] })),
      updateForm: (id, data) => set(s => ({ forms: s.forms.map(f => f.id === id ? { ...f, ...data } : f) })),
      deleteForm: (id) => set(s => ({ forms: s.forms.filter(f => f.id !== id) })),
      addSubmission: (formId, data) => set(s => ({
        forms: s.forms.map(f => f.id === formId ? { ...f, submissions: [...f.submissions, { id: Date.now(), data, submittedAt: new Date().toISOString() }] } : f)
      })),
    }),
    { name: 'velora-forms', storage: dbStorage }
  )
)

// ─── SCHEDULING ────────────────────────────────────────────────────────────
export const useSchedulingStore = create(
  persist(
    (set) => ({
      eventTypes: [
        { id: 1, name: 'Discovery Call', duration: 30, price: 0, description: '30-min intro call to discuss your project.', location: 'Google Meet', active: true },
        { id: 2, name: 'Strategy Session', duration: 60, price: 150, description: 'Deep-dive strategy and planning session.', location: 'Zoom', active: true },
        { id: 3, name: 'Design Review', duration: 45, price: 0, description: 'Review and feedback session for ongoing projects.', location: 'Google Meet', active: false },
      ],
      bookings: [
        { id: 1, eventType: 'Discovery Call', client: 'Emma Clarke', date: '2026-04-22', time: '10:00', status: 'confirmed', notes: '' },
        { id: 2, eventType: 'Strategy Session', client: 'Mark Peters', date: '2026-04-24', time: '14:00', status: 'pending', notes: '' },
        { id: 3, eventType: 'Design Review', client: 'Sara Johnson', date: '2026-04-10', time: '11:00', status: 'confirmed', notes: 'Reviewed logo finals' },
      ],
      availability: [
        { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Friday', enabled: true, start: '09:00', end: '15:00' },
        { day: 'Saturday', enabled: false, start: '10:00', end: '13:00' },
        { day: 'Sunday', enabled: false, start: '10:00', end: '13:00' },
      ],
      addEventType: (et) => set(s => ({ eventTypes: [...s.eventTypes, { id: Date.now(), ...et }] })),
      updateEventType: (id, data) => set(s => ({ eventTypes: s.eventTypes.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteEventType: (id) => set(s => ({ eventTypes: s.eventTypes.filter(e => e.id !== id) })),
      toggleEventType: (id) => set(s => ({ eventTypes: s.eventTypes.map(e => e.id === id ? { ...e, active: !e.active } : e) })),
      addBooking: (b) => set(s => ({ bookings: [...s.bookings, { id: Date.now(), ...b }] })),
      updateAvailability: (availability) => set(() => ({ availability })),
    }),
    { name: 'velora-scheduling', storage: dbStorage }
  )
)

// ─── AUTOMATIONS ───────────────────────────────────────────────────────────
export const useAutomationStore = create(
  persist(
    (set) => ({
      automations: [
        { id: 1, name: 'Invoice reminder (+3 days)', trigger: 'invoice_overdue', action: 'send_email_reminder', enabled: true, runs: 12, lastRun: '2026-04-17' },
        { id: 2, name: 'Thank you after contract signed', trigger: 'contract_signed', action: 'send_thank_you_email', enabled: true, runs: 5, lastRun: '2026-04-15' },
        { id: 3, name: 'Proposal follow-up (3 days)', trigger: 'proposal_viewed', action: 'send_followup_email', enabled: false, runs: 3, lastRun: '2026-04-10' },
        { id: 4, name: 'Add lead to CRM on form submit', trigger: 'form_submitted', action: 'create_client', enabled: true, runs: 8, lastRun: '2026-04-16' },
      ],
      logs: [
        { id: 1, automation: 'Invoice reminder (+3 days)', entity: 'INV-004 (Boutique XO)', status: 'success', time: '2026-04-17T08:00:00Z' },
        { id: 2, automation: 'Thank you after contract signed', entity: 'Acme Corporation', status: 'success', time: '2026-04-15T14:22:00Z' },
        { id: 3, automation: 'Add lead to CRM on form submit', entity: 'Emma Clarke', status: 'success', time: '2026-04-16T10:31:00Z' },
        { id: 4, automation: 'Invoice reminder (+3 days)', entity: 'INV-003 (TechStart)', status: 'failed', time: '2026-04-14T08:00:00Z' },
      ],
      addAutomation: (a) => set(s => ({ automations: [...s.automations, { id: Date.now(), ...a, runs: 0, lastRun: null }] })),
      updateAutomation: (id, data) => set(s => ({ automations: s.automations.map(a => a.id === id ? { ...a, ...data } : a) })),
      toggleAutomation: (id) => set(s => ({ automations: s.automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a) })),
      deleteAutomation: (id) => set(s => ({ automations: s.automations.filter(a => a.id !== id) })),
    }),
    { name: 'velora-automations', storage: dbStorage }
  )
)

// ─── EXPENSES ──────────────────────────────────────────────────────────────
export const useExpenseStore = create(
  persist(
    (set) => ({
      expenses: [
        { id: 1, description: 'Adobe Creative Cloud', amount: 59.99, category: 'Software', date: '2026-04-01', projectId: null, project: null, reimbursable: false, receipt: null, notes: 'Annual subscription / 12' },
        { id: 2, description: 'Stock photos - Unsplash+', amount: 12.99, category: 'Assets', date: '2026-04-03', projectId: 1, project: 'Webflow Redesign', reimbursable: true, receipt: null, notes: '' },
        { id: 3, description: 'Client lunch meeting', amount: 48.50, category: 'Meals', date: '2026-04-08', projectId: 2, project: 'Brand Identity', reimbursable: true, receipt: null, notes: 'Strategy session with Sara' },
        { id: 4, description: 'Domain registration', amount: 15.00, category: 'Infrastructure', date: '2026-04-10', projectId: 3, project: 'Mobile App UI', reimbursable: true, receipt: null, notes: 'velora-client.com' },
        { id: 5, description: 'Figma Pro', amount: 15.00, category: 'Software', date: '2026-04-01', projectId: null, project: null, reimbursable: false, receipt: null, notes: '' },
      ],
      addExpense: (expense) => set(s => ({ expenses: [{ id: Date.now(), ...expense }, ...s.expenses] })),
      updateExpense: (id, data) => set(s => ({ expenses: s.expenses.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteExpense: (id) => set(s => ({ expenses: s.expenses.filter(e => e.id !== id) })),
    }),
    { name: 'velora-expenses', storage: dbStorage }
  )
)

// ─── SETTINGS ──────────────────────────────────────────────────────────────
export const useSettingsStore = create(
  persist(
    (set) => ({
      branding: { businessName: 'Velora Studio', logo: null, brandColor: '#a98252', emailSenderName: 'Rodrigo @ Velora Studio' },
      account: { firstName: 'Rodrigo', lastName: 'Mendes', email: 'rodrigo@velorastudio.com' },
      notifications: { proposalAccepted: true, contractSigned: true, paymentReceived: true, invoiceOverdue: true, newMessage: true, weeklyReport: false },
      billing: { plan: 'pro', nextBilling: '2026-05-20', portalsUsed: 3, storageUsed: 31.2 },
      domain: { customDomain: '' },
      updateBranding: (data) => set(s => ({ branding: { ...s.branding, ...data } })),
      updateAccount: (data) => set(s => ({ account: { ...s.account, ...data } })),
      updateNotifications: (data) => set(s => ({ notifications: { ...s.notifications, ...data } })),
      updateDomain: (data) => set(s => ({ domain: { ...s.domain, ...data } })),
    }),
    { name: 'velora-settings', storage: dbStorage }
  )
)

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [
        { id: 1, type: 'contract', text: 'Contract signed by Acme Co.', time: new Date(Date.now() - 2 * 60000).toISOString(), read: false },
        { id: 2, type: 'payment', text: 'Payment received — €850 from Sara Johnson', time: new Date(Date.now() - 60 * 60000).toISOString(), read: false },
        { id: 3, type: 'proposal', text: 'Proposal viewed by Webflow Agency', time: new Date(Date.now() - 3 * 60 * 60000).toISOString(), read: true },
        { id: 4, type: 'client', text: 'New client added — Lucas Müller', time: new Date(Date.now() - 5 * 60 * 60000).toISOString(), read: true },
        { id: 5, type: 'overdue', text: 'Invoice overdue — Markus GmbH (€1,200)', time: new Date(Date.now() - 24 * 60 * 60000).toISOString(), read: true },
      ],
      addNotification: (n) => set(s => ({ notifications: [{ id: Date.now(), ...n, time: new Date().toISOString(), read: false }, ...s.notifications] })),
      markRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      clearAll: () => set(() => ({ notifications: [] })),
    }),
    { name: 'velora-notifications', storage: dbStorage }
  )
)

const persistedStores = [
  { name: 'velora-clients', store: useClientStore },
  { name: 'velora-projects', store: useProjectStore },
  { name: 'velora-invoices', store: useInvoiceStore },
  { name: 'velora-tasks', store: useTaskStore },
  { name: 'velora-time', store: useTimeStore },
  { name: 'velora-pipeline', store: usePipelineStore },
  { name: 'velora-services', store: useServiceStore },
  { name: 'velora-files', store: useFileStore },
  { name: 'velora-messages', store: useMessageStore },
  { name: 'velora-forms', store: useFormStore },
  { name: 'velora-scheduling', store: useSchedulingStore },
  { name: 'velora-automations', store: useAutomationStore },
  { name: 'velora-expenses', store: useExpenseStore },
  { name: 'velora-settings', store: useSettingsStore },
  { name: 'velora-notifications', store: useNotificationStore },
]

export async function rehydrateAppStores() {
  await Promise.all(persistedStores.map(({ store }) => store.persist.rehydrate()))
}

export async function saveAppStores() {
  await Promise.all(
    persistedStores.map(({ name, store }) =>
      supabaseStorage.setItem(name, JSON.stringify({ state: store.getState(), version: 0 })),
    ),
  )
}
