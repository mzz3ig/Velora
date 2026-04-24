import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Onboarding from './pages/auth/Onboarding'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import PublicForm from './pages/PublicForm'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Admin
import AdminRoute from './pages/admin/AdminRoute'
import AdminShell from './pages/admin/AdminShell'
import AdminOverview from './pages/admin/AdminOverview'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminData from './pages/admin/AdminData'
import AdminStores from './pages/admin/AdminStores'
import AdminHealth from './pages/admin/AdminHealth'
import AdminFlags from './pages/admin/AdminFlags'
import AdminActions from './pages/admin/AdminActions'
import AdminDanger from './pages/admin/AdminDanger'
import AdminConfig from './pages/admin/AdminConfig'

// App pages
import Dashboard from './pages/app/Dashboard'
import Clients from './pages/app/Clients'
import Projects from './pages/app/Projects'
import ProposalBuilder from './pages/app/ProposalBuilder'
import Contracts from './pages/app/Contracts'
import Invoices from './pages/app/Invoices'
import Files from './pages/app/Files'
import Messages from './pages/app/Messages'
import Settings from './pages/app/Settings'
import TimeTracking from './pages/app/TimeTracking'
import Expenses from './pages/app/Expenses'
import Services from './pages/app/Services'
import Pipeline from './pages/app/Pipeline'
import Forms from './pages/app/Forms'
import Scheduling from './pages/app/Scheduling'
import Reports from './pages/app/Reports'
import Automations from './pages/app/Automations'
import Tasks from './pages/app/Tasks'
import SetupStatus from './pages/app/SetupStatus'

// Client Portal pages (public, magic-link based)
import PortalLayout from './pages/portal/PortalLayout'
import PortalOverview from './pages/portal/PortalOverview'
import PortalProposal from './pages/portal/PortalProposal'
import PortalContract from './pages/portal/PortalContract'
import PortalInvoice from './pages/portal/PortalInvoice'
import PortalFiles from './pages/portal/PortalFiles'
import PortalMessages from './pages/portal/PortalMessages'

function PortalIndexRedirect() {
  const location = useLocation()
  return <Navigate to={`/portal/overview${location.search}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/form/:ownerId/:formId" element={<PublicForm />} />

        {/* Client Portal — public, no auth, magic link (JWT in Phase 1) */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalIndexRedirect />} />
          <Route path="overview" element={<PortalOverview />} />
          <Route path="proposal" element={<PortalProposal />} />
          <Route path="contract" element={<PortalContract />} />
          <Route path="invoice" element={<PortalInvoice />} />
          <Route path="files" element={<PortalFiles />} />
          <Route path="messages" element={<PortalMessages />} />
        </Route>

        {/* App */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="proposals" element={<ProposalBuilder />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="time" element={<TimeTracking />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="services" element={<Services />} />
            <Route path="forms" element={<Forms />} />
            <Route path="scheduling" element={<Scheduling />} />
            <Route path="files" element={<Files />} />
            <Route path="messages" element={<Messages />} />
            <Route path="reports" element={<Reports />} />
            <Route path="automations" element={<Automations />} />
            <Route path="setup" element={<SetupStatus />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin routes are limited to the configured admin email. */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="data" element={<AdminData />} />
            <Route path="stores" element={<AdminStores />} />
            <Route path="health" element={<AdminHealth />} />
            <Route path="flags" element={<AdminFlags />} />
            <Route path="actions" element={<AdminActions />} />
            <Route path="danger" element={<AdminDanger />} />
            <Route path="config" element={<AdminConfig />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
