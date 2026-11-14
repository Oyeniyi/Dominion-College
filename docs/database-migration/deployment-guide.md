# Supabase & Vercel Deployment Guide — Dominion College

This guide documents how to deploy the migrated **Dominion College** Next.js 14 application on **Vercel** connected to **Supabase PostgreSQL**.

## 1. Supabase PostgreSQL Setup

1. Create a new project in [Supabase](https://supabase.com) (choose a region close to Nigeria/West Africa, e.g., `eu-west-1` or `eu-central-1`).
2. Navigate to **Project Settings → Database → Connection string**.
3. Collect two connection strings:
   - **Transaction Pooler (Port `6543`, `?pgbouncer=true`)** — Use this for `DATABASE_URL` in **Vercel** serverless runtime.
   - **Session Pooler (Port `5432`) or Direct Connection** — Recommended for running one-off CLI migrations (`npm run db:migrate`, `npm run db:seed`, `npm run db:migrate-data`).

> **Note:** The application's Postgres.js client (`src/server/db/config.ts`) automatically sets `prepare: false` (required for Supabase Transaction Pooler / PgBouncer), `ssl: 'require'` for remote hosts, and `max: 1` in production serverless environments.

## 2. Environment Variables (Vercel & Local)

Configure the following environment variables in **Vercel → Project Settings → Environment Variables** (Production, Preview, and Development as appropriate):

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production` on Vercel Production. |
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string (`?pgbouncer=true` on port `6543` for Vercel runtime). |
| `SESSION_SECRET` | Yes | Cryptographically random secret (>= 32 characters) for signing `HttpOnly` admin session cookies. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical public URL (e.g., `https://dominioncollege.edu.ng`). |
| `SCHOOL_TIMEZONE` | Recommended | `Africa/Lagos` |
| `BOOTSTRAP_ADMIN_EMAIL` | Optional | Initial admin email used only when running `npm run db:seed` on an empty database in production. |
| `BOOTSTRAP_ADMIN_PASSWORD` | Optional | Strong initial admin password (>= 12 chars) used only when running `npm run db:seed` on an empty database in production. |
| `BOOTSTRAP_ADMIN_NAME` | Optional | Display name for the initial admin account. |

Never commit `.env`, `.env.local`, or real `DATABASE_URL` / `SESSION_SECRET` values to Git.

## 3. Running Migrations, Seeding & Verification

From a trusted workstation or CI runner with `DATABASE_URL` pointing to your Supabase database (prefer Session Pooler / Direct URL for DDL):

```bash
# 1. Apply PostgreSQL schema migrations (001_initial_schema.sql)
npm run db:migrate

# 2. Seed default institutional settings, sample public content, and initial admin (if empty)
npm run db:seed

# 3. Verify all 7 tables, indexes, and row counts
npm run db:verify
```

### Migrating Existing SQLite Data (If Applicable)

If you have an existing `./data/dominion_college.sqlite` file with production data:

```bash
# 1. Create a timestamped backup of the SQLite database
npm run db:backup-sqlite

# 2. Migrate all rows into Supabase PostgreSQL inside a single transaction
npm run db:migrate-data

# 3. Verify row counts in PostgreSQL
npm run db:verify
```

## 4. Vercel Deployment Checklist

- [ ] `DATABASE_URL` configured in Vercel using Supabase Transaction Pooler (`:6543`, `?pgbouncer=true`).
- [ ] `SESSION_SECRET` configured (>= 32 random characters).
- [ ] `NEXT_PUBLIC_SITE_URL` configured to production domain.
- [ ] `npm run db:migrate` and `npm run db:seed` (or `npm run db:migrate-data`) executed successfully against Supabase.
- [ ] `npm run db:verify` confirmed all 7 tables (`schema_migrations`, `admin_user`, `gallery_album`, `gallery_image`, `news_article`, `admissions_enquiry`, `site_settings`) exist.
- [ ] Build command on Vercel: `npm run build` (no `node:sqlite` dependency).
- [ ] Verify `/`, `/about`, `/academics`, `/admissions`, `/news`, `/gallery`, `/contact`, `/privacy`, `/admin`, and `/api/v1/public/settings` after deployment.
- [ ] Rotate any temporary `BOOTSTRAP_ADMIN_PASSWORD` after first login via the Admin Staff Portal (`/admin/staff`).
