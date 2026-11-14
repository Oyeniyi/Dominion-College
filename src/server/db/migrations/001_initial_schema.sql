-- Dominion College — PostgreSQL Initial Schema (Migration 001)
-- Preserves all entities, relationships, CHECK constraints, and indexes from SQLite v1/v2.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_user (
  id TEXT PRIMARY KEY,
  identity_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_code TEXT NOT NULL DEFAULT 'administrator'
    CHECK (role_code IN ('administrator')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS gallery_album (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  school_approved BOOLEAN NOT NULL DEFAULT FALSE,
  identifiable_students BOOLEAN NOT NULL DEFAULT FALSE,
  approval_reference TEXT,
  content_status TEXT NOT NULL DEFAULT 'verified'
    CHECK (content_status IN ('verified', 'pending_approval', 'placeholder', 'optional')),
  uploaded_by TEXT NOT NULL REFERENCES admin_user(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'published' OR school_approved = TRUE),
  CHECK (
    status <> 'published'
    OR identifiable_students = FALSE
    OR (approval_reference IS NOT NULL AND char_length(btrim(approval_reference)) >= 3)
  )
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
  published_at TIMESTAMPTZ,
  author_id TEXT NOT NULL REFERENCES admin_user(id) ON DELETE RESTRICT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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
  privacy_acknowledged BOOLEAN NOT NULL DEFAULT TRUE
    CHECK (privacy_acknowledged = TRUE),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
  assigned_to TEXT REFERENCES admin_user(id) ON DELETE SET NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  singleton_id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (singleton_id = 1),
  official_name TEXT NOT NULL,
  motto TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  brand_colors JSONB NOT NULL,
  telephone TEXT,
  email TEXT,
  whatsapp_number TEXT,
  address TEXT,
  office_hours TEXT,
  directions_url TEXT,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_seo_title TEXT NOT NULL,
  default_seo_description TEXT NOT NULL,
  institutional_content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_article_status_published_at_idx
  ON news_article (status, published_at DESC);

CREATE INDEX IF NOT EXISTS admissions_enquiry_status_created_at_idx
  ON admissions_enquiry (status, created_at DESC);

CREATE INDEX IF NOT EXISTS gallery_image_status_order_created_at_idx
  ON gallery_image (status, display_order, created_at);
