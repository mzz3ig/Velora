export const featureStatuses = [
  {
    area: 'Dados',
    items: [
      { name: 'Supabase Auth', status: 'complete', detail: 'Login, signup, reset password e sessão persistente usam Supabase Auth.' },
      { name: 'Persistência atual em Supabase', status: 'partial', detail: 'Stores Zustand são guardados em velora_state no Supabase.' },
      { name: 'Tabelas relacionais por entidade', status: 'partial', detail: 'Schema inicial criado; falta ligar a UI módulo a módulo.' },
      { name: 'Migração de velora_state para tabelas', status: 'missing', detail: 'Ainda falta script de migração e escrita dupla controlada.' },
      { name: 'RLS por entidade', status: 'partial', detail: 'Policies básicas existem no schema inicial; falta teste automatizado.' },
    ],
  },
  {
    area: 'Stripe',
    items: [
      { name: 'Checkout de subscrição', status: 'partial', detail: 'Cria checkout session com Price IDs configurados.' },
      { name: 'Billing portal', status: 'partial', detail: 'Abre portal se existir customer ID.' },
      { name: 'Pagamentos de faturas', status: 'partial', detail: 'Cria checkout payment para faturas; faltam estados avançados.' },
      { name: 'Products/prices sync', status: 'missing', detail: 'Ainda não valida products/prices contra Stripe.' },
      { name: 'Webhook completo', status: 'partial', detail: 'Eventos principais de subscription existem; faltam invoice/payment/refund/dispute completos.' },
      { name: 'Diagnóstico Stripe', status: 'missing', detail: 'Falta página/API dedicada com chaves, modo test/live, último evento e mismatch.' },
      { name: 'Stripe Connect', status: 'missing', detail: 'Ainda não decidido/implementado para pagamentos diretos aos prestadores.' },
    ],
  },
  {
    area: 'Produto',
    items: [
      { name: 'Clientes/CRM', status: 'partial', detail: 'CRUD básico existe; falta modelo relacional completo, múltiplos contactos e histórico real.' },
      { name: 'Projetos', status: 'partial', detail: 'CRUD e portal link existem; faltam views calendário/timeline/gantt completas.' },
      { name: 'Tarefas', status: 'partial', detail: 'Lista/Kanban/subtarefas existem; falta recorrência, anexos e permissões.' },
      { name: 'Propostas', status: 'partial', detail: 'Builder e aceite/recusa no portal existem; falta templates robustos, comentários e depósito.' },
      { name: 'Contratos', status: 'partial', detail: 'Assinatura simples existe; falta PDF assinado completo, IP e bloqueio forte.' },
      { name: 'Faturas', status: 'partial', detail: 'CRUD, PDF e checkout existem; faltam recorrência, lembretes e pagamentos parciais.' },
      { name: 'Automations', status: 'dev', detail: 'Builder visual existe, mas as automações ainda não executam em backend.' },
      { name: 'Email transacional', status: 'missing', detail: 'Ainda não há provider real configurado.' },
      { name: 'Equipa/RBAC', status: 'missing', detail: 'Faltam membros, roles e permissões por workspace.' },
      { name: 'Integrações externas', status: 'missing', detail: 'Google, Slack, Zapier, QuickBooks, Xero e similares ainda não existem.' },
    ],
  },
  {
    area: 'Produção',
    items: [
      { name: 'Testes automatizados', status: 'missing', detail: 'Faltam testes de auth, CRUD, RLS, portal e Stripe.' },
      { name: 'Observabilidade', status: 'missing', detail: 'Faltam logs estruturados, métricas e alertas.' },
      { name: 'Domínio custom', status: 'partial', detail: 'UI guarda domínio, mas falta verificação DNS real.' },
      { name: 'GDPR/export/delete account', status: 'missing', detail: 'Faltam exportação, retenção, consentimento e eliminação real de conta.' },
      { name: 'Prontidão de lançamento', status: 'dev', detail: 'Ainda há funcionalidades incompletas que precisam de bloqueio/estado visual.' },
    ],
  },
]

export function flattenFeatureStatuses() {
  return featureStatuses.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      area: group.area,
    })),
  )
}
