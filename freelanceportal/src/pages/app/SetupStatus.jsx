import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  Database,
  FileWarning,
  Globe,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  TestTube2,
  Wrench,
} from 'lucide-react'
import {
  useAutomationStore,
  useClientStore,
  useContractStore,
  useFileStore,
  useFormStore,
  useInvoiceStore,
  useMessageStore,
  useProjectStore,
  useProposalStore,
  useSettingsStore,
  useTaskStore,
} from '../../store'
import { getBackendHealth, getDataStatus, getStripeDiagnostics, migrateDataToTables } from '../../lib/api'
import { featureStatuses } from '../../lib/featureStatus'

const STATUS = {
  complete: { label: 'Completo', color: '#22c55e', icon: CheckCircle2 },
  partial: { label: 'Parcial', color: '#f59e0b', icon: CircleDashed },
  missing: { label: 'Não configurado', color: '#f87171', icon: AlertTriangle },
  action: { label: 'Ação necessária', color: '#fb923c', icon: FileWarning },
  dev: { label: 'Em desenvolvimento', color: '#94a3b8', icon: Wrench },
}

function StatusPill({ status }) {
  const meta = STATUS[status] || STATUS.dev
  const Icon = meta.icon
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px',
      borderRadius: 999,
      background: `${meta.color}18`,
      color: meta.color,
      fontSize: '0.72rem',
      fontWeight: 800,
      whiteSpace: 'nowrap',
    }}>
      <Icon size={12} />
      {meta.label}
    </span>
  )
}

function CheckRow({ icon: Icon, title, detail, status, action, lastChecked }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 1fr auto',
      gap: 12,
      alignItems: 'flex-start',
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
      }}>
        <Icon size={15} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{title}</h3>
          <StatusPill status={status} />
        </div>
        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{detail}</p>
        <p style={{ margin: '5px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Última verificação: {lastChecked || 'agora'} · Próxima ação: {action}
        </p>
      </div>
      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        {status === 'complete' ? 'Sem ação' : 'Resolver'}
      </span>
    </div>
  )
}

