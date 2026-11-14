# SQLite-to-PostgreSQL Data Migration Guide

## 1. Pre-Migration Backup

Before transferring any existing SQLite data, create a timestamped backup:

```bash
npm run db:backup-sqlite
```

This runs `scripts/backup-sqlite.ts` and copies `./data/dominion_college.sqlite` to `./data/backups/dominion_college-<timestamp>.sqlite`.

## 2. Initialize PostgreSQL Schema

Apply versioned SQL migrations to Supabase PostgreSQL:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate
```

## 3. Dry-Run Data Transfer

Preview record counts and foreign-key ordering without writing to PostgreSQL:

```bash
DATABASE_URL="postgresql://..." SQLITE_SOURCE_PATH="./data/dominion_college.sqlite" npm run db:migrate-data -- --dry-run
```

## 4. Execute Transactional Data Transfer

Run `scripts/migrate-sqlite-data.ts` in foreign-key dependency order (`admin_user` → `gallery_album` → `gallery_image` → `news_article` → `admissions_enquiry` → `site_settings`), using `ON CONFLICT DO NOTHING` so existing PostgreSQL rows are never overwritten:

```bash
DATABASE_URL="postgresql://..." SQLITE_SOURCE_PATH="./data/dominion_college.sqlite" npm run db:migrate-data
```

## 5. Verify Migration

```bash
DATABASE_URL="postgresql://..." npm run db:verify
```

> **Note:** If no prior SQLite production database exists, run `npm run db:migrate` followed by `npm run db:seed` with explicit `BOOTSTRAP_ADMIN_*` credentials instead of `db:migrate-data`.
