# Dominion College — Supabase PostgreSQL Architecture (`PHASE 2 & 3`)

**Date:** 2026-11-14  
**Target Provider:** Supabase Managed PostgreSQL  
**Deployment Target:** Vercel Serverless / Node.js Runtime  
**Driver:** `postgres` (Postgres.js)

---

## 1. Architecture Overview

```
Browser (Public & /admin UI)
   │ HTTPS / JSON / Next.js Server Components
   ▼
Next.js 14 App Router (Vercel Node.js Runtime)
   ├── src/app/**/page.tsx (Server Components)
   ├── src/app/api/v1/** (Route Handlers)
   └── src/server/auth/session.ts (HMAC Cookie + CSRF + Active Admin DB Check)
          │
          ▼
src/server/services/cms-service.ts (Async Domain & Validation Layer)
          │
          ▼
src/server/db/repositories/*.repository.ts (Parameterized Postgres.js Queries)
          │
          ▼
src/server/db/client.ts (Singleton Postgres.js Pool: prepare: false, ssl: require, max: 1..5)
          │
          ▼
Supabase PostgreSQL (Transaction Pooler :6543 / Direct :5432)
```

---

## 2. Connection Management (`src/server/db/client.ts` & `src/server/db/config.ts`)

1. **Single Connection String (`DATABASE_URL`):**
   - Server-only. Never imported in Client Components or prefixed with `NEXT_PUBLIC_`.
   - Missing `DATABASE_URL` throws an actionable error at query/startup boundary without leaking credentials.
2. **Supabase Transaction Pooler Compatibility (Vercel Serverless):**
   - `prepare: false` disables unnamed/named prepared statements incompatible with PgBouncer transaction pooling (port `6543`).
   - `ssl: 'require'` (or `'prefer'` only when explicitly connecting to `localhost` / `127.0.0.1` for local PostgreSQL testing).
   - `max`: `1` in serverless production (`NODE_ENV=production`) to avoid exhausting Supabase connection slots across concurrent Vercel lambdas; `5` in local dev/scripts.
   - `idle_timeout: 20`, `connect_timeout: 15`.
3. **Global Singleton Caching:**
   - Caches the `postgres.Sql` instance on `globalThis` across Next.js hot-reloads in development and warm serverless invocations in production.
4. **No Supabase Client SDK for Privileged Server DB:**
   - Uses direct PostgreSQL (`postgres`) over TLS rather than `@supabase/supabase-js` or Supabase Auth, preserving custom `scrypt` + HMAC-SHA256 + CSRF authentication per `ADR-003` and `AGENTS.md`.

---

## 3. Implementation Sequence

1. **Phase 1:** Audit (`sqlite-audit.md`) — completed.
2. **Phase 2–3:** Documentation & DB scaffold (`postgres-architecture.md`, `schema-mapping.md`, `migration-plan.md`, `src/server/db/config.ts`, `src/server/db/client.ts`, `src/server/db/types.ts`).
3. **Phase 4:** SQL schema & migration runner (`src/server/db/migrations/001_initial_schema.sql`, `src/server/db/migrations/index.ts`).
4. **Phase 5:** Async repositories (`admin`, `settings`, `admissions`, `news`, `gallery`) & async `src/server/services/cms-service.ts`.
5. **Phase 6:** Async auth & session verification (`src/server/auth/session.ts`, all `src/app/**` & `src/app/api/**` callers).
6. **Phase 7:** Idempotent PostgreSQL seed (`src/server/db/seed-data.ts`) with production bootstrap guardrails.
7. **Phase 8:** Backup & SQLite-to-PostgreSQL migration scripts (`scripts/backup-sqlite.ts`, `scripts/migrate-sqlite-data.ts`, `scripts/migrate-postgres.ts`, `scripts/verify-postgres.ts`).
8. **Phase 9–12:** Refactor tests (`tests/database/*.test.ts`, `tests/cms-and-security.test.ts`), remove `node:sqlite` from `src/` & `next.config.mjs`, update `.env.example` & `package.json`, verify `typecheck`, `test`, `build`, and write `testing-report.md` & `deployment-guide.md`.
