## Supabase schema (production checklist)

Portal links rely on server-side hashing via `pgcrypto` (`digest`) inside `get_portal_payload()`.
If `pgcrypto` is missing, portal links can fail even when the frontend looks fine.

### Apply schema

1. Open your Supabase project dashboard → **SQL Editor**
2. Run `freelanceportal/supabase/schema.sql` (idempotent)

### Verify pgcrypto + portal token hashing

Run this in the SQL editor:

```sql
select extensions.digest('healthcheck', 'sha256') is not null as pgcrypto_ok;
select public.portal_token_hash('healthcheck-token') as token_hash;
```

If either fails, re-run the `pgcrypto` section in `schema.sql` (or run `fix_pgcrypto.sql`).

