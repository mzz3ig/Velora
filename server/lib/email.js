const { Resend } = require('resend')

let _resend = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.EMAIL_FROM || 'Velora <noreply@veloraworkspace.com>'
const FRONTEND = (process.env.FRONTEND_URL || 'https://veloraworkspace.vercel.app').replace(/\/$/, '')

function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

async function send({ to, subject, html }) {
  if (!isConfigured()) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to)
    return { skipped: true }
  }
  try {
    const r = await getResend().emails.send({ from: FROM, to, subject, html })
    console.log('[email] sent to', to, '—', subject, '| id:', r.data?.id)
    return r
  } catch (err) {
    console.error('[email] failed to', to, '—', err.message)
    throw err
  }
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(content, { brandColor = '#6366f1', businessName = 'Velora' } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${businessName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:${brandColor};padding:28px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:1.4rem;font-weight:700;letter-spacing:-0.02em;">${businessName}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;color:#1a1a2e;font-size:0.95rem;line-height:1.7;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;background:#f9f9fb;border-top:1px solid #e8e8ef;color:#888;font-size:0.78rem;text-align:center;">
          Powered by <a href="${FRONTEND}" style="color:${brandColor};text-decoration:none;">Velora</a> — the all-in-one platform for freelancers
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(text, url, color = '#6366f1') {
  return `<p style="margin:24px 0 0;"><a href="${url}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:0.95rem;">${text}</a></p>`
}

// ─── Templates ────────────────────────────────────────────────────────────────

// 1. Welcome email after signup
async function sendWelcome({ to, firstName }) {
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#1a1a2e;">Welcome to Velora, ${firstName || 'there'}! 👋</h2>
    <p>Your account is ready. You can now manage clients, send proposals, collect signatures, and get paid — all in one place.</p>
    <p>Here's how to get started:</p>
    <ol style="padding-left:20px;color:#444;">
      <li style="margin-bottom:8px;">Add your first client</li>
      <li style="margin-bottom:8px;">Create a project</li>
      <li style="margin-bottom:8px;">Send a proposal or invoice</li>
    </ol>
    ${btn('Go to dashboard', `${FRONTEND}/app/dashboard`)}
  `)
  return send({ to, subject: `Welcome to Velora, ${firstName || 'there'}!`, html })
}

// 2. Client portal invite
async function sendPortalInvite({ to, clientName, freelancerName, businessName, portalUrl }) {
  const biz = businessName || freelancerName || 'Your service provider'
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#1a1a2e;">You've been invited to a client portal</h2>
    <p>Hi ${clientName || 'there'},</p>
    <p><strong>${biz}</strong> has set up a private portal for you where you can view your project, sign documents, pay invoices, and share files.</p>
    <p>Click the button below to access your portal — no account needed.</p>
    ${btn('Open my portal', portalUrl)}
    <p style="margin-top:20px;color:#888;font-size:0.8rem;">This link is private and only for you. It expires in 30 days.</p>
  `)
  return send({ to, subject: `${biz} has shared a portal with you`, html })
}

// 3. Proposal sent to client
async function sendProposalToClient({ to, clientName, freelancerName, businessName, proposalTitle, amount, currency, expiryDate, proposalUrl }) {
  const biz = businessName || freelancerName || 'Your service provider'
  const amtStr = amount ? `${currency || '€'}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#1a1a2e;">You have a new proposal</h2>
    <p>Hi ${clientName || 'there'},</p>
    <p><strong>${biz}</strong> has sent you a proposal${proposalTitle ? ` for <em>${proposalTitle}</em>` : ''}${amtStr ? ` totalling <strong>${amtStr}</strong>` : ''}.</p>
    ${expiryDate ? `<p>This proposal expires on <strong>${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>` : ''}
    <p>Review and accept or decline the proposal using the button below.</p>
    ${btn('View proposal', proposalUrl)}
    <p style="margin-top:20px;color:#888;font-size:0.8rem;">You don't need an account — just click the link.</p>
  `)
  return send({ to, subject: `New proposal from ${biz}`, html })
}

// 4. Proposal accepted (notify freelancer)
async function sendProposalAccepted({ to, freelancerName, clientName, proposalTitle, dashboardUrl }) {
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#22c55e;">Proposal accepted ✓</h2>
    <p>Hi ${freelancerName || 'there'},</p>
    <p><strong>${clientName || 'Your client'}</strong> has accepted your proposal${proposalTitle ? ` for <em>${proposalTitle}</em>` : ''}.</p>
    <p>You can now create a contract or invoice to move the project forward.</p>
    ${btn('View in dashboard', dashboardUrl || `${FRONTEND}/app/proposals`, '#22c55e')}
  `)
  return send({ to, subject: `Proposal accepted by ${clientName || 'client'}`, html })
}

// 5. Proposal declined (notify freelancer)
async function sendProposalDeclined({ to, freelancerName, clientName, proposalTitle, dashboardUrl }) {
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#ef4444;">Proposal declined</h2>
    <p>Hi ${freelancerName || 'there'},</p>
    <p><strong>${clientName || 'Your client'}</strong> has declined your proposal${proposalTitle ? ` for <em>${proposalTitle}</em>` : ''}.</p>
    ${btn('View in dashboard', dashboardUrl || `${FRONTEND}/app/proposals`, '#6366f1')}
  `)
  return send({ to, subject: `Proposal declined by ${clientName || 'client'}`, html })
}

