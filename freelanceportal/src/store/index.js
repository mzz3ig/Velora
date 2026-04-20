import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabaseStorage } from './supabaseStorage'

const dbStorage = createJSONStorage(() => supabaseStorage)

// ─── CLIENTS ───────────────────────────────────────────────────────────────
export const useClientStore = create(
  persist(
    (set) => ({
      clients: [],
      addClient: (client) => set(s => ({ clients: [{ ...client, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], notes: '', tags: [] }, ...s.clients] })),
      updateClient: (id, data) => set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) })),
      archiveClient: (id) => set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, status: 'archived' } : c) })),
      deleteClient: (id) => set(s => ({ clients: s.clients.filter(c => c.id !== id) })),
      addActivity: (clientId, event) => set(s => ({
        clients: s.clients.map(c => c.id === clientId ? { ...c, activity: [{ id: Date.now(), ...event, time: new Date().toISOString() }, ...(c.activity || [])] } : c)
      })),
    }),
    { name: 'velora-clients', storage: dbStorage, version: 1, migrate: () => ({ clients: [] }) }
  )
)

// ─── PROJECTS ──────────────────────────────────────────────────────────────
export const useProjectStore = create(
  persist(
    (set) => ({
      projects: [],
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
    { name: 'velora-projects', storage: dbStorage, version: 1, migrate: () => ({ projects: [] }) }
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
      invoices: [],
      addInvoice: (data) => set(s => {
        const id = nextInvNumber(s.invoices)
        return { invoices: [{ ...data, id, viewed: false, paid: null }, ...s.invoices] }
      }),
      updateInvoice: (id, data) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data } : i) })),
      markPaid: (id) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status: 'paid', paid: new Date().toISOString().split('T')[0] } : i) })),
      sendNow: (id) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status: 'sent' } : i) })),
      deleteInvoice: (id) => set(s => ({ invoices: s.invoices.filter(i => i.id !== id) })),
    }),
    { name: 'velora-invoices', storage: dbStorage, version: 1, migrate: () => ({ invoices: [] }) }
  )
)

// ─── TASKS ─────────────────────────────────────────────────────────────────
export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set(s => ({ tasks: [...s.tasks, { id: Date.now(), ...task, done: false, subtasks: [], comments: [] }] })),
      updateTask: (id, data) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) })),
      toggleTask: (id) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      addSubtask: (taskId, title) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: Date.now(), title, done: false }] } : t) })),
      toggleSubtask: (taskId, subId) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t) })),
      deleteSubtask: (taskId, subId) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) } : t) })),
      addComment: (taskId, text) => set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), { id: Date.now(), text, time: new Date().toISOString() }] } : t) })),
    }),
    { name: 'velora-tasks', storage: dbStorage, version: 1, migrate: () => ({ tasks: [] }) }
  )
)

// ─── TIME ENTRIES ──────────────────────────────────────────────────────────
export const useTimeStore = create(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set(s => ({ entries: [{ ...entry, id: Date.now(), invoiced: false }, ...s.entries] })),
      updateEntry: (id, data) => set(s => ({ entries: s.entries.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteEntry: (id) => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),
    }),
    { name: 'velora-time', storage: dbStorage, version: 1, migrate: () => ({ entries: [] }) }
  )
)

// ─── PIPELINE / DEALS ──────────────────────────────────────────────────────
export const usePipelineStore = create(
  persist(
    (set) => ({
      deals: [],
      addDeal: (deal) => set(s => ({ deals: [...s.deals, { id: Date.now(), ...deal }] })),
      updateDeal: (id, data) => set(s => ({ deals: s.deals.map(d => d.id === id ? { ...d, ...data } : d) })),
      deleteDeal: (id) => set(s => ({ deals: s.deals.filter(d => d.id !== id) })),
      moveDeal: (id, stage) => set(s => ({ deals: s.deals.map(d => d.id === id ? { ...d, stage } : d) })),
    }),
    { name: 'velora-pipeline', storage: dbStorage, version: 1, migrate: () => ({ deals: [] }) }
  )
)

