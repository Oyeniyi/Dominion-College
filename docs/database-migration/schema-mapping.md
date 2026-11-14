# SQLite-to-PostgreSQL Schema Mapping

| Table | Column | SQLite Type | PostgreSQL Type | Notes / Constraints |
|---|---|---|---|---|
| `schema_migrations` | `version` | `INTEGER PRIMARY KEY` | `INTEGER PRIMARY KEY` | Migration version number |
| `schema_migrations` | `name` | `TEXT NOT NULL` | `TEXT NOT NULL` | Migration filename/identifier |
| `schema_migrations` | `applied_at` | `TEXT NOT NULL` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | UTC instant |
| `admin_user` | `id` | `TEXT PRIMARY KEY` | `TEXT PRIMARY KEY` | UUID string preserved |
| `admin_user` | `identity_subject` | `TEXT NOT NULL UNIQUE` | `TEXT NOT NULL UNIQUE` | `local:<email>` |
| `admin_user` | `display_name` | `TEXT NOT NULL` | `TEXT NOT NULL` | Staff display name |
| `admin_user` | `email` | `TEXT NOT NULL UNIQUE` | `TEXT NOT NULL UNIQUE` | Lowercased email |
| `admin_user` | `password_hash` | `TEXT NOT NULL` | `TEXT NOT NULL` | `scrypt$<salt>$<hash>` |
| `admin_user` | `role_code` | `TEXT DEFAULT 'administrator'` | `TEXT NOT NULL DEFAULT 'administrator'` | `CHECK (role_code IN ('administrator'))` |
| `admin_user` | `is_active` | `INTEGER CHECK (0,1)` | `BOOLEAN NOT NULL DEFAULT TRUE` | Native boolean |
| `admin_user` | `created_at` / `updated_at` / `last_login_at` | `TEXT` | `TIMESTAMPTZ` | `last_login_at` nullable |
| `gallery_album` | `id`, `title`, `slug`, `description`, `status` | `TEXT` | `TEXT` | `slug` UNIQUE; `status` CHECK |
| `gallery_album` | `created_at`, `updated_at` | `TEXT NOT NULL` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | UTC instant |
| `gallery_image` | `id`, `album_id`, `storage_key`, `public_url`, `alt_text`, `caption`, `approval_reference`, `content_status`, `uploaded_by` | `TEXT` | `TEXT` | `album_id` FK `ON DELETE SET NULL`; `uploaded_by` FK `ON DELETE RESTRICT` |
| `gallery_image` | `display_order` | `INTEGER` | `INTEGER NOT NULL DEFAULT 0` | `CHECK (display_order >= 0)` |
| `gallery_image` | `school_approved`, `identifiable_students` | `INTEGER CHECK (0,1)` | `BOOLEAN NOT NULL DEFAULT FALSE` | Native boolean + child-protection `CHECK` constraints preserved |
| `gallery_image` | `created_at` | `TEXT NOT NULL` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | UTC instant |
| `news_article` | `id`, `title`, `slug`, `excerpt`, `body`, `featured_image_id`, `status`, `author_id`, `seo_title`, `seo_description` | `TEXT` | `TEXT` | `featured_image_id` FK `ON DELETE RESTRICT`; `author_id` FK `ON DELETE RESTRICT` |
| `news_article` | `published_at`, `created_at`, `updated_at` | `TEXT` | `TIMESTAMPTZ` | `CHECK (status <> 'published' OR published_at IS NOT NULL)` |
| `admissions_enquiry` | `id`, `parent_name`, `phone`, `email`, `entry_level`, `message`, `status`, `assigned_to`, `idempotency_key` | `TEXT` | `TEXT` | 16 `entry_level` values in `CHECK`; `assigned_to` FK `ON DELETE SET NULL`; `idempotency_key` UNIQUE |
| `admissions_enquiry` | `privacy_acknowledged` | `INTEGER CHECK (= 1)` | `BOOLEAN NOT NULL DEFAULT TRUE` | `CHECK (privacy_acknowledged = TRUE)` |
| `admissions_enquiry` | `created_at`, `updated_at` | `TEXT NOT NULL` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | UTC instant |
| `site_settings` | `singleton_id` | `INTEGER PRIMARY KEY DEFAULT 1` | `SMALLINT PRIMARY KEY DEFAULT 1` | `CHECK (singleton_id = 1)` |
| `site_settings` | `brand_colors`, `social_links`, `institutional_content` | `TEXT` | `JSONB NOT NULL` | Structured JSONB |
| `site_settings` | `official_name`, `motto`, `logo_url`, `telephone`, `email`, `whatsapp_number`, `address`, `office_hours`, `directions_url`, `default_seo_title`, `default_seo_description` | `TEXT` | `TEXT` | Preserved nullable/non-null |
| `site_settings` | `updated_at` | `TEXT NOT NULL` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | UTC instant |
