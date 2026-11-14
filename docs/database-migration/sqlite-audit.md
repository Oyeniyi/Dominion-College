# Dominion College — SQLite Repository Audit (`PHASE 1`)

**Date:** 2026-11-14  
**Scope:** Full repository audit of SQLite (`node:sqlite`) usage prior to Supabase PostgreSQL migration.  
**Authority:** [`../../prd.md`](../../prd.md), [`../database-schema.md`](../database-schema.md), [`../decisions/ADR-002-postgresql-data-platform.md`](../decisions/ADR-002-postgresql-data-platform.md).

---

## 1. Current Database Architecture

The application currently uses Node.js 24's built-in synchronous SQLite module (`node:sqlite`, `DatabaseSync`) managed by `src/server/db/client.ts`.

- **Connection model:** Singleton `activeDb: DatabaseSync | null` keyed by `config.databasePath` (default `./data/dominion_college.sqlite` in dev/prod, `:memory:` in test).
- **Initialization:** On first call to `getDatabase()`, the client opens the SQLite file (creating `./data` if absent), runs `PRAGMA foreign_keys = ON` and `PRAGMA journal_mode = WAL`, executes `runMigrations(db)` synchronously, and executes `seedInitialDataIfEmpty(db)` synchronously.
- **Execution style:** 100% synchronous (`db.prepare(...).get()`, `.all()`, `.run()`, `db.exec('BEGIN'/'COMMIT'/'ROLLBACK')`).
- **Why incompatible with Vercel:** Vercel serverless/edge functions have ephemeral read-only filesystems (except `/tmp`) and scale horizontally across isolated containers. Local SQLite files do not persist across deployments or share state across serverless invocations.

---

## 2. Complete List of SQLite Dependencies & Occurrences

### 2.1 `node:sqlite` & Type Declarations
- `src/types/node-sqlite.d.ts` — Ambient TypeScript module declaration for `node:sqlite` (`DatabaseSync`, `StatementSync`).
- `src/server/db/client.ts` — `import { DatabaseSync } from 'node:sqlite'`; `new DatabaseSync(...)`.
- `src/server/db/migrations.ts` — `import type { DatabaseSync } from 'node:sqlite'`.
- `src/server/db/seed-data.ts` — `import type { DatabaseSync } from 'node:sqlite'`.
- `tests/native-sqlite.ts` — `require('node:sqlite')` helper.
- `next.config.mjs` — `webpack` externalization `{ 'node:sqlite': 'commonjs node:sqlite' }`.

### 2.2 `getDatabase()` & Synchronous Query Sites
- `src/server/services/cms-service.ts` — **All 27 exported service functions** call `getDatabase()` and execute `.prepare(...)` with `.get()`, `.all()`, or `.run()` synchronously:
  - Auth: `authenticateAdminCredentials`, `getActiveAdminUserById`
  - Public reads: `getPublicSiteSettings`, `getPublicInstitutionalContent`, `listPublishedNews`, `getPublishedNewsBySlug`, `listPublishedGalleryAlbums`, `listPublishedGalleryImages`
  - Public write: `createAdmissionsEnquiry`
  - Admin dashboard: `getAdminDashboardOverview`
  - Admin enquiries: `listAdminEnquiries`, `updateAdminEnquiryStatus`
  - Admin news: `listAdminNews`, `getAdminNewsById`, `createAdminNews`, `updateAdminNews`, `deleteAdminNews`
  - Admin gallery: `listAdminAlbums`, `createAdminAlbum`, `listAdminGalleryImages`, `uploadAdminGalleryImage`, `updateAdminGalleryImage`, `deleteAdminGalleryImage`
  - Admin settings/content: `getAdminSiteSettings`, `updateAdminSiteSettings`, `getAdminInstitutionalContent`, `updateAdminInstitutionalContent`
  - Admin staff: `listAdminUsers`, `createAdminUser`, `changeOwnAdminPassword`, `updateAdminUserAccount`

### 2.3 Callers of Database-Backed Services (Must Become `async` / `await`)
- **Server Auth (`src/server/auth/session.ts`):**
  - `requireAuthenticatedAdminFromRequest` (awaits `getActiveAdminUserById`)
  - `getServerComponentAdminSession` (awaits `getActiveAdminUserById`)
