create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.portal_token_hash(raw_token text)
returns text
language sql
stable
as $$
  select encode(extensions.digest(raw_token, 'sha256'), 'hex')
$$;

