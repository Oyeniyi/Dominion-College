/**
 * Versioned Database Migrations
 * Adheres to database-schema.md v1.0, AE-06, AE-15, and TASK-011.
 */

import type { DatabaseSync } from 'node:sqlite';

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: '001_initial_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_user (
        id TEXT PRIMARY KEY,
        identity_subject TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role_code TEXT NOT NULL DEFAULT 'administrator'
          CHECK (role_code IN ('administrator')),
        is_active INTEGER NOT NULL DEFAULT 1
          CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login_at TEXT
      );

      CREATE TABLE IF NOT EXISTS gallery_album (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'draft'
          CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS gallery_image (
        id TEXT PRIMARY KEY,
        album_id TEXT REFERENCES gallery_album(id) ON DELETE SET NULL,
        storage_key TEXT NOT NULL UNIQUE,
        public_url TEXT NOT NULL,
        alt_text TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER NOT NULL DEFAULT 0
          CHECK (display_order >= 0),
        status TEXT NOT NULL DEFAULT 'draft'
          CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
        school_approved INTEGER NOT NULL DEFAULT 0
          CHECK (school_approved IN (0, 1)),
        identifiable_students INTEGER NOT NULL DEFAULT 0
          CHECK (identifiable_students IN (0, 1)),
        approval_reference TEXT,
        content_status TEXT NOT NULL DEFAULT 'verified'
          CHECK (content_status IN ('verified', 'pending_approval', 'placeholder', 'optional')),
        uploaded_by TEXT NOT NULL REFERENCES admin_user(id) ON DELETE RESTRICT,
        created_at TEXT NOT NULL,
        CHECK (status <> 'published' OR school_approved = 1),
        CHECK (status <> 'published' OR identifiable_students = 0 OR (approval_reference IS NOT NULL AND length(trim(approval_reference)) >= 3))
      );

      CREATE TABLE IF NOT EXISTS news_article (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT,
        body TEXT NOT NULL,
        featured_image_id TEXT REFERENCES gallery_image(id) ON DELETE RESTRICT,
        status TEXT NOT NULL DEFAULT 'draft'
          CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
        published_at TEXT,
        author_id TEXT NOT NULL REFERENCES admin_user(id) ON DELETE RESTRICT,
        seo_title TEXT,
        seo_description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK (status <> 'published' OR published_at IS NOT NULL)
      );

      CREATE TABLE IF NOT EXISTS admissions_enquiry (
        id TEXT PRIMARY KEY,
        parent_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        entry_level TEXT NOT NULL
          CHECK (entry_level IN (
            'Day Care', 'KG 1', 'KG 2', 'Nursery 1', 'Nursery 2',
            'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5',
            'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'
          )),
        message TEXT,
        privacy_acknowledged INTEGER NOT NULL DEFAULT 1
          CHECK (privacy_acknowledged = 1),
        status TEXT NOT NULL DEFAULT 'new'
          CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
        assigned_to TEXT REFERENCES admin_user(id) ON DELETE SET NULL,
        idempotency_key TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        singleton_id INTEGER PRIMARY KEY DEFAULT 1 CHECK (singleton_id = 1),
        official_name TEXT NOT NULL,
        motto TEXT NOT NULL,
        logo_url TEXT NOT NULL,
        brand_colors TEXT NOT NULL,
        telephone TEXT,
        email TEXT,
        whatsapp_number TEXT,
        address TEXT,
        office_hours TEXT,
        directions_url TEXT,
        social_links TEXT NOT NULL DEFAULT '[]',
        default_seo_title TEXT NOT NULL,
        default_seo_description TEXT NOT NULL,
        institutional_content TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS news_article_status_published_at_idx
        ON news_article (status, published_at DESC);

      CREATE INDEX IF NOT EXISTS admissions_enquiry_status_created_at_idx
        ON admissions_enquiry (status, created_at DESC);

      CREATE INDEX IF NOT EXISTS gallery_image_status_order_created_at_idx
        ON gallery_image (status, display_order, created_at);
    `,
  },
  {
    version: 2,
    name: '002_expand_entry_levels_early_years_primary',
    sql: `
      CREATE TABLE admissions_enquiry_v2 (
        id TEXT PRIMARY KEY,
        parent_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        entry_level TEXT NOT NULL
          CHECK (entry_level IN (
            'Day Care', 'KG 1', 'KG 2', 'Nursery 1', 'Nursery 2',
            'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5',
            'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'
          )),
        message TEXT,
        privacy_acknowledged INTEGER NOT NULL DEFAULT 1
          CHECK (privacy_acknowledged = 1),
        status TEXT NOT NULL DEFAULT 'new'
          CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
        assigned_to TEXT REFERENCES admin_user(id) ON DELETE SET NULL,
        idempotency_key TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      INSERT INTO admissions_enquiry_v2 (
        id, parent_name, phone, email, entry_level, message,
        privacy_acknowledged, status, assigned_to, idempotency_key, created_at, updated_at
      )
      SELECT
        id, parent_name, phone, email, entry_level, message,
        privacy_acknowledged, status, assigned_to, idempotency_key, created_at, updated_at
      FROM admissions_enquiry;

      DROP TABLE admissions_enquiry;
      ALTER TABLE admissions_enquiry_v2 RENAME TO admissions_enquiry;

      CREATE INDEX IF NOT EXISTS admissions_enquiry_status_created_at_idx
        ON admissions_enquiry (status, created_at DESC);
    `,
  },
];

export function runMigrations(db: DatabaseSync): void {
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedStmt = db.prepare('SELECT version FROM schema_migrations WHERE version = ?');
  const insertMigrationStmt = db.prepare(
    'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)'
  );

  for (const migration of MIGRATIONS) {
    const existing = appliedStmt.get(migration.version) as { version: number } | undefined;
    if (!existing) {
      db.exec('BEGIN');
      try {
        db.exec(migration.sql);
        insertMigrationStmt.run(migration.version, migration.name, new Date().toISOString());
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    }
  }
}

