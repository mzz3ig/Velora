# Deployment (single Vercel project)

This repo ships the Vite frontend (`freelanceportal/`) and the Express API (`server/`) in **one Vercel project**.

## How routing works

- `vercel.json` builds the frontend to `freelanceportal/dist`
- API routes are rewritten to the serverless function at `api/index.js`, which mounts the Express app from `server/`

These paths are handled by the backend:

- `/health`
- `/admin/*`
- `/stripe/*`
- `/portal/*`
- `/public/*`

Everything else is rewritten to the frontend SPA `index.html`.

## Environment variables (Vercel)

### Frontend (Vite build-time)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL` (prototype only)
- `VITE_API_URL` (optional)
  - **Local dev:** set to `http://localhost:4000`
  - **Production:** can be omitted (frontend uses same-origin + Vercel rewrites)

### Backend (runtime)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL` (e.g. `https://veloraworkspace.vercel.app`)
- `FRONTEND_URLS` (optional comma-separated allowlist)
- `ADMIN_EMAILS` (comma-separated allowlist for `/admin/*`)

## Quick sanity checks

- Frontend: open the app and confirm there are no `localhost:4000` requests in the Network tab.
- Backend: open `/health?deep=1` and confirm `ok: true`.