// 6. Contract sent to client
async function sendContractToClient({ to, clientName, freelancerName, businessName, contractTitle, contractUrl }) {
  const biz = businessName || freelancerName || 'Your service provider'
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#1a1a2e;">Contract ready to sign</h2>
    <p>Hi ${clientName || 'there'},</p>
    <p><strong>${biz}</strong> has sent you a contract${contractTitle ? ` titled <em>${contractTitle}</em>` : ''} to review and sign.</p>
    <p>You can sign it digitally — no printing or scanning needed.</p>
    ${btn('Review & sign contract', contractUrl)}
    <p style="margin-top:20px;color:#888;font-size:0.8rem;">You don't need an account — just click the link.</p>
  `)
  return send({ to, subject: `Contract from ${biz} — please sign`, html })
}

// 7. Contract signed (notify freelancer)
async function sendContractSigned({ to, freelancerName, clientName, contractTitle, dashboardUrl }) {
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#22c55e;">Contract signed ✓</h2>
    <p>Hi ${freelancerName || 'there'},</p>
    <p><strong>${clientName || 'Your client'}</strong> has signed the contract${contractTitle ? ` for <em>${contractTitle}</em>` : ''}.</p>
    <p>The project is officially confirmed. You can now create an invoice or start work.</p>
    ${btn('View in dashboard', dashboardUrl || `${FRONTEND}/app/contracts`, '#22c55e')}
  `)
  return send({ to, subject: `Contract signed by ${clientName || 'client'}`, html })
}

// 8. Invoice sent to client
async function sendInvoiceToClient({ to, clientName, freelancerName, businessName, invoiceNumber, amount, currency, dueDate, invoiceUrl }) {
  const biz = businessName || freelancerName || 'Your service provider'
  const amtStr = `${currency || '€'}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const dueDateStr = dueDate ? new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#1a1a2e;">Invoice ${invoiceNumber || ''} from ${biz}</h2>
    <p>Hi ${clientName || 'there'},</p>
    <p>You have a new invoice from <strong>${biz}</strong> for <strong>${amtStr}</strong>${dueDateStr ? `, due on <strong>${dueDateStr}</strong>` : ''}.</p>
    <p>You can pay securely online using the button below.</p>
    ${btn('View & pay invoice', invoiceUrl)}
    <p style="margin-top:20px;color:#888;font-size:0.8rem;">Accepted: card, Apple Pay, Google Pay.</p>
  `)
  return send({ to, subject: `Invoice ${invoiceNumber || ''} from ${biz} — ${amtStr}`, html })
}

// 9. Invoice paid (notify freelancer)
async function sendInvoicePaid({ to, freelancerName, clientName, invoiceNumber, amount, currency, dashboardUrl }) {
  const amtStr = `${currency || '€'}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#22c55e;">Payment received ✓</h2>
    <p>Hi ${freelancerName || 'there'},</p>
    <p><strong>${clientName || 'Your client'}</strong> has paid invoice ${invoiceNumber || ''} for <strong>${amtStr}</strong>.</p>
    ${btn('View in dashboard', dashboardUrl || `${FRONTEND}/app/invoices`, '#22c55e')}
  `)
  return send({ to, subject: `Payment received — ${amtStr} from ${clientName || 'client'}`, html })
}