- **Public Server Pages (`src/app/**`):**
  - `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/academics/page.tsx`, `src/app/admissions/page.tsx`, `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`, `src/app/gallery/page.tsx`, `src/app/contact/page.tsx`, `src/app/privacy/page.tsx`, `src/app/not-found.tsx`, `src/app/sitemap.ts`
- **Admin Server Pages (`src/app/admin/**`):**
  - `src/app/admin/page.tsx`, `src/app/admin/enquiries/page.tsx`, `src/app/admin/news/page.tsx`, `src/app/admin/gallery/page.tsx`, `src/app/admin/settings/page.tsx`, `src/app/admin/staff/page.tsx`
- **API Route Handlers (`src/app/api/v1/**`):**
  - Public: `public/settings`, `public/content`, `public/news`, `public/news/[slug]`, `public/gallery`, `admissions-enquiries`
  - Admin: `admin/session`, `admin/dashboard`, `admin/enquiries`, `admin/enquiries/[id]`, `admin/news`, `admin/news/preview`, `admin/news/[id]`, `admin/gallery/albums`, `admin/gallery/images`, `admin/gallery/images/[id]`, `admin/settings`, `admin/content`, `admin/password`, `admin/users`, `admin/users/[id]`
- **Configuration & Tests:**
  - `src/server/config.ts` (`databasePath` / `DATABASE_PATH`)
  - `.env.example` (`DATABASE_PATH`)
  - `tests/cms-and-security.test.ts` (`process.env.DATABASE_PATH`, `resetDatabaseForTests()`)
  - `package.json` (`db:migrate`, `db:seed` scripts referencing non-existent `scripts/migrate.ts` / `scripts/seed.ts`)

---

## 3. Database Entity & Relationship Inventory

All **7** existing SQLite tables discovered in `src/server/db/migrations.ts`:

1. **`schema_migrations`**: `version` (INTEGER PK), `name` (TEXT NOT NULL), `applied_at` (TEXT -> TIMESTAMPTZ).
2. **`admin_user`**: `id` (TEXT PK), `identity_subject` (TEXT UNIQUE NOT NULL), `display_name` (TEXT NOT NULL), `email` (TEXT UNIQUE NOT NULL), `password_hash` (TEXT NOT NULL), `role_code` (TEXT CHECK `'administrator'`), `is_active` (INTEGER 0/1 -> BOOLEAN), `created_at`, `updated_at`, `last_login_at` (TIMESTAMPTZ).
3. **`gallery_album`**: `id` (TEXT PK), `title` (TEXT NOT NULL), `slug` (TEXT UNIQUE NOT NULL), `description` (TEXT), `status` (TEXT CHECK), `created_at`, `updated_at`.
4. **`gallery_image`**: `id` (TEXT PK), `album_id` (FK -> `gallery_album.id` `ON DELETE SET NULL`), `storage_key` (TEXT UNIQUE NOT NULL), `public_url` (TEXT NOT NULL), `alt_text` (TEXT NOT NULL), `caption` (TEXT), `display_order` (INTEGER CHECK >= 0), `status` (TEXT CHECK), `school_approved` (INTEGER -> BOOLEAN), `identifiable_students` (INTEGER -> BOOLEAN), `approval_reference` (TEXT), `content_status` (TEXT CHECK), `uploaded_by` (FK -> `admin_user.id` `ON DELETE RESTRICT`), `created_at`, plus child-protection `CHECK` constraints (`status <> 'published' OR school_approved = true` and `approval_reference` requirement when `identifiable_students = true`).
5. **`news_article`**: `id` (TEXT PK), `title` (TEXT NOT NULL), `slug` (TEXT UNIQUE NOT NULL), `excerpt` (TEXT), `body` (TEXT NOT NULL), `featured_image_id` (FK -> `gallery_image.id` `ON DELETE RESTRICT`), `status` (TEXT CHECK), `published_at` (TIMESTAMPTZ), `author_id` (FK -> `admin_user.id` `ON DELETE RESTRICT`), `seo_title`, `seo_description`, `created_at`, `updated_at`, plus `CHECK (status <> 'published' OR published_at IS NOT NULL)`.
6. **`admissions_enquiry`**: `id` (TEXT PK), `parent_name`, `phone`, `email`, `entry_level` (CHECK 16 levels: `Day Care`, `KG 1–2`, `Nursery 1–2`, `Primary 1–5`, `JSS 1–3`, `SSS 1–3`), `message`, `privacy_acknowledged` (INTEGER -> BOOLEAN `CHECK (privacy_acknowledged = true)`), `status` (CHECK `new|contacted|resolved|archived`), `assigned_to` (FK -> `admin_user.id` `ON DELETE SET NULL`), `idempotency_key` (TEXT UNIQUE), `created_at`, `updated_at`.
7. **`site_settings`**: `singleton_id` (SMALLINT PK DEFAULT 1 CHECK `= 1`), `official_name`, `motto`, `logo_url`, `brand_colors` (JSONB), `telephone`, `email`, `whatsapp_number`, `address`, `office_hours`, `directions_url`, `social_links` (JSONB), `default_seo_title`, `default_seo_description`, `institutional_content` (JSONB), `updated_at`.

