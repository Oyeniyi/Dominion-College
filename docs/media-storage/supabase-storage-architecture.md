# Supabase Storage Architecture & Configuration Guide — Dominion College

## 1. Existing Media System Audit

Prior to this migration:
- `src/server/services/media-storage.ts` validated uploaded images via magic-byte inspection (`inspectImageBufferFormat`: JPEG, PNG, WebP, safe SVG up to `5 MB`), then persisted files to `MEDIA_STAGING_DIR` (`./data/staging-uploads`) and copied approved/published files to `MEDIA_PUBLIC_DIR` (`./public/uploads`).
- Because Vercel serverless functions use ephemeral filesystems, local disk writes in `./data/staging-uploads` and `./public/uploads` are not shared across instances and are lost on redeployment.
- **Local Media Check:** Inspecting `data/` and `public/uploads/` confirmed **no user-uploaded media files exist locally** in this repository. All built-in sample visuals use static `/placeholders/*.svg` assets in `public/placeholders/` (`storageKey` prefixed with `placeholder:`), which remain static repository assets.

## 2. Bucket Architecture & Public vs. Private Decision

Dominion College enforces a **private-first staging and child-protection approval workflow** (`AE-09`, `SEC-16`):

| Bucket Name (Env Variable) | Visibility | Purpose |
|---|---|---|
| `dominion-media-staging` (`SUPABASE_STORAGE_STAGING_BUCKET`) | **Private (`public = false`)** | Master staging store for all uploaded images (`gallery/<uuid>.<ext>`). Draft, unpublished, archived, or unapproved student photos remain strictly private and are only previewed by authenticated admins via short-lived (`3600s`) signed URLs. |
| `dominion-media-public` (`SUPABASE_STORAGE_PUBLIC_BUCKET`) | **Public (`public = true`)** | Serves **only** images where `status = 'published'` AND `school_approved = true` (and child-protection `approval_reference` verified if `identifiable_students = true`). |

### Justification
- **Why two buckets instead of one public bucket?** A single public bucket would expose unapproved draft uploads or identifiable student photos if someone guessed an object URL. Keeping unapproved media in a private bucket guarantees zero public access until an authorized administrator approves and publishes the record.
- **Why a public bucket for published assets?** Published school gallery photos and news featured images are public institutional assets. Using a public Supabase Storage bucket provides direct CDN-cached URLs (`getPublicUrl`) with zero per-request signing overhead on public pages (`/` , `/gallery`, `/news`).

## 3. Supabase Bucket Setup & Least-Privilege Access Policies

Create both buckets in **Supabase Dashboard → Storage**:
1. `dominion-media-staging`: **Public bucket = OFF**, allowed MIME types: `image/jpeg, image/png, image/webp, image/svg+xml`, file size limit: `5 MB` (`5242880` bytes).
2. `dominion-media-public`: **Public bucket = ON**, allowed MIME types: `image/jpeg, image/png, image/webp, image/svg+xml`, file size limit: `5 MB`.

Apply least-privilege RLS policies on `storage.objects` in the **Supabase SQL Editor**:

```sql
-- Public read-only access ONLY for the published public bucket
CREATE POLICY "Public read access for published school media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'dominion-media-public');

-- No anon or authenticated browser-client INSERT, UPDATE, or DELETE policies
-- are granted on either bucket. All mutations occur strictly server-side
-- using SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS).
```

> **Security Rule:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or prefix it with `NEXT_PUBLIC_`.

## 4. Database Integration & Partial-Failure Handling

- **Upload (`uploadAdminGalleryImage`)**:
  1. Validates RBAC (`gallery:upload`, and `gallery:publish` if publishing immediately) and child-protection rules.
  2. Validates magic bytes and size (`<= 5 MB`), uploads to `dominion-media-staging` (and `dominion-media-public` if immediately published).
  3. Inserts metadata (`storage_key`, `public_url`, etc.) into PostgreSQL `gallery_image`.
  4. **Rollback on DB failure:** If the PostgreSQL insert fails, `removeStoredMediaBytes(storageKey)` immediately deletes the uploaded storage object(s) before rethrowing.
- **Visibility Sync (`updateAdminGalleryImage`)**:
  - Publishing copies the object from `dominion-media-staging` to `dominion-media-public` and updates `gallery_image.public_url` to the permanent public URL.
  - Unpublishing or revoking `school_approved` removes the object from `dominion-media-public`, keeps the master in `dominion-media-staging`, and updates `public_url` to a 1-hour signed staging URL for admin preview.
- **Safe Deletion (`deleteAdminGalleryImage`)**:
  - Checks that no `news_article` references the image, deletes the PostgreSQL row **first**, and removes the object from Supabase Storage **only after** database deletion succeeds.

## 5. Environment Variables (Local & Vercel)

Configure in `.env.local` and **Vercel → Project Settings → Environment Variables** (Development, Preview, Production):

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL (`https://<project-ref>.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only Supabase service role key.
- `SUPABASE_STORAGE_STAGING_BUCKET` — Private staging bucket name (default: `dominion-media-staging`).
- `SUPABASE_STORAGE_PUBLIC_BUCKET` — Public published bucket name (default: `dominion-media-public`).

## 6. Offline Media Migration Utility

If local uploads ever exist in `./data/staging-uploads` or `./public/uploads`:

```bash
# Dry-run preview (does not upload or modify PostgreSQL)
npm run media:migrate -- --dry-run

# Execute migration (skips already-uploaded objects unless --overwrite is passed)
npm run media:migrate
```

## 7. Remaining Local Filesystem Dependencies

- **Production Runtime Media:** **None.** `src/server/services/media-storage.ts` and `src/server/storage/supabase-client.ts` have zero `node:fs` imports and never write to Vercel's local filesystem.
- **Static Repository Assets:** `public/placeholders/*.svg` and `public/images/dominion_logo.jpg` are read-only static assets bundled with the Next.js deployment.
- **Server-side SQL Migrations & Offline CLI Scripts:** `src/server/db/migrations/index.ts` reads bundled `.sql` files from disk (`readFileSync`), and `scripts/backup-sqlite.ts`, `scripts/migrate-sqlite-data.ts`, `scripts/migrate-media-to-supabase.ts` read local files only when invoked manually from the CLI.
