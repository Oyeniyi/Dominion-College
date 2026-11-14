# Dominion College — PostgreSQL Migration Plan

## Phases & Milestones

1. **Audit (`docs/database-migration/sqlite-audit.md`)**: Inventory all `node:sqlite` imports, queries, tables, constraints, auth flows, and callers.
2. **Driver & DB Layer (`src/server/db/`)**:
   - Install `postgres` (Postgres.js) and configure `src/server/db/config.ts` and `src/server/db/client.ts` (`DATABASE_URL`, `prepare: false`, SSL, conservative pooling).
   - Create `src/server/db/migrations/001_initial_schema.sql` and `src/server/db/migrations/index.ts`.
   - Create domain-aligned repositories under `src/server/db/repositories/`.
3. **Async Service & Auth Refactor**:
   - Refactor `src/server/services/cms-service.ts` to async repository/SQL calls.
   - Refactor `src/server/auth/session.ts` (`requireAuthenticatedAdminFromRequest`, `getServerComponentAdminSession`) to `async`.
   - Update all API routes under `src/app/api/v1/**` and Server Components under `src/app/**` to `await` auth and service calls.
4. **Idempotent Seeding & Data Transfer**:
   - Update `src/server/db/seed-data.ts` for PostgreSQL (`ON CONFLICT DO NOTHING` / conditional singleton seed, production bootstrap guardrails).
   - Create `scripts/backup-sqlite.ts`, `scripts/migrate-postgres.ts`, `scripts/migrate-sqlite-data.ts`, and `scripts/verify-postgres.ts`.
5. **Cleanup, Testing & Verification**:
   - Remove `node:sqlite` imports, `src/types/node-sqlite.d.ts`, and `next.config.mjs` `node:sqlite` externalization.
   - Refactor tests for PostgreSQL + isolated unit tests.
   - Run `npm run typecheck`, `npm test`, `npm run build`, and record results in `docs/database-migration/testing-report.md`.
