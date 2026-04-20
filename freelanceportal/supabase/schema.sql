create table if not exists public.velora_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  store_key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key)
);

alter table public.velora_state enable row level security;

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

create extension if not exists pgcrypto;

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
  select encode(digest(raw_token, 'sha256'), 'hex')
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

grant execute on function public.get_portal_payload(text) to anon, authenticated;
grant execute on function public.portal_accept_proposal(text, text, text) to anon, authenticated;
grant execute on function public.portal_sign_contract(text, text, text) to anon, authenticated;
grant execute on function public.portal_send_message(text, text) to anon, authenticated;