// 10. Payment receipt to client
async function sendPaymentReceipt({ to, clientName, businessName, freelancerName, invoiceNumber, amount, currency, paidAt }) {
  const biz = businessName || freelancerName || 'Your service provider'
  const amtStr = `${currency || '€'}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const dateStr = paidAt ? new Date(paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#22c55e;">Payment confirmed ✓</h2>
    <p>Hi ${clientName || 'there'},</p>
    <p>Your payment of <strong>${amtStr}</strong> to <strong>${biz}</strong>${invoiceNumber ? ` for invoice ${invoiceNumber}` : ''} has been received on ${dateStr}.</p>
    <p>Thank you!</p>
  `)
  return send({ to, subject: `Payment receipt — ${amtStr} to ${biz}`, html })
}

// 11. Invoice overdue reminder
async function sendInvoiceOverdueReminder({ to, clientName, freelancerName, businessName, invoiceNumber, amount, currency, daysOverdue, invoiceUrl }) {
  const biz = businessName || freelancerName || 'Your service provider'
  const amtStr = `${currency || '€'}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#f59e0b;">Payment reminder</h2>
    <p>Hi ${clientName || 'there'},</p>
    <p>This is a friendly reminder that invoice ${invoiceNumber || ''} from <strong>${biz}</strong> for <strong>${amtStr}</strong> is <strong>${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</strong>.</p>
    <p>Please pay at your earliest convenience.</p>
    ${btn('Pay now', invoiceUrl, '#f59e0b')}
  `, { brandColor: '#f59e0b', businessName: biz })
  return send({ to, subject: `Reminder: Invoice ${invoiceNumber || ''} is ${daysOverdue} days overdue`, html })
}

// 12. Payment failed (notify freelancer)
async function sendPaymentFailed({ to, freelancerName, clientName, invoiceNumber, amount, currency, dashboardUrl }) {
  const amtStr = `${currency || '€'}${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#ef4444;">Payment failed</h2>
    <p>Hi ${freelancerName || 'there'},</p>
    <p>A payment of <strong>${amtStr}</strong> from <strong>${clientName || 'your client'}</strong>${invoiceNumber ? ` for invoice ${invoiceNumber}` : ''} has failed.</p>
    <p>You may want to follow up with your client or resend the payment link.</p>
    ${btn('View in dashboard', dashboardUrl || `${FRONTEND}/app/invoices`, '#ef4444')}
  `)
  return send({ to, subject: `Payment failed — ${amtStr} from ${clientName || 'client'}`, html })
}

// 13. Velora subscription confirmation
async function sendSubscriptionConfirmed({ to, firstName, plan, amount, currency, nextBillingDate }) {
  const amtStr = amount ? `${currency || '€'}${Number(amount / 100).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''
  const dateStr = nextBillingDate ? new Date(nextBillingDate * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#22c55e;">Subscription confirmed ✓</h2>
    <p>Hi ${firstName || 'there'},</p>
    <p>Your <strong>Velora ${plan || 'Pro'}</strong> subscription is now active${amtStr ? ` at <strong>${amtStr}/month</strong>` : ''}.</p>
    ${dateStr ? `<p>Next billing date: <strong>${dateStr}</strong></p>` : ''}
    ${btn('Go to dashboard', `${FRONTEND}/app/dashboard`, '#22c55e')}
  `)
  return send({ to, subject: `Velora ${plan || 'Pro'} subscription confirmed`, html })
}

// 14. Velora subscription cancelled
async function sendSubscriptionCancelled({ to, firstName, plan, endsAt }) {
  const dateStr = endsAt ? new Date(endsAt * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const html = layout(`
    <h2 style="margin:0 0 12px;font-size:1.3rem;color:#ef4444;">Subscription cancelled</h2>
    <p>Hi ${firstName || 'there'},</p>
    <p>Your <strong>Velora ${plan || ''}</strong> subscription has been cancelled.</p>
    ${dateStr ? `<p>You'll continue to have access until <strong>${dateStr}</strong>.</p>` : ''}
    <p>If you change your mind, you can reactivate at any time.</p>
    ${btn('Manage billing', `${FRONTEND}/app/settings/billing`, '#6366f1')}
  `)
  return send({ to, subject: 'Your Velora subscription has been cancelled', html })
}

module.exports = {
  isConfigured,
  sendWelcome,
  sendPortalInvite,
  sendProposalToClient,
  sendProposalAccepted,
  sendProposalDeclined,
  sendContractToClient,
  sendContractSigned,
  sendInvoiceToClient,
  sendInvoicePaid,
  sendPaymentReceipt,
  sendInvoiceOverdueReminder,
  sendPaymentFailed,
  sendSubscriptionConfirmed,
  sendSubscriptionCancelled,
}
