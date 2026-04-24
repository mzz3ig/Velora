create table if not exists public.velora_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  store_key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key)
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- ─── PRODUCTION DATA MODEL ────────────────────────────────────────────────
-- Velora currently persists app stores in public.velora_state. These tables
-- are the normalized Supabase target for production modules. They can be
-- adopted module by module while keeping velora_state as the migration source.

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My workspace',
  country text,
  currency text not null default 'EUR',
  language text not null default 'en',
  timezone text not null default 'Europe/Lisbon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'manager', 'member', 'accountant')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  website text,
  tax_id text,
  address jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'lead',
  priority text not null default 'medium',
  budget numeric(12,2),
  currency text not null default 'EUR',
  starts_at date,
  deadline date,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  currency text not null default 'EUR',
  subtotal numeric(12,2) not null default 0,
  discount numeric(6,2) not null default 0,
  tax numeric(6,2) not null default 0,
  total numeric(12,2) not null default 0,
  content jsonb not null default '{}'::jsonb,
  valid_until date,
  sent_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  proposal_id uuid references public.proposals(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  content text,
  signed_at timestamptz,
  signer_name text,
  signer_ip inet,
  signed_pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  proposal_id uuid references public.proposals(id) on delete set null,
  contract_id uuid references public.contracts(id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft',
  currency text not null default 'EUR',
  subtotal numeric(12,2) not null default 0,
  discount numeric(6,2) not null default 0,
  tax numeric(6,2) not null default 0,
  total numeric(12,2) not null default 0,
  issued_on date,
  due_on date,
  paid_at timestamptz,
  viewed_at timestamptz,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_checkout_url text,
  notes text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, invoice_number)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax numeric(6,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  status text not null default 'pending',
  provider text not null default 'stripe',
  provider_payment_id text,
  paid_at timestamptz,
  raw_event jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  notes text,
  status text not null default 'todo',
  priority text not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  assignee text,
  kanban_col text,
  due_on date,
  completed_at timestamptz,
  portal_visible boolean not null default false,
  subtasks jsonb not null default '[]'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  description text,
  entry_date date not null default current_date,
  minutes int not null check (minutes > 0),
  billable boolean not null default true,
  hourly_rate numeric(12,2),
  invoiced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  category text,
  merchant text not null,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  tax numeric(6,2) not null default 0,
  expense_date date not null default current_date,
  reimbursable boolean not null default false,
  billable boolean not null default false,
  receipt_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_workspace_idx on public.clients(workspace_id, status);
create index if not exists projects_workspace_idx on public.projects(workspace_id, status);
create index if not exists invoices_workspace_idx on public.invoices(workspace_id, status);
create index if not exists tasks_workspace_idx on public.tasks(workspace_id, status);
create index if not exists payments_workspace_idx on public.payments(workspace_id, status);
create unique index if not exists clients_workspace_legacy_idx on public.clients(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists projects_workspace_legacy_idx on public.projects(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists proposals_workspace_legacy_idx on public.proposals(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists contracts_workspace_legacy_idx on public.contracts(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists invoices_workspace_legacy_idx on public.invoices(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists tasks_workspace_legacy_idx on public.tasks(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists time_entries_workspace_legacy_idx on public.time_entries(workspace_id, legacy_id) where legacy_id is not null;
create unique index if not exists expenses_workspace_legacy_idx on public.expenses(workspace_id, legacy_id) where legacy_id is not null;

alter table public.stripe_webhook_events enable row level security;

alter table public.velora_state enable row level security;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.proposals enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.tasks enable row level security;
alter table public.time_entries enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "Users can manage owned workspaces" on public.workspaces;
create policy "Users can manage owned workspaces"
  on public.workspaces
  for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can read their workspace membership" on public.workspace_members;
create policy "Users can read their workspace membership"
  on public.workspace_members
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Owners can manage workspace members" on public.workspace_members;
create policy "Owners can manage workspace members"
  on public.workspace_members
  for all
  to authenticated
  using (
    exists (
      select 1 from public.workspaces
      where workspaces.id = workspace_members.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces
      where workspaces.id = workspace_members.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can manage owned clients" on public.clients;
create policy "Users can manage owned clients" on public.clients for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned projects" on public.projects;
create policy "Users can manage owned projects" on public.projects for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned proposals" on public.proposals;
create policy "Users can manage owned proposals" on public.proposals for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned contracts" on public.contracts;
create policy "Users can manage owned contracts" on public.contracts for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned invoices" on public.invoices;
create policy "Users can manage owned invoices" on public.invoices for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can read owned invoice items" on public.invoice_items;
create policy "Users can read owned invoice items"
  on public.invoice_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
        and invoices.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can insert owned invoice items" on public.invoice_items;
create policy "Users can insert owned invoice items"
  on public.invoice_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
        and invoices.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can update owned invoice items" on public.invoice_items;
create policy "Users can update owned invoice items"
  on public.invoice_items
  for update
  to authenticated
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
        and invoices.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
        and invoices.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can delete owned invoice items" on public.invoice_items;
create policy "Users can delete owned invoice items"
  on public.invoice_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
        and invoices.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can manage owned payments" on public.payments;
create policy "Users can manage owned payments" on public.payments for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned tasks" on public.tasks;
create policy "Users can manage owned tasks" on public.tasks for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned time entries" on public.time_entries;
create policy "Users can manage owned time entries" on public.time_entries for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can manage owned expenses" on public.expenses;
create policy "Users can manage owned expenses" on public.expenses for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Users can read their own Velora state" on public.velora_state;
create policy "Users can read their own Velora state"
  on public.velora_state
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Velora state" on public.velora_state;
create policy "Users can insert their own Velora state"
  on public.velora_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Velora state" on public.velora_state;
create policy "Users can update their own Velora state"
  on public.velora_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Velora state" on public.velora_state;
create policy "Users can delete their own Velora state"
  on public.velora_state
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_type text not null,
  business_type_other text,
  primary_goal text not null,
  primary_goal_other text,
  client_status text not null,
  team_size text not null,
  biggest_challenge text not null,
  biggest_challenge_other text,
  referral_source text not null,
  referral_source_other text,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_onboarding enable row level security;

drop policy if exists "Users can read their own onboarding" on public.user_onboarding;
create policy "Users can read their own onboarding"
  on public.user_onboarding
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own onboarding" on public.user_onboarding;
create policy "Users can insert their own onboarding"
  on public.user_onboarding
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own onboarding" on public.user_onboarding;
create policy "Users can update their own onboarding"
  on public.user_onboarding
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.portal_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  client_id text,
  project_id text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  last_viewed_at timestamptz
);

alter table public.portal_links enable row level security;

drop policy if exists "Users can read their own portal links" on public.portal_links;
create policy "Users can read their own portal links"
  on public.portal_links
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own portal links" on public.portal_links;
create policy "Users can insert their own portal links"
  on public.portal_links
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own portal links" on public.portal_links;
create policy "Users can update their own portal links"
  on public.portal_links
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own portal links" on public.portal_links;
create policy "Users can delete their own portal links"
  on public.portal_links
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.portal_token_hash(raw_token text)
returns text
language sql
stable
as $$
  select encode(extensions.digest(raw_token, 'sha256'), 'hex')
$$;

create or replace function public.portal_store_state(owner_id uuid, key text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select value->'state' from public.velora_state where user_id = owner_id and store_key = key),
    '{}'::jsonb
  )
$$;

create or replace function public.portal_add_notification(owner_id uuid, notification_type text, notification_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing jsonb;
  next_state jsonb;
begin
  existing := coalesce(
    (select value from public.velora_state where user_id = owner_id and store_key = 'velora-notifications'),
    '{"state":{"notifications":[]},"version":0}'::jsonb
  );

  next_state := jsonb_set(
    existing,
    '{state,notifications}',
    jsonb_build_array(jsonb_build_object(
      'id', floor(extract(epoch from clock_timestamp()) * 1000)::bigint,
      'type', notification_type,
      'text', notification_text,
      'time', clock_timestamp(),
      'read', false
    )) || coalesce(existing #> '{state,notifications}', '[]'::jsonb),
    true
  );

  insert into public.velora_state (user_id, store_key, value, updated_at)
  values (owner_id, 'velora-notifications', next_state, now())
  on conflict (user_id, store_key)
  do update set value = excluded.value, updated_at = excluded.updated_at;
end;
$$;

create or replace function public.get_portal_payload(raw_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  link_row public.portal_links%rowtype;
  settings jsonb;
  clients jsonb;
  projects jsonb;
  invoices jsonb;
  files jsonb;
  messages jsonb;
  tasks jsonb;
  proposals jsonb;
  contracts jsonb;
  client_obj jsonb := null;
  project_obj jsonb := null;
  client_name text := null;
  project_name text := null;
begin
  if raw_token is null or length(raw_token) < 24 then
    return jsonb_build_object('error', 'missing_token');
  end if;

  select *
    into link_row
  from public.portal_links
  where token_hash = public.portal_token_hash(raw_token)
    and status = 'active'
    and (expires_at is null or expires_at > now())
  limit 1;

  if not found then
    return jsonb_build_object('error', 'invalid_or_expired');
  end if;

  update public.portal_links
  set last_viewed_at = now()
  where id = link_row.id;

  settings := public.portal_store_state(link_row.user_id, 'velora-settings');
  clients := coalesce(public.portal_store_state(link_row.user_id, 'velora-clients')->'clients', '[]'::jsonb);
  projects := coalesce(public.portal_store_state(link_row.user_id, 'velora-projects')->'projects', '[]'::jsonb);
  invoices := coalesce(public.portal_store_state(link_row.user_id, 'velora-invoices')->'invoices', '[]'::jsonb);
  files := coalesce(public.portal_store_state(link_row.user_id, 'velora-files')->'files', '[]'::jsonb);
  messages := coalesce(public.portal_store_state(link_row.user_id, 'velora-messages')->'conversations', '[]'::jsonb);
  tasks := coalesce(public.portal_store_state(link_row.user_id, 'velora-tasks')->'tasks', '[]'::jsonb);
  proposals := coalesce(public.portal_store_state(link_row.user_id, 'velora-proposals')->'proposals', '[]'::jsonb);
  contracts := coalesce(public.portal_store_state(link_row.user_id, 'velora-contracts')->'contracts', '[]'::jsonb);

  if link_row.client_id is not null then
    select value into client_obj from jsonb_array_elements(clients)
    where value->>'id' = link_row.client_id
    limit 1;
  end if;

  if link_row.project_id is not null then
    select value into project_obj from jsonb_array_elements(projects)
    where value->>'id' = link_row.project_id
    limit 1;
  end if;

  if client_obj is null and project_obj is not null and project_obj->>'clientId' is not null then
    select value into client_obj from jsonb_array_elements(clients)
    where value->>'id' = project_obj->>'clientId'
    limit 1;
  end if;

  client_name := coalesce(client_obj->>'name', project_obj->>'client');
  project_name := project_obj->>'name';

  return jsonb_build_object(
    'link', jsonb_build_object(
      'id', link_row.id,
      'client_id', link_row.client_id,
      'project_id', link_row.project_id,
      'expires_at', link_row.expires_at
    ),
    'freelancer', jsonb_build_object(
      'name', coalesce(nullif(settings #>> '{branding,businessName}', ''), trim(coalesce(settings #>> '{account,firstName}', '') || ' ' || coalesce(settings #>> '{account,lastName}', '')), 'Freelancer'),
      'email', coalesce(settings #>> '{account,email}', ''),
      'brand_color', coalesce(nullif(settings #>> '{branding,brandColor}', ''), '#a98252'),
      'logo', settings #> '{branding,logo}'
    ),
    'client', client_obj,
    'project', project_obj,
    'invoices', (
      select coalesce(jsonb_agg(value), '[]'::jsonb)
      from jsonb_array_elements(invoices)
      where (link_row.client_id is null or value->>'clientId' = link_row.client_id or value->>'client' = client_name)
        and (link_row.project_id is null or value->>'projectId' = link_row.project_id or value->>'project' = project_name)
        and value->>'status' <> 'draft'
    ),
    'files', (
      select coalesce(jsonb_agg(value), '[]'::jsonb)
      from jsonb_array_elements(files)
      where (link_row.client_id is null or value->>'clientId' = link_row.client_id or value->>'client' = client_name)
        and (link_row.project_id is null or value->>'projectId' = link_row.project_id or value->>'project' = project_name)
    ),
    'messages', (
      select coalesce(jsonb_agg(value), '[]'::jsonb)
      from jsonb_array_elements(messages)
      where (link_row.client_id is null or value->>'clientId' = link_row.client_id or value->>'client' = client_name)
        and (link_row.project_id is null or value->>'projectId' = link_row.project_id or value->>'project' = project_name)
    ),
    'tasks', (
      select coalesce(jsonb_agg(value), '[]'::jsonb)
      from jsonb_array_elements(tasks)
      where coalesce((value->>'portal_visible')::boolean, false)
        and (link_row.project_id is null or value->>'projectId' = link_row.project_id or value->>'project' = project_name)
    ),
    'proposals', (
      select coalesce(jsonb_agg(value), '[]'::jsonb)
      from jsonb_array_elements(proposals)
      where (link_row.client_id is null or value->>'clientId' = link_row.client_id or value->>'client' = client_name)
        and (link_row.project_id is null or value->>'projectId' = link_row.project_id or value->>'project' = project_name)
        and value->>'status' <> 'draft'
    ),
    'contracts', (
      select coalesce(jsonb_agg(value), '[]'::jsonb)
      from jsonb_array_elements(contracts)
      where (link_row.client_id is null or value->>'clientId' = link_row.client_id or value->>'client' = client_name)
        and (link_row.project_id is null or value->>'projectId' = link_row.project_id or value->>'project' = project_name)
        and value->>'status' <> 'draft'
    )
  );
end;
$$;

create or replace function public.portal_accept_proposal(raw_token text, proposal_id text, decision text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  owner_id uuid;
  store jsonb;
  next_items jsonb;
begin
  payload := public.get_portal_payload(raw_token);
  if payload ? 'error' then return payload; end if;

  select user_id into owner_id from public.portal_links where id = (payload #>> '{link,id}')::uuid;
  store := coalesce((select value from public.velora_state where user_id = owner_id and store_key = 'velora-proposals'), '{"state":{"proposals":[]},"version":0}'::jsonb);

  select jsonb_agg(
    case when value->>'id' = proposal_id
      then value || jsonb_build_object('status', case when decision = 'accepted' then 'accepted' else 'declined' end, 'responded_at', clock_timestamp())
      else value
    end
  ) into next_items
  from jsonb_array_elements(coalesce(store #> '{state,proposals}', '[]'::jsonb));

  insert into public.velora_state (user_id, store_key, value, updated_at)
  values (owner_id, 'velora-proposals', jsonb_set(store, '{state,proposals}', coalesce(next_items, '[]'::jsonb), true), now())
  on conflict (user_id, store_key) do update set value = excluded.value, updated_at = excluded.updated_at;

  perform public.portal_add_notification(owner_id, 'proposal', 'Client ' || decision || ' a proposal');
  return public.get_portal_payload(raw_token);
end;
$$;

create or replace function public.portal_sign_contract(raw_token text, contract_id text, signer_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  owner_id uuid;
  store jsonb;
  next_items jsonb;
begin
  payload := public.get_portal_payload(raw_token);
  if payload ? 'error' then return payload; end if;
  if signer_name is null or length(trim(signer_name)) < 2 then
    return jsonb_build_object('error', 'missing_signature');
  end if;

  select user_id into owner_id from public.portal_links where id = (payload #>> '{link,id}')::uuid;
  store := coalesce((select value from public.velora_state where user_id = owner_id and store_key = 'velora-contracts'), '{"state":{"contracts":[]},"version":0}'::jsonb);

  select jsonb_agg(
    case when value->>'id' = contract_id
      then value || jsonb_build_object('status', 'signed', 'signed_at', clock_timestamp(), 'signer_name', trim(signer_name))
      else value
    end
  ) into next_items
  from jsonb_array_elements(coalesce(store #> '{state,contracts}', '[]'::jsonb));

  insert into public.velora_state (user_id, store_key, value, updated_at)
  values (owner_id, 'velora-contracts', jsonb_set(store, '{state,contracts}', coalesce(next_items, '[]'::jsonb), true), now())
  on conflict (user_id, store_key) do update set value = excluded.value, updated_at = excluded.updated_at;

  perform public.portal_add_notification(owner_id, 'contract', 'Contract signed by ' || trim(signer_name));
  return public.get_portal_payload(raw_token);
end;
$$;

create or replace function public.portal_send_message(raw_token text, message_text text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  owner_id uuid;
  store jsonb;
  conversations jsonb;
  next_conversations jsonb;
  link_client_id text;
  link_project_id text;
  client_name text;
  project_name text;
begin
  payload := public.get_portal_payload(raw_token);
  if payload ? 'error' then return payload; end if;
  if message_text is null or length(trim(message_text)) = 0 then
    return payload;
  end if;

  select user_id, client_id, project_id into owner_id, link_client_id, link_project_id
  from public.portal_links where id = (payload #>> '{link,id}')::uuid;

  client_name := payload #>> '{client,name}';
  project_name := payload #>> '{project,name}';
  store := coalesce((select value from public.velora_state where user_id = owner_id and store_key = 'velora-messages'), '{"state":{"conversations":[]},"version":0}'::jsonb);
  conversations := coalesce(store #> '{state,conversations}', '[]'::jsonb);

  if exists (
    select 1 from jsonb_array_elements(conversations)
    where (link_client_id is null or value->>'clientId' = link_client_id or value->>'client' = client_name)
      and (link_project_id is null or value->>'projectId' = link_project_id or value->>'project' = project_name)
  ) then
    select jsonb_agg(
      case when (link_client_id is null or value->>'clientId' = link_client_id or value->>'client' = client_name)
          and (link_project_id is null or value->>'projectId' = link_project_id or value->>'project' = project_name)
        then value
          || jsonb_build_object('unread', coalesce((value->>'unread')::int, 0) + 1)
          || jsonb_build_object('messages', coalesce(value->'messages', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
            'id', floor(extract(epoch from clock_timestamp()) * 1000)::bigint,
            'from', 'client',
            'text', trim(message_text),
            'time', clock_timestamp()
          )))
        else value
      end
    ) into next_conversations
    from jsonb_array_elements(conversations);
  else
    next_conversations := jsonb_build_array(jsonb_build_object(
      'id', floor(extract(epoch from clock_timestamp()) * 1000)::bigint,
      'clientId', link_client_id,
      'projectId', link_project_id,
      'client', client_name,
      'project', project_name,
      'avatar', upper(left(coalesce(client_name, 'C'), 1)),
      'color', coalesce(payload #>> '{freelancer,brand_color}', '#a98252'),
      'unread', 1,
      'messages', jsonb_build_array(jsonb_build_object(
        'id', floor(extract(epoch from clock_timestamp()) * 1000)::bigint,
        'from', 'client',
        'text', trim(message_text),
        'time', clock_timestamp()
      ))
    )) || conversations;
  end if;

  insert into public.velora_state (user_id, store_key, value, updated_at)
  values (owner_id, 'velora-messages', jsonb_set(store, '{state,conversations}', next_conversations, true), now())
  on conflict (user_id, store_key) do update set value = excluded.value, updated_at = excluded.updated_at;

  perform public.portal_add_notification(owner_id, 'client', 'New portal message from ' || coalesce(client_name, 'a client'));
  return public.get_portal_payload(raw_token);
end;
$$;

create or replace function public.public_form_payload(owner_id uuid, form_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  store jsonb;
  form_obj jsonb;
begin
  store := coalesce(
    (select value from public.velora_state where user_id = owner_id and store_key = 'velora-forms'),
    '{"state":{"forms":[]}}'::jsonb
  );

  select value into form_obj
  from jsonb_array_elements(coalesce(store #> '{state,forms}', '[]'::jsonb))
  where value->>'id' = form_id
    and coalesce(value->>'status', 'draft') = 'active'
  limit 1;

  if form_obj is null then
    return jsonb_build_object('error', 'not_found');
  end if;

  return jsonb_build_object(
    'id', form_obj->>'id',
    'name', form_obj->>'name',
    'fields', coalesce(form_obj->'fields', '[]'::jsonb)
  );
end;
$$;

create or replace function public.public_submit_form(owner_id uuid, form_id text, response_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  store jsonb;
  next_forms jsonb;
  form_exists boolean;
begin
  if response_data is null or jsonb_typeof(response_data) <> 'object' then
    return jsonb_build_object('error', 'invalid_response');
  end if;

  store := coalesce(
    (select value from public.velora_state where user_id = owner_id and store_key = 'velora-forms'),
    '{"state":{"forms":[]},"version":0}'::jsonb
  );

  select exists (
    select 1
    from jsonb_array_elements(coalesce(store #> '{state,forms}', '[]'::jsonb))
    where value->>'id' = form_id
      and coalesce(value->>'status', 'draft') = 'active'
  ) into form_exists;

  if not form_exists then
    return jsonb_build_object('error', 'not_found');
  end if;

  select jsonb_agg(
    case when value->>'id' = form_id
      then value || jsonb_build_object(
        'submissions',
        coalesce(value->'submissions', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
          'id', floor(extract(epoch from clock_timestamp()) * 1000)::bigint,
          'data', response_data,
          'submittedAt', clock_timestamp()
        ))
      )
      else value
    end
  ) into next_forms
  from jsonb_array_elements(coalesce(store #> '{state,forms}', '[]'::jsonb));

  insert into public.velora_state (user_id, store_key, value, updated_at)
  values (owner_id, 'velora-forms', jsonb_set(store, '{state,forms}', coalesce(next_forms, '[]'::jsonb), true), now())
  on conflict (user_id, store_key) do update set value = excluded.value, updated_at = excluded.updated_at;

  perform public.portal_add_notification(owner_id, 'client', 'New public form submission');
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.get_portal_payload(text) to anon, authenticated;
grant execute on function public.portal_accept_proposal(text, text, text) to anon, authenticated;
grant execute on function public.portal_sign_contract(text, text, text) to anon, authenticated;
grant execute on function public.portal_send_message(text, text) to anon, authenticated;
grant execute on function public.public_form_payload(uuid, text) to anon, authenticated;
grant execute on function public.public_submit_form(uuid, text, jsonb) to anon, authenticated;

-- ─── LEGACY STATE MIGRATION ───────────────────────────────────────────────
-- Migrates current velora_state JSON stores into normalized production tables.
-- Idempotent through (workspace_id, legacy_id) indexes.

create or replace function public.migrate_velora_state_to_tables(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_workspace_id uuid;
  settings_state jsonb;
  clients_state jsonb;
  projects_state jsonb;
  proposals_state jsonb;
  contracts_state jsonb;
  invoices_state jsonb;
  tasks_state jsonb;
  time_state jsonb;
  expenses_state jsonb;
  item jsonb;
  inserted_counts jsonb := '{}'::jsonb;
  client_uuid uuid;
  project_uuid uuid;
  proposal_uuid uuid;
  contract_uuid uuid;
  invoice_uuid uuid;
begin
  if target_user_id is null then
    return jsonb_build_object('error', 'missing_user');
  end if;

  settings_state := public.portal_store_state(target_user_id, 'velora-settings');

  insert into public.workspaces (owner_id, name, currency, language, timezone)
  values (
    target_user_id,
    coalesce(nullif(settings_state #>> '{branding,businessName}', ''), 'My workspace'),
    coalesce(nullif(settings_state #>> '{preferences,currency}', ''), 'EUR'),
    coalesce(nullif(settings_state #>> '{preferences,language}', ''), 'en'),
    coalesce(nullif(settings_state #>> '{preferences,timezone}', ''), 'Europe/Lisbon')
  )
  on conflict do nothing;

  select id into target_workspace_id
  from public.workspaces
  where owner_id = target_user_id
  order by created_at asc
  limit 1;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (target_workspace_id, target_user_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;

  clients_state := public.portal_store_state(target_user_id, 'velora-clients');
  for item in select value from jsonb_array_elements(coalesce(clients_state->'clients', '[]'::jsonb))
  loop
    insert into public.clients (
      legacy_id, workspace_id, owner_id, name, email, phone, company, website, tax_id, tags, notes, status, created_at
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      coalesce(nullif(item->>'name', ''), 'Unnamed client'),
      nullif(item->>'email', ''),
      nullif(item->>'phone', ''),
      nullif(item->>'company', ''),
      nullif(item->>'website', ''),
      nullif(item->>'taxId', ''),
      coalesce(array(select jsonb_array_elements_text(coalesce(item->'tags', '[]'::jsonb))), '{}'),
      nullif(item->>'notes', ''),
      case when item->>'status' = 'archived' then 'archived' else 'active' end,
      coalesce((item->>'createdAt')::date::timestamptz, now())
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        company = excluded.company,
        website = excluded.website,
        tax_id = excluded.tax_id,
        tags = excluded.tags,
        notes = excluded.notes,
        status = excluded.status,
        updated_at = now();
  end loop;

  projects_state := public.portal_store_state(target_user_id, 'velora-projects');
  for item in select value from jsonb_array_elements(coalesce(projects_state->'projects', '[]'::jsonb))
  loop
    select id into client_uuid
    from public.clients
    where workspace_id = target_workspace_id
      and (legacy_id = item->>'clientId' or name = item->>'client')
    limit 1;

    insert into public.projects (
      legacy_id, workspace_id, owner_id, client_id, name, description, status, priority, budget, deadline, progress
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      client_uuid,
      coalesce(nullif(item->>'name', ''), 'Untitled project'),
      nullif(item->>'description', ''),
      coalesce(nullif(item->>'status', ''), 'lead'),
      coalesce(nullif(item->>'priority', ''), 'medium'),
      nullif(item->>'budget', '')::numeric,
      nullif(item->>'deadline', '')::date,
      coalesce(nullif(item->>'progress', '')::int, 0)
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set client_id = excluded.client_id,
        name = excluded.name,
        description = excluded.description,
        status = excluded.status,
        priority = excluded.priority,
        budget = excluded.budget,
        deadline = excluded.deadline,
        progress = excluded.progress,
        updated_at = now();
  end loop;

  proposals_state := public.portal_store_state(target_user_id, 'velora-proposals');
  for item in select value from jsonb_array_elements(coalesce(proposals_state->'proposals', '[]'::jsonb))
  loop
    select id into client_uuid from public.clients where workspace_id = target_workspace_id and (legacy_id = item->>'clientId' or name = item->>'client') limit 1;
    select id into project_uuid from public.projects where workspace_id = target_workspace_id and (legacy_id = item->>'projectId' or name = item->>'project') limit 1;

    insert into public.proposals (
      legacy_id, workspace_id, owner_id, client_id, project_id, title, status, subtotal, discount, tax, total, content, valid_until, sent_at, viewed_at, responded_at
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      client_uuid,
      project_uuid,
      coalesce(nullif(item->>'title', ''), nullif(item->>'name', ''), 'Proposal'),
      coalesce(nullif(item->>'status', ''), 'draft'),
      coalesce(nullif(item->>'subtotal', '')::numeric, 0),
      coalesce(nullif(item->>'discount', '')::numeric, 0),
      coalesce(nullif(item->>'tax', '')::numeric, 0),
      coalesce(nullif(item->>'total', '')::numeric, 0),
      item,
      nullif(item->>'validUntil', '')::date,
      nullif(item->>'sent_at', '')::timestamptz,
      nullif(item->>'viewed_at', '')::timestamptz,
      nullif(item->>'responded_at', '')::timestamptz
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set status = excluded.status,
        total = excluded.total,
        content = excluded.content,
        updated_at = now();
  end loop;

  contracts_state := public.portal_store_state(target_user_id, 'velora-contracts');
  for item in select value from jsonb_array_elements(coalesce(contracts_state->'contracts', '[]'::jsonb))
  loop
    select id into client_uuid from public.clients where workspace_id = target_workspace_id and (legacy_id = item->>'clientId' or name = item->>'client') limit 1;
    select id into project_uuid from public.projects where workspace_id = target_workspace_id and (legacy_id = item->>'projectId' or name = item->>'project') limit 1;
    select id into proposal_uuid from public.proposals where workspace_id = target_workspace_id and legacy_id = item->>'proposalId' limit 1;

    insert into public.contracts (
      legacy_id, workspace_id, owner_id, client_id, project_id, proposal_id, title, status, content, signed_at, signer_name
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      client_uuid,
      project_uuid,
      proposal_uuid,
      coalesce(nullif(item->>'title', ''), 'Contract'),
      coalesce(nullif(item->>'status', ''), 'draft'),
      nullif(item->>'content', ''),
      nullif(item->>'signed_at', '')::timestamptz,
      nullif(item->>'signer_name', '')
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set status = excluded.status,
        content = excluded.content,
        signed_at = excluded.signed_at,
        signer_name = excluded.signer_name,
        updated_at = now();
  end loop;

  invoices_state := public.portal_store_state(target_user_id, 'velora-invoices');
  for item in select value from jsonb_array_elements(coalesce(invoices_state->'invoices', '[]'::jsonb))
  loop
    select id into client_uuid from public.clients where workspace_id = target_workspace_id and (legacy_id = item->>'clientId' or name = item->>'client') limit 1;
    select id into project_uuid from public.projects where workspace_id = target_workspace_id and (legacy_id = item->>'projectId' or name = item->>'project') limit 1;
    select id into proposal_uuid from public.proposals where workspace_id = target_workspace_id and legacy_id = item->>'proposalId' limit 1;
    select id into contract_uuid from public.contracts where workspace_id = target_workspace_id and legacy_id = item->>'contractId' limit 1;

    insert into public.invoices (
      legacy_id, workspace_id, owner_id, client_id, project_id, proposal_id, contract_id, invoice_number, status,
      subtotal, discount, tax, total, issued_on, due_on, paid_at, viewed_at, stripe_checkout_session_id, stripe_payment_intent_id,
      stripe_checkout_url, notes, terms
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      client_uuid,
      project_uuid,
      proposal_uuid,
      contract_uuid,
      coalesce(nullif(item->>'number', ''), nullif(item->>'id', ''), 'INV-LEGACY'),
      coalesce(nullif(item->>'status', ''), 'draft'),
      coalesce(nullif(item->>'amount', '')::numeric, 0),
      coalesce(nullif(item->>'discount', '')::numeric, 0),
      coalesce(nullif(item->>'tax', '')::numeric, 0),
      coalesce(nullif(item->>'total', '')::numeric, nullif(item->>'amount', '')::numeric, 0),
      nullif(item->>'issued', '')::date,
      nullif(item->>'due', '')::date,
      nullif(item->>'paid', '')::date::timestamptz,
      nullif(item->>'viewed_at', '')::timestamptz,
      nullif(item->>'stripeSessionId', ''),
      nullif(item->>'stripePaymentIntentId', ''),
      nullif(item->>'stripeCheckoutUrl', ''),
      nullif(item->>'notes', ''),
      nullif(item->>'terms', '')
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set status = excluded.status,
        total = excluded.total,
        paid_at = excluded.paid_at,
        viewed_at = excluded.viewed_at,
        stripe_checkout_session_id = excluded.stripe_checkout_session_id,
        stripe_payment_intent_id = excluded.stripe_payment_intent_id,
        stripe_checkout_url = excluded.stripe_checkout_url,
        updated_at = now();
  end loop;

  tasks_state := public.portal_store_state(target_user_id, 'velora-tasks');
  for item in select value from jsonb_array_elements(coalesce(tasks_state->'tasks', '[]'::jsonb))
  loop
    select id into project_uuid from public.projects where workspace_id = target_workspace_id and (legacy_id = item->>'projectId' or name = item->>'project') limit 1;

    insert into public.tasks (
      legacy_id, workspace_id, owner_id, project_id, title, notes, status, priority, assignee, kanban_col,
      due_on, completed_at, portal_visible, subtasks, comments
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      project_uuid,
      coalesce(nullif(item->>'title', ''), 'Untitled task'),
      nullif(item->>'notes', ''),
      case when coalesce((item->>'done')::boolean, false) then 'completed' else coalesce(nullif(item->>'status', ''), 'todo') end,
      coalesce(nullif(item->>'priority', ''), 'medium'),
      nullif(item->>'assignee', ''),
      nullif(item->>'kanban_col', ''),
      nullif(item->>'due_date', '')::date,
      case when coalesce((item->>'done')::boolean, false) then now() else null end,
      coalesce((item->>'portal_visible')::boolean, false),
      coalesce(item->'subtasks', '[]'::jsonb),
      coalesce(item->'comments', '[]'::jsonb)
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set title = excluded.title,
        notes = excluded.notes,
        status = excluded.status,
        priority = excluded.priority,
        assignee = excluded.assignee,
        kanban_col = excluded.kanban_col,
        due_on = excluded.due_on,
        portal_visible = excluded.portal_visible,
        subtasks = excluded.subtasks,
        comments = excluded.comments,
        updated_at = now();
  end loop;

  time_state := public.portal_store_state(target_user_id, 'velora-time');
  for item in select value from jsonb_array_elements(coalesce(time_state->'entries', '[]'::jsonb))
  loop
    select id into project_uuid from public.projects where workspace_id = target_workspace_id and (legacy_id = item->>'projectId' or name = item->>'project') limit 1;

    insert into public.time_entries (
      legacy_id, workspace_id, owner_id, project_id, description, entry_date, minutes, billable, invoiced
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      project_uuid,
      nullif(item->>'task', ''),
      coalesce(nullif(item->>'date', '')::date, current_date),
      greatest(1, round(coalesce(nullif(item->>'hours', '')::numeric, 0) * 60)::int),
      coalesce((item->>'billable')::boolean, true),
      coalesce((item->>'invoiced')::boolean, false)
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set description = excluded.description,
        entry_date = excluded.entry_date,
        minutes = excluded.minutes,
        billable = excluded.billable,
        invoiced = excluded.invoiced,
        updated_at = now();
  end loop;

  expenses_state := public.portal_store_state(target_user_id, 'velora-expenses');
  for item in select value from jsonb_array_elements(coalesce(expenses_state->'expenses', '[]'::jsonb))
  loop
    select id into project_uuid from public.projects where workspace_id = target_workspace_id and (legacy_id = item->>'projectId' or name = item->>'project') limit 1;

    insert into public.expenses (
      legacy_id, workspace_id, owner_id, project_id, category, merchant, amount, expense_date, reimbursable, billable, notes
    )
    values (
      item->>'id',
      target_workspace_id,
      target_user_id,
      project_uuid,
      nullif(item->>'category', ''),
      coalesce(nullif(item->>'merchant', ''), 'Expense'),
      coalesce(nullif(item->>'amount', '')::numeric, 0),
      coalesce(nullif(item->>'date', '')::date, current_date),
      coalesce((item->>'reimbursable')::boolean, false),
      coalesce((item->>'billable')::boolean, false),
      nullif(item->>'notes', '')
    )
    on conflict (workspace_id, legacy_id) where legacy_id is not null do update
    set category = excluded.category,
        merchant = excluded.merchant,
        amount = excluded.amount,
        expense_date = excluded.expense_date,
        reimbursable = excluded.reimbursable,
        billable = excluded.billable,
        notes = excluded.notes,
        updated_at = now();
  end loop;

  inserted_counts := jsonb_build_object(
    'workspace_id', target_workspace_id,
    'clients', (select count(*) from public.clients where workspace_id = target_workspace_id),
    'projects', (select count(*) from public.projects where workspace_id = target_workspace_id),
    'proposals', (select count(*) from public.proposals where workspace_id = target_workspace_id),
    'contracts', (select count(*) from public.contracts where workspace_id = target_workspace_id),
    'invoices', (select count(*) from public.invoices where workspace_id = target_workspace_id),
    'tasks', (select count(*) from public.tasks where workspace_id = target_workspace_id),
    'time_entries', (select count(*) from public.time_entries where workspace_id = target_workspace_id),
    'expenses', (select count(*) from public.expenses where workspace_id = target_workspace_id)
  );

  return inserted_counts;
end;
$$;

grant execute on function public.migrate_velora_state_to_tables(uuid) to authenticated;

-- ─── STORAGE BUCKET ────────────────────────────────────────────────────────
-- Run this once in Supabase SQL editor to create the files storage bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'velora-files',
  'velora-files',
  false,
  52428800, -- 50 MB per file
  null       -- allow all mime types
)
on conflict (id) do nothing;

update storage.buckets
set public = false
where id = 'velora-files';

-- RLS policies for the storage bucket
drop policy if exists "Authenticated users can upload their own files" on storage.objects;
create policy "Authenticated users can upload their own files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'velora-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can read their own files" on storage.objects;
create policy "Authenticated users can read their own files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'velora-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can delete their own files" on storage.objects;
create policy "Authenticated users can delete their own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'velora-files' and (storage.foldername(name))[1] = auth.uid()::text);
