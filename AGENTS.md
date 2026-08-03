# AGENTS.md

## Project Context

Internal CRM/admin app for Orisa Digital. React + Vite frontend backed by
Supabase (Postgres, Auth, Storage, pg_cron). Formerly a Base44 app — fully
migrated off Base44; the `base44/` folder is kept only as reference for the
original entity schemas and functions.

## Architecture

- Frontend: React 18 + Vite + Tailwind + shadcn/ui, deployed to Cloudflare Pages.
- Backend: Supabase — schema lives in `supabase/migrations/` (run in the
  Supabase SQL editor).
- `src/api/supabaseClient.js`: the raw Supabase client (env-driven).
- `src/api/base44Client.js`: Base44-compatible adapter (`base44.entities.X`,
  `base44.auth.*`, `base44.integrations.*`) backed by Supabase — pages call
  this; prefer extending the adapter over scattering raw Supabase calls.
- Roles: `profiles.role` ('admin' | 'user'), auto-created on signup by DB
  trigger. Role changes happen in SQL/dashboard only (no API path on purpose).
- Scheduled jobs: `auto_renew_assets()` and `renewal_reminders()` Postgres
  functions, scheduled with pg_cron (see migration).

## Environment

`.env` (never commit; see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Working Notes

- `npm run dev` for local development; `npm run build` outputs `dist/` for
  Cloudflare Pages (SPA fallback via `public/_redirects`).
- Date-like columns are `text` on purpose: monthly renewals are stored as
  "MM-DD", other dates as "YYYY-MM-DD". Entity ids are text (Base44 legacy
  ids coexist with new UUID strings).
- Run `npm run lint` before finishing code changes.
