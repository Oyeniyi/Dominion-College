# Dominion College, Oba-Ile, Akure — School Website & Administration Dashboard

Official public website and protected content-management dashboard for **Dominion College, Oba-Ile, Akure** (`"THE SECERET OF WISDOM IS GOD"`).

## Scope & Educational Stages

- **Early Years:** Day Care, KG 1, KG 2, Nursery 1, Nursery 2
- **Primary School:** Primary 1 – Primary 5
- **Junior Secondary School:** JSS 1 – JSS 3
- **Senior Secondary School:** SSS 1 – SSS 3

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS with brand tokens derived from `images/dominion_logo.jpg` (`#5B1A69`, `#3B0F47`, `#7A288C`, `#D97706`)
- **Database:** Node.js built-in `node:sqlite` (`DatabaseSync`, requiring Node.js 24+) with versioned migrations and seeded institutional defaults
- **Authentication:** `scrypt` password hashing, HMAC-SHA256 signed HTTP-only session cookie (`dc_admin_session`), and double-submit CSRF protection (`dc_csrf_token` / `x-csrf-token`)
- **Testing:** Vitest (`tests/cms-and-security.test.ts`)

## Local Setup & Commands

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables for runtime (required in production):
   - `SESSION_SECRET`: Cryptographic secret at least 32 characters long (required in `NODE_ENV=production`)
   - `DATABASE_PATH`: Optional SQLite file path (defaults to `data/dominion_college.sqlite` in development/production or `:memory:` in test)
   - `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME`: Optional initial administrator bootstrap credentials
   - `NEXT_PUBLIC_SITE_URL`: Public canonical base URL (defaults to `http://localhost:3000`)
   - `MEDIA_STAGING_DIR`, `MEDIA_PUBLIC_DIR`: Local staging and public upload directories
3. Run checks and start:
   ```bash
   npm run typecheck
   npm test
   npm run build
   npm run start
   ```
   Or for local development:
   ```bash
   npm run dev
   ```

## Docker Deployment

The repository includes a multi-stage [`Dockerfile`](./Dockerfile) (Node.js 24 Alpine with Next.js `standalone` output) and [`docker-compose.yml`](./docker-compose.yml) with persistent volumes for the SQLite database (`/app/data`) and uploaded gallery images (`/app/public/uploads`).

1. Set a strong `SESSION_SECRET` (at least 32 characters) in `.env` or your shell environment:
   ```bash
   export SESSION_SECRET="replace-with-a-random-secret-of-at-least-32-characters"
   ```
2. Build and start the container:
   ```bash
   docker compose up -d --build
   ```
3. Open `http://localhost:3000` (and `/admin/login` for the staff dashboard).

## Authoritative Documentation

- Product requirements: [`prd.md`](./prd.md)
- Requirements traceability: [`docs/requirements-traceability.md`](./docs/requirements-traceability.md)
- Architecture & ADRs: [`docs/architecture.md`](./docs/architecture.md)
- Database schema: [`docs/database-schema.md`](./docs/database-schema.md)
- API specification: [`docs/api-specification.md`](./docs/api-specification.md)
- Security specification: [`docs/security-specification.md`](./docs/security-specification.md)
- Implementation tasks: [`docs/tasks.md`](./docs/tasks.md)

## Pre-Production Launch Gates (School Owner Sign-Off Required)

- Replace placeholder school visuals (`public/placeholders/*.svg`) with school-approved photography and consent references where students are identifiable.
- Verify and update official telephone, email, WhatsApp number, and physical address in the Admin Settings dashboard.
- Provision production `SESSION_SECRET` (>= 32 chars) and change the bootstrap administrator password before public launch.

