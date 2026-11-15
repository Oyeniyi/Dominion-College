# Dominion College, Oba-Ile, Akure — School Website & Administration Dashboard

Official public website and protected content-management dashboard for **Dominion College, Oba-Ile, Akure** (`"THE SECERET OF WISDOM IS GOD"`).

## Scope & Educational Stages

- **Early Years:** Day Care, KG 1, KG 2, Nursery 1, Nursery 2
- **Primary School:** Primary 1 – Primary 5
- **Junior Secondary School:** JSS 1 – JSS 3
- **Senior Secondary School:** SSS 1 – SSS 3

## Production Architecture & Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript (Vercel-ready)
- **Styling:** Tailwind CSS with brand tokens derived from `images/dominion_logo.jpg` (`#5B1A69`, `#3B0F47`, `#7A288C`, `#D97706`)
- **Database:** **Supabase PostgreSQL** via `postgres` (Postgres.js) with versioned SQL migrations (`src/server/db/migrations/001_initial_schema.sql`), PgBouncer transaction-pooling support (`prepare: false`), and server-only repositories
- **Media Storage:** **Supabase Storage** (`@supabase/supabase-js`) using a private-first staging bucket (`dominion-media-staging`, signed URLs for admin preview) and a public bucket (`dominion-media-public`) for approved, published school media
- **Authentication:** Custom `scrypt` password hashing, HMAC-SHA256 signed HTTP-only session cookie (`dc_admin_session`), and double-submit CSRF protection (`dc_csrf_token` / `x-csrf-token`)
- **Testing:** Vitest (`tests/cms-and-security.test.ts`, `tests/database/*.test.ts`, `tests/storage/media-storage.test.ts`)

## Local Setup & Commands

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and configure required environment variables:
   - `DATABASE_URL`: Supabase PostgreSQL connection string (`:6543?pgbouncer=true` for serverless runtime; `:5432` or direct URL for CLI migrations)
   - `DATABASE_SSL_MODE`: Optional SSL override (`require` | `prefer` | `disable`; defaults to `require` for remote hosts and `prefer` for `localhost`)
   - `SESSION_SECRET`: Cryptographic secret at least 32 characters long (required in `NODE_ENV=production`)
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: Server-only Supabase Storage credentials
   - `SUPABASE_STORAGE_STAGING_BUCKET`, `SUPABASE_STORAGE_PUBLIC_BUCKET`: Private staging and public published bucket names
   - `NEXT_PUBLIC_SITE_URL`: Public canonical base URL (defaults to `http://localhost:3000`)
   - `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME`: Optional initial administrator bootstrap credentials for seeding an empty database
3. Initialize the database and run checks:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run db:verify
   npm run typecheck
   npm test
   npm run build
   npm run start
   ```
   Or for local development:
   ```bash
   npm run dev
   ```

## Offline Legacy Migration Utilities

If migrating data or local media from an earlier SQLite deployment:

```bash
# 1. Backup existing SQLite database
npm run db:backup-sqlite

# 2. Preview SQLite -> PostgreSQL migration (no database writes)
npm run db:migrate-data -- --dry-run

# 3. Execute SQLite -> PostgreSQL migration (skips existing site_settings unless --overwrite-settings is passed)
npm run db:migrate-data

# 4. Preview & execute local media -> Supabase Storage migration
npm run media:migrate -- --dry-run
npm run media:migrate
```

## Authoritative Documentation

- Product requirements: [`prd.md`](./prd.md)
- PostgreSQL & Supabase migration docs: [`docs/database-migration/deployment-guide.md`](./docs/database-migration/deployment-guide.md), [`docs/database-migration/data-migration-guide.md`](./docs/database-migration/data-migration-guide.md)
- Supabase Storage architecture: [`docs/media-storage/supabase-storage-architecture.md`](./docs/media-storage/supabase-storage-architecture.md)
- Requirements traceability: [`docs/requirements-traceability.md`](./docs/requirements-traceability.md)
- Architecture & ADRs: [`docs/architecture.md`](./docs/architecture.md)
- Database schema: [`docs/database-schema.md`](./docs/database-schema.md)
- API specification: [`docs/api-specification.md`](./docs/api-specification.md)
- Security specification: [`docs/security-specification.md`](./docs/security-specification.md)

## Pre-Production Launch Gates (School Owner Sign-Off Required)

- Replace placeholder school visuals (`public/placeholders/*.svg`) with school-approved photography and consent references where students are identifiable.
- Verify and update official telephone, email, WhatsApp number, and physical address in the Admin Settings dashboard.
- Provision production `SESSION_SECRET` (>= 32 chars), `DATABASE_URL`, and Supabase Storage credentials in Vercel, and rotate any temporary bootstrap administrator password before public launch.
