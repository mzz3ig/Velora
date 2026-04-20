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
