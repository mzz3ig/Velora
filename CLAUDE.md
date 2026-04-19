# FreelancePortal — SaaS Project

## Overview
White-labeled client management platform for solo freelancers. Replaces HoneyBook, Bonsai, and 4 separate tools. One link the freelancer sends their client — proposal, contract, payment, files, chat.

**Pitch:** "Send your client one link. They sign the contract, pay the invoice, download the files, and message you — all in one place, all under your brand."

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- Framer Motion (animations)
- React Router v6
- Zustand (state management)
- React Hook Form (forms)
- Tiptap (rich text editor for contracts)

### Backend (Phase 2)
- Node.js + Express
- Supabase (PostgreSQL + Auth + Storage)
- Stripe (payments + webhooks)
- Resend (transactional emails)
- JWT (magic link tokens)
- pdf-lib (PDF generation)

### Infrastructure
- Company server (Node.js backend, Nginx, PM2)
- Supabase Storage (files)
- Cloudflare (DNS + CDN)
- Vercel (frontend)

---

## Design System

### Colors
- Background: `#0a0a0f` (near-black)
- Surface: `#12121a` (card background)
- Surface elevated: `#1a1a2e`
- Primary: `#6366f1` (indigo)
- Primary hover: `#4f46e5`
- Secondary: `#8b5cf6` (violet/purple)
- Accent: `#a78bfa`
- Text primary: `#f8fafc`
- Text secondary: `#94a3b8`
- Text muted: `#475569`
- Border: `rgba(255,255,255,0.08)`
- Glass: `rgba(255,255,255,0.05)` with backdrop-blur

### Typography
- Font: Inter (system), fallback sans-serif
- Headings: bold/semibold, tight tracking
- Body: regular weight, 1.6 line height

### Animations (3 core)
1. **Hero Orb** — animated radial gradient blob that rotates/pulses in the hero background
2. **Scroll Reveal** — elements fade-in + slide-up as they enter viewport (Framer Motion whileInView)
3. **Floating Dashboard** — hero dashboard mockup floats up/down on a sine wave loop

### Design Principles
- Dark-first (dark glassmorphism)
- Glassmorphism cards: semi-transparent bg + backdrop-blur + subtle border
- Ambient gradient orbs behind content
- Futuristic, premium feel
- Clean sidebar navigation in app

---

## Project Structure

```
/
├── CLAUDE.md                  ← this file
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx                ← routing
│   ├── index.css              ← Tailwind v4 + global styles
│   ├── components/
│   │   ├── landing/           ← landing page sections
│   │   ├── ui/                ← reusable UI components
│   │   └── layout/            ← AppShell, Sidebar, etc.
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── app/
│   │       ├── Dashboard.jsx
│   │       ├── Clients.jsx
│   │       ├── Projects.jsx
│   │       ├── ProposalBuilder.jsx
│   │       ├── Contracts.jsx
│   │       ├── Invoices.jsx
│   │       ├── Files.jsx
│   │       ├── Messages.jsx
│   │       └── Settings.jsx
│   ├── store/                 ← Zustand stores
│   └── lib/                   ← utilities
```

---

## Build Roadmap

### Phase 0 — Frontend MVP (current)
- [x] CLAUDE.md created
- [x] Project scaffold (Vite + React + Tailwind v4 + Framer Motion)
- [x] Landing page (Hero, Features, Pricing, CTA, Footer)
- [x] Auth pages (Login, Register)
- [x] App shell (sidebar layout, routing)
- [x] Dashboard page
- [x] Clients page
- [x] Projects page
- [x] Proposal builder
- [x] Contracts page
- [x] Invoices page
- [x] Files page
- [x] Messages page
- [x] Settings pages

### Phase 1 — Backend (next)
- [ ] Supabase project setup + all DB tables from schema
- [ ] Node.js + Express API
- [ ] Supabase Auth integration
- [ ] Magic link token system (JWT)
- [ ] Client-facing portal pages (no-auth)
- [ ] Stripe integration (payment links + webhooks)
- [ ] Resend email integration
- [ ] PDF generation (pdf-lib)
- [ ] File upload to Supabase Storage

### Phase 2 — Growth features
- [ ] Custom domain support
- [ ] Automation engine (reminder sequences)
- [ ] Analytics dashboard
- [ ] Portuguese language support
- [ ] Zapier webhook integration

### Phase 3 — Scale
- [ ] Affiliate/referral program
- [ ] Public API
- [ ] Recurring invoices
- [ ] Revenue forecasting

---

## Pricing
- **Starter:** €15/month — 3 active portals, 5GB storage, subdomain
- **Pro:** €29/month — unlimited portals, custom domain, 20GB, automations, analytics

## Exit Target
- 750 customers × €29/month = €21,750 MRR
- ARR €261,000 × 4x multiple = **€1,044,000 exit**
- Timeline: 3–4 years

---

## Key Business Rules
- Clients NEVER create accounts — access via magic links (JWT, 30-day expiry)
- Every client-facing page is white-labeled (freelancer brand only)
- Magic token types: 'proposal' | 'contract' | 'invoice' | 'portal'
- E-signatures: canvas draw or type name → stored as base64 + timestamp + IP
- Contracts generate PDF via pdf-lib, stored in Supabase Storage
- Stripe webhooks update invoice status in real time
- Overdue invoices: cron job runs daily, sends reminders at +1, +3, +7 days

---

## Target Markets
- Primary: Solo freelancers in Europe (design, dev, writing, photography, consulting)
- Secondary: Brazilian freelancers (25M+ market, underserved, Portuguese-language support)

---

## Running Costs (at scale ~750 customers)
- Supabase Pro: ~€100–150/month
- Resend: ~€30/month
- Misc: ~€20/month
- **Total: ~€170/month** at €21,750 MRR → 99%+ gross margin

---

*Last updated: April 2026*
*Developer: Rodrigo Mendes*