### Indexes
- `news_article_status_published_at_idx` ON `news_article (status, published_at DESC)`
- `admissions_enquiry_status_created_at_idx` ON `admissions_enquiry (status, created_at DESC)`
- `gallery_image_status_order_created_at_idx` ON `gallery_image (status, display_order, created_at)`

---

## 4. SQLite-Specific Incompatibilities & Risks

| Area | SQLite Pattern | PostgreSQL Requirement | Risk / Mitigation |
|---|---|---|---|
| **Driver & Sync/Async** | Synchronous `DatabaseSync` | Asynchronous `postgres` (Postgres.js) | All service functions, server components, and API routes must `await` DB calls. |
| **Placeholders** | `?` positional | `$1, $2` or tagged template ``sql`...` `` | Use Postgres.js parameterized tagged templates everywhere to prevent SQL injection. |
| **Booleans** | `INTEGER CHECK (x IN (0, 1))` | Native `BOOLEAN` (`true`/`false`) | Update SQL `CHECK` constraints, queries (`is_active = true`), and data migration (`Boolean(row.x)`). |
| **JSON Columns** | `TEXT` storing JSON string | `JSONB` (or parsed cleanly) | Postgres.js auto-parses `JSONB` or returns object/string; handle both object and string safely in row mappers. |
| **Timestamps** | `TEXT` ISO-8601 strings | `TIMESTAMPTZ` | Normalize `Date | string` to ISO-8601 string in row mappers so frontend/API contracts remain unchanged. |
| **Serverless Pooling** | Single local file | Supabase Pooler (`pgbouncer` transaction mode) | Set `prepare: false`, `ssl: 'require'`, `max: 1` (or configurable low pool size) in serverless production. |
| **Cold-Start DDL/Seed** | Auto-runs DDL+seed on every `getDatabase()` | Explicit `scripts/migrate-postgres.ts` + idempotent seed | Avoid running DDL migrations on every serverless request; provide explicit migration/seed scripts + safe runtime guard. |

---

## 5. Proposed PostgreSQL Architecture & Strategy

- **Driver:** `postgres` (Postgres.js) — lightweight, zero native C++ bindings, first-class TypeScript support, native `prepare: false` for Supabase transaction pooler (port `6543`) and direct connections (port `5432`).
- **Schema & Migrations:** Explicit SQL migration `src/server/db/migrations/001_initial_schema.sql` tracked in `schema_migrations`, executed transactionally by `src/server/db/migrations/index.ts` and `scripts/migrate-postgres.ts`.
- **Repositories & Services:** Modular repositories under `src/server/db/repositories/` (`admin.repository.ts`, `settings.repository.ts`, `admissions.repository.ts`, `news.repository.ts`, `gallery.repository.ts`) orchestrated by async `src/server/services/cms-service.ts`, preserving every existing API contract and domain rule.
- **Data Migration & Backup:** `scripts/backup-sqlite.ts` and `scripts/migrate-sqlite-data.ts` (with `--dry-run` and FK-ordered transactional inserts).
- **Testing:** `tests/database/*.test.ts` + refactored `tests/cms-and-security.test.ts` supporting isolated PostgreSQL test database/schema when `TEST_DATABASE_URL` / `DATABASE_URL` is configured, while keeping pure domain/crypto/validation unit tests runnable anytime without external DB dependencies.