// ─── SERVICES ──────────────────────────────────────────────────────────────
export const useServiceStore = create(
  persist(
    (set) => ({
      services: [],
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
    { name: 'velora-services', storage: dbStorage, version: 1, migrate: () => ({ services: [] }) }
  )
)

// ─── FILES ─────────────────────────────────────────────────────────────────
export const useFileStore = create(
  persist(
    (set) => ({
      files: [],
      addFile: (file) => set(s => ({ files: [{ ...file, id: Date.now(), uploadedAt: new Date().toISOString().split('T')[0] }, ...s.files] })),
      deleteFile: (id) => set(s => ({ files: s.files.filter(f => f.id !== id) })),
    }),
    { name: 'velora-files', storage: dbStorage, version: 1, migrate: () => ({ files: [] }) }
  )
)

// ─── MESSAGES ──────────────────────────────────────────────────────────────
export const useMessageStore = create(
  persist(
    (set) => ({
      conversations: [],
      sendMessage: (convId, text) => set(s => ({
        conversations: s.conversations.map(c => c.id === convId ? { ...c, messages: [...c.messages, { id: Date.now(), from: 'me', text, time: new Date().toISOString() }] } : c)
      })),
      markRead: (convId) => set(s => ({ conversations: s.conversations.map(c => c.id === convId ? { ...c, unread: 0 } : c) })),
      addConversation: (conv) => set(s => ({ conversations: [{ id: Date.now(), ...conv, messages: [], unread: 0 }, ...s.conversations] })),
    }),
    { name: 'velora-messages', storage: dbStorage, version: 1, migrate: () => ({ conversations: [] }) }
  )
)

// ─── FORMS ─────────────────────────────────────────────────────────────────
export const useFormStore = create(
  persist(
    (set) => ({
      forms: [],
      addForm: (form) => set(s => ({ forms: [...s.forms, { id: Date.now(), ...form, submissions: [] }] })),
      updateForm: (id, data) => set(s => ({ forms: s.forms.map(f => f.id === id ? { ...f, ...data } : f) })),
      deleteForm: (id) => set(s => ({ forms: s.forms.filter(f => f.id !== id) })),
      addSubmission: (formId, data) => set(s => ({
        forms: s.forms.map(f => f.id === formId ? { ...f, submissions: [...f.submissions, { id: Date.now(), data, submittedAt: new Date().toISOString() }] } : f)
      })),
    }),
    { name: 'velora-forms', storage: dbStorage, version: 1, migrate: () => ({ forms: [] }) }
  )
)

// ─── SCHEDULING ────────────────────────────────────────────────────────────
export const useSchedulingStore = create(
  persist(
    (set) => ({
      eventTypes: [],
      bookings: [],
      availability: [
        { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
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
    { name: 'velora-scheduling', storage: dbStorage, version: 1, migrate: () => ({ eventTypes: [], bookings: [] }) }
  )
)

// ─── AUTOMATIONS ───────────────────────────────────────────────────────────
export const useAutomationStore = create(
  persist(
    (set) => ({
      automations: [],
      logs: [],
      addAutomation: (a) => set(s => ({ automations: [...s.automations, { id: Date.now(), ...a, runs: 0, lastRun: null }] })),
      updateAutomation: (id, data) => set(s => ({ automations: s.automations.map(a => a.id === id ? { ...a, ...data } : a) })),
      toggleAutomation: (id) => set(s => ({ automations: s.automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a) })),
      deleteAutomation: (id) => set(s => ({ automations: s.automations.filter(a => a.id !== id) })),
    }),
    { name: 'velora-automations', storage: dbStorage, version: 1, migrate: () => ({ automations: [], logs: [] }) }
  )
)

// ─── EXPENSES ──────────────────────────────────────────────────────────────
export const useExpenseStore = create(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (expense) => set(s => ({ expenses: [{ id: Date.now(), ...expense }, ...s.expenses] })),
      updateExpense: (id, data) => set(s => ({ expenses: s.expenses.map(e => e.id === id ? { ...e, ...data } : e) })),
      deleteExpense: (id) => set(s => ({ expenses: s.expenses.filter(e => e.id !== id) })),
    }),
    { name: 'velora-expenses', storage: dbStorage, version: 1, migrate: () => ({ expenses: [] }) }
  )
)

// ─── SETTINGS ──────────────────────────────────────────────────────────────
export const useSettingsStore = create(
  persist(
    (set) => ({
      branding: { businessName: '', logo: null, brandColor: '#6366f1', emailSenderName: '' },
      account: { firstName: '', lastName: '', email: '' },
      notifications: { proposalAccepted: true, contractSigned: true, paymentReceived: true, invoiceOverdue: true, newMessage: true, weeklyReport: false },
      billing: { plan: 'starter', nextBilling: null, portalsUsed: 0, storageUsed: 0 },
      domain: { customDomain: '' },
      updateBranding: (data) => set(s => ({ branding: { ...s.branding, ...data } })),
      updateAccount: (data) => set(s => ({ account: { ...s.account, ...data } })),
      updateNotifications: (data) => set(s => ({ notifications: { ...s.notifications, ...data } })),
      updateDomain: (data) => set(s => ({ domain: { ...s.domain, ...data } })),
    }),
    { name: 'velora-settings', storage: dbStorage, version: 1, migrate: () => ({ branding: { businessName: '', logo: null, brandColor: '#6366f1', emailSenderName: '' }, account: { firstName: '', lastName: '', email: '' }, notifications: { proposalAccepted: true, contractSigned: true, paymentReceived: true, invoiceOverdue: true, newMessage: true, weeklyReport: false }, billing: { plan: 'starter', nextBilling: null, portalsUsed: 0, storageUsed: 0 }, domain: { customDomain: '' } }) }
  )
)

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (n) => set(s => ({ notifications: [{ id: Date.now(), ...n, time: new Date().toISOString(), read: false }, ...s.notifications] })),
      markRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      clearAll: () => set(() => ({ notifications: [] })),
    }),
    { name: 'velora-notifications', storage: dbStorage, version: 1, migrate: () => ({ notifications: [] }) }
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