export default function SetupStatus() {
  const { clients } = useClientStore()
  const { projects } = useProjectStore()
  const { invoices } = useInvoiceStore()
  const { proposals } = useProposalStore()
  const { contracts } = useContractStore()
  const { tasks } = useTaskStore()
  const { files } = useFileStore()
  const { conversations } = useMessageStore()
  const { forms } = useFormStore()
  const { automations } = useAutomationStore()
  const { billing, domain } = useSettingsStore()
  const [health, setHealth] = useState(null)
  const [stripeDiagnostics, setStripeDiagnostics] = useState(null)
  const [dataStatus, setDataStatus] = useState(null)
  const [healthError, setHealthError] = useState('')
  const [stripeError, setStripeError] = useState('')
  const [dataError, setDataError] = useState('')
  const [checking, setChecking] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [lastChecked, setLastChecked] = useState('')

  async function refresh() {
    setChecking(true)
    setHealthError('')
    setStripeError('')
    setDataError('')
    try {
      const [healthData, stripeData, dataState] = await Promise.all([
        getBackendHealth({ deep: true }),
        getStripeDiagnostics(),
        getDataStatus(),
      ])
      setHealth(healthData)
      setStripeDiagnostics(stripeData)
      setDataStatus(dataState)
    } catch (error) {
      setHealthError(error.message || 'Backend health check failed')
      setStripeError(error.message || 'Stripe diagnostics failed')
      setDataError(error.message || 'Data status failed')
      setHealth(null)
      setStripeDiagnostics(null)
      setDataStatus(null)
    } finally {
      setLastChecked(new Date().toLocaleString())
      setChecking(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function runMigration() {
    setMigrating(true)
    setMigrationResult(null)
    setDataError('')
    try {
      const result = await migrateDataToTables()
      setMigrationResult(result.result || result)
      await refresh()
    } catch (error) {
      setDataError(error.message || 'Migration failed')
    } finally {
      setMigrating(false)
    }
  }

  const rows = useMemo(() => {
    const hasStripeCustomer = Boolean(billing?.stripeCustomerId)
    const hasStripeSubscription = Boolean(billing?.stripeSubscriptionId)
    const stripeOk = stripeDiagnostics?.ok === true
    const stripeActions = stripeDiagnostics?.actionsRequired || []
    const backendOk = health?.ok === true
    const backendMissing = health?.missing || []
    const supabaseOk = health?.checks?.supabase?.ok
    const pgcryptoOk = health?.checks?.pgcrypto?.ok
    const dataTables = dataStatus?.tables || health?.checks?.dataTables || {}
    const missingTables = Object.entries(dataTables)
      .filter(([, check]) => !check?.ok)
      .map(([table]) => table)

    return [
      {
        icon: KeyRound,
        title: 'Variáveis de ambiente',
        status: backendOk ? 'complete' : 'action',
        detail: backendOk
          ? 'Backend respondeu ao health check e não reportou variáveis obrigatórias em falta.'
          : healthError || `Backend não está completo. Em falta: ${backendMissing.length ? backendMissing.join(', ') : 'health check indisponível'}.`,
        action: backendOk ? 'Manter Vercel/Supabase env vars sincronizadas' : 'Configurar env vars no backend e ambiente de deploy',
      },
      {
        icon: Database,
        title: 'Dados guardados no Supabase',
        status: supabaseOk && pgcryptoOk && missingTables.length === 0 ? 'partial' : 'action',
        detail: supabaseOk && pgcryptoOk
          ? missingTables.length
            ? `Os dados atuais continuam guardados em velora_state. Tabelas relacionais ainda por aplicar no Supabase: ${missingTables.join(', ')}.`
            : 'Clientes, projetos, faturas e restantes stores são persistidos no Supabase; as tabelas relacionais principais também existem para migração progressiva.'
          : 'Supabase/pgcrypto não passou no health check ou o backend não conseguiu validar a ligação.',
        action: missingTables.length ? 'Aplicar o schema.sql no Supabase' : 'Migrar stores de velora_state para tabelas dedicadas módulo a módulo',
      },
      {
        icon: Lock,
        title: 'Permissões e isolamento',
        status: 'partial',
        detail: 'RLS existe para velora_state, onboarding e portal_links. O portal usa funções security definer e tokens, mas não há testes automatizados de isolamento entre utilizadores/clientes.',
        action: 'Adicionar testes de acesso User A/User B, portal token expirado e permissões por documento',
      },
      {
        icon: CreditCard,
        title: 'Stripe billing da Velora',
        status: stripeOk && hasStripeCustomer && hasStripeSubscription ? 'partial' : 'action',
        detail: stripeDiagnostics
          ? `Modo ${stripeDiagnostics.mode}. ${stripeActions.length ? stripeActions.join(' · ') : 'Stripe respondeu, prices e webhook têm configuração básica.'}`
          : stripeError || 'Diagnóstico Stripe ainda não disponível.',
        action: hasStripeCustomer ? 'Completar upgrades/downgrades, webhooks e testes Stripe' : 'Criar checkout/subscrição e confirmar customer/subscription IDs',
      },
      {
        icon: CreditCard,
        title: 'Pagamentos de faturas via Stripe',
        status: invoices.some((invoice) => invoice.stripeCheckoutUrl) ? 'partial' : 'action',
        detail: 'A app cria Checkout Sessions para faturas, mas não cobre SEPA, pagamentos parciais, refunds, chargebacks, invoice.payment_succeeded e falhas de pagamento de faturas de cliente.',
        action: 'Completar eventos de pagamento, recibos, estados e reconciliação com Stripe',
      },
      {
        icon: Mail,
        title: 'Email provider',
        status: 'missing',
        detail: 'Não há integração real de email transacional. Várias páginas indicam Phase 1, mas convites, propostas, contratos e lembretes não são enviados automaticamente.',
        action: 'Configurar provider, templates, envio de teste e logs de entrega',
      },
      {
        icon: Globe,
        title: 'Domínio e portal',
        status: domain?.customDomain ? 'partial' : 'action',
        detail: domain?.customDomain
          ? 'Existe domínio guardado na UI, mas não há verificação DNS nem provisionamento real.'
          : 'Domínio custom não configurado. O portal funciona por magic link, mas white-label/DNS ainda não está validado.',
        action: 'Adicionar verificação DNS, estado visual e bloqueio de falso “connected”',
      },
      {
        icon: Wrench,
        title: 'Funcionalidades de produto',
        status: 'dev',
        detail: `${clients.length} clientes, ${projects.length} projetos, ${proposals.length} propostas, ${contracts.length} contratos, ${tasks.length} tarefas e ${invoices.length} faturas estão no store persistido em Supabase. A limitação atual é o formato JSON agregador, não a ausência de Supabase.`,
        action: 'Promover módulos críticos para tabelas Supabase dedicadas com validação de servidor',
      },
      {
        icon: FileWarning,
        title: 'Mocks, placeholders e Phase 1',
        status: 'action',
        detail: `${files.length} ficheiros, ${conversations.length} conversas, ${forms.length} formulários e ${automations.length} automações podem existir na UI, mas há textos de Phase 1 e fluxos sem execução real.`,
        action: 'Marcar botões incompletos como Em desenvolvimento ou ligar a backend real',
      },
      {
        icon: TestTube2,
        title: 'Testes automatizados',
        status: 'missing',
        detail: 'Não há suite Vitest/Playwright/API no projeto. Build e lint passam, mas os fluxos críticos não estão testados.',
        action: 'Criar testes de auth, CRUD, portal, Stripe webhooks, RLS e smoke tests de produção',
      },
      {
        icon: ShieldAlert,
        title: 'Prontidão de produção',
        status: 'action',
        detail: 'A app ainda não tem observabilidade, logs estruturados suficientes, rate limiting completo, backup/migração operacional ou diagnóstico Stripe completo.',
        action: 'Fechar riscos críticos antes de considerar lançamento público',
      },
    ]
  }, [automations.length, billing, clients.length, conversations.length, contracts.length, dataStatus, domain, files.length, forms.length, health, healthError, invoices, projects.length, proposals.length, stripeDiagnostics, stripeError, tasks.length])

  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ padding: 32, maxWidth: 1120 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: 0, marginBottom: 4 }}>Setup status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tudo o que não está pronto fica marcado como ação necessária, não configurado ou em desenvolvimento.
          </p>
        </div>
        <button onClick={refresh} disabled={checking} className="btn-primary" style={{ padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={14} />
          {checking ? 'A verificar...' : 'Revalidar'}
        </button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {Object.entries(STATUS).map(([key, meta]) => (
          <div key={key} className="stat-card" style={{ padding: 14 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: meta.color }}>{counts[key] || 0}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{meta.label}</div>
          </div>
        ))}
      </div>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Checklist operacional</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lastChecked ? `Atualizado: ${lastChecked}` : 'A aguardar verificação'}</span>
        </div>
        {rows.map((row) => (
          <CheckRow key={row.title} {...row} lastChecked={lastChecked || 'a carregar'} />
        ))}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>Migração para tabelas Supabase</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Mantém os dados atuais em <code>velora_state</code> e copia para as tabelas relacionais quando o schema estiver aplicado.
            </p>
          </div>
          <button
            onClick={runMigration}
            disabled={migrating || !dataStatus?.canMigrate}
            className="btn-primary"
            style={{ padding: '9px 14px', opacity: dataStatus?.canMigrate ? 1 : 0.55, cursor: dataStatus?.canMigrate ? 'pointer' : 'not-allowed' }}
            title={dataStatus?.canMigrate ? 'Migrar dados atuais para tabelas relacionais' : 'Aplica primeiro o schema.sql no Supabase'}
          >
            {migrating ? 'A migrar...' : 'Migrar dados'}
          </button>
        </div>

        {dataError && (
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.82rem', marginBottom: 12 }}>
            {dataError}
          </div>
        )}

        {dataStatus?.missingTables?.length > 0 && (
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.82rem', marginBottom: 12 }}>
            Ação necessária: aplica o schema no Supabase. Tabelas em falta: {dataStatus.missingTables.join(', ')}.
          </div>
        )}

        {migrationResult && (
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '0.82rem', marginBottom: 12 }}>
            Migração executada. Workspace: {migrationResult.workspace_id || 'criado'}.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {['clients', 'projects', 'proposals', 'contracts', 'invoices', 'tasks', 'time_entries', 'expenses'].map((key) => (
            <div key={key} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{key.replace('_', ' ')}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>velora_state</span>
                <strong style={{ fontSize: '0.85rem' }}>{dataStatus?.legacy?.[key] ?? '-'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 5 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>tabelas</span>
                <strong style={{ fontSize: '0.85rem' }}>{dataStatus?.normalized?.[key] ?? '-'}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Funcionalidades auditadas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {featureStatuses.map((group) => (
            <div key={group.area} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--bg-secondary)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: 10 }}>{group.area}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.items.map((item) => (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.name}</span>
                      <StatusPill status={item.status} />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
