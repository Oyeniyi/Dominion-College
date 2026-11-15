import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { closeDatabase, getSqlClient } from '../src/server/db/client';
import { runMigrations } from '../src/server/db/migrations';

interface SqliteDatabaseLike {
  prepare(sql: string): {
    all(...params: unknown[]): Array<Record<string, unknown>>;
  };
  close(): void;
}

function openSqliteReadOnly(filePath: string): SqliteDatabaseLike {
  const req = createRequire(import.meta.url);
  const sqliteModule = req('node:sqlite') as {
    DatabaseSync: new (path: string, options?: { readOnly?: boolean }) => SqliteDatabaseLike;
  };
  return new sqliteModule.DatabaseSync(filePath, { readOnly: true });
}

function toBoolean(value: unknown): boolean {
  return value === 1 || value === true || value === '1' || value === 'true';
}

function parseJson(value: unknown, fallback: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'string') {
    return JSON.parse(value);
  }
  return value;
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const overwriteSettings = args.has('--overwrite-settings');

  const sourcePath = path.resolve(
    process.cwd(),
    process.env.SQLITE_SOURCE_PATH || './data/dominion_college.sqlite'
  );

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`SQLite source database not found at: ${sourcePath}`);
  }

  const sqlite = openSqliteReadOnly(sourcePath);

  try {
    const adminUsers = sqlite.prepare('SELECT * FROM admin_user').all();
    const albums = sqlite.prepare('SELECT * FROM gallery_album').all();
    const images = sqlite.prepare('SELECT * FROM gallery_image').all();
    const articles = sqlite.prepare('SELECT * FROM news_article').all();
    const enquiries = sqlite.prepare('SELECT * FROM admissions_enquiry').all();
    const settings = sqlite.prepare('SELECT * FROM site_settings').all();

    // Validate JSON columns before touching PostgreSQL
    for (const row of settings) {
      parseJson(row.brand_colors, {});
      parseJson(row.social_links, []);
      parseJson(row.institutional_content, {});
    }

    const counts = {
      admin_user: adminUsers.length,
      gallery_album: albums.length,
      gallery_image: images.length,
      news_article: articles.length,
      admissions_enquiry: enquiries.length,
      site_settings: settings.length,
    };

    if (dryRun) {
      console.log('SQLite -> PostgreSQL dry-run complete (no PostgreSQL or SQLite changes made).', {
        dryRun: true,
        overwriteSettings,
        siteSettingsConflictPolicy: overwriteSettings ? 'overwrite-existing' : 'skip-existing',
        sourcePath,
        counts,
      });
      return;
    }

    const sql = getSqlClient();
    try {
      await runMigrations(sql);

      await sql.begin(async (tx) => {
        for (const row of adminUsers) {
          await tx`
            INSERT INTO admin_user (
              id, identity_subject, display_name, email, password_hash,
              role_code, is_active, created_at, updated_at, last_login_at
            )
            VALUES (
              ${String(row.id)},
              ${String(row.identity_subject)},
              ${String(row.display_name)},
              ${String(row.email)},
              ${String(row.password_hash)},
              ${String(row.role_code || 'administrator')},
              ${toBoolean(row.is_active)},
              ${String(row.created_at)},
              ${String(row.updated_at || row.created_at)},
              ${row.last_login_at ? String(row.last_login_at) : null}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }

        for (const row of albums) {
          await tx`
            INSERT INTO gallery_album (
              id, title, slug, description, status, created_at, updated_at
            )
            VALUES (
              ${String(row.id)},
              ${String(row.title)},
              ${String(row.slug)},
              ${row.description ? String(row.description) : null},
              ${String(row.status || 'draft')},
              ${String(row.created_at)},
              ${String(row.updated_at || row.created_at)}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }

        for (const row of images) {
          await tx`
            INSERT INTO gallery_image (
              id, album_id, storage_key, public_url, alt_text, caption,
              display_order, status, school_approved, identifiable_students,
              approval_reference, content_status, uploaded_by, created_at
            )
            VALUES (
              ${String(row.id)},
              ${row.album_id ? String(row.album_id) : null},
              ${String(row.storage_key)},
              ${String(row.public_url)},
              ${String(row.alt_text)},
              ${row.caption ? String(row.caption) : null},
              ${Number(row.display_order ?? 0)},
              ${String(row.status || 'draft')},
              ${toBoolean(row.school_approved)},
              ${toBoolean(row.identifiable_students)},
              ${row.approval_reference ? String(row.approval_reference) : null},
              ${String(row.content_status || 'verified')},
              ${String(row.uploaded_by)},
              ${String(row.created_at)}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }

        for (const row of articles) {
          await tx`
            INSERT INTO news_article (
              id, title, slug, excerpt, body, featured_image_id,
              status, published_at, author_id, seo_title, seo_description,
              created_at, updated_at
            )
            VALUES (
              ${String(row.id)},
              ${String(row.title)},
              ${String(row.slug)},
              ${row.excerpt ? String(row.excerpt) : null},
              ${String(row.body)},
              ${row.featured_image_id ? String(row.featured_image_id) : null},
              ${String(row.status || 'draft')},
              ${row.published_at ? String(row.published_at) : null},
              ${String(row.author_id)},
              ${row.seo_title ? String(row.seo_title) : null},
              ${row.seo_description ? String(row.seo_description) : null},
              ${String(row.created_at)},
              ${String(row.updated_at || row.created_at)}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }

        for (const row of enquiries) {
          await tx`
            INSERT INTO admissions_enquiry (
              id, parent_name, phone, email, entry_level, message,
              privacy_acknowledged, status, assigned_to, idempotency_key,
              created_at, updated_at
            )
            VALUES (
              ${String(row.id)},
              ${String(row.parent_name)},
              ${String(row.phone)},
              ${row.email ? String(row.email) : null},
              ${String(row.entry_level)},
              ${row.message ? String(row.message) : null},
              ${toBoolean(row.privacy_acknowledged)},
              ${String(row.status || 'new')},
              ${row.assigned_to ? String(row.assigned_to) : null},
              ${row.idempotency_key ? String(row.idempotency_key) : null},
              ${String(row.created_at)},
              ${String(row.updated_at || row.created_at)}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }

        for (const row of settings) {
          if (overwriteSettings) {
            await tx`
              INSERT INTO site_settings (
                singleton_id, official_name, motto, logo_url, brand_colors,
                telephone, email, whatsapp_number, address, office_hours,
                directions_url, social_links, default_seo_title,
                default_seo_description, institutional_content, updated_at
              )
              VALUES (
                ${Number(row.singleton_id ?? 1)},
                ${String(row.official_name)},
                ${String(row.motto)},
                ${String(row.logo_url)},
                ${JSON.stringify(parseJson(row.brand_colors, {}))}::jsonb,
                ${row.telephone ? String(row.telephone) : null},
                ${row.email ? String(row.email) : null},
                ${row.whatsapp_number ? String(row.whatsapp_number) : null},
                ${row.address ? String(row.address) : null},
                ${row.office_hours ? String(row.office_hours) : null},
                ${row.directions_url ? String(row.directions_url) : null},
                ${JSON.stringify(parseJson(row.social_links, []))}::jsonb,
                ${String(row.default_seo_title)},
                ${String(row.default_seo_description)},
                ${JSON.stringify(parseJson(row.institutional_content, {}))}::jsonb,
                ${String(row.updated_at)}
              )
              ON CONFLICT (singleton_id) DO UPDATE SET
                official_name = EXCLUDED.official_name,
                motto = EXCLUDED.motto,
                logo_url = EXCLUDED.logo_url,
                brand_colors = EXCLUDED.brand_colors,
                telephone = EXCLUDED.telephone,
                email = EXCLUDED.email,
                whatsapp_number = EXCLUDED.whatsapp_number,
                address = EXCLUDED.address,
                office_hours = EXCLUDED.office_hours,
                directions_url = EXCLUDED.directions_url,
                social_links = EXCLUDED.social_links,
                default_seo_title = EXCLUDED.default_seo_title,
                default_seo_description = EXCLUDED.default_seo_description,
                institutional_content = EXCLUDED.institutional_content,
                updated_at = EXCLUDED.updated_at
            `;
          } else {
            await tx`
              INSERT INTO site_settings (
                singleton_id, official_name, motto, logo_url, brand_colors,
                telephone, email, whatsapp_number, address, office_hours,
                directions_url, social_links, default_seo_title,
                default_seo_description, institutional_content, updated_at
              )
              VALUES (
                ${Number(row.singleton_id ?? 1)},
                ${String(row.official_name)},
                ${String(row.motto)},
                ${String(row.logo_url)},
                ${JSON.stringify(parseJson(row.brand_colors, {}))}::jsonb,
                ${row.telephone ? String(row.telephone) : null},
                ${row.email ? String(row.email) : null},
                ${row.whatsapp_number ? String(row.whatsapp_number) : null},
                ${row.address ? String(row.address) : null},
                ${row.office_hours ? String(row.office_hours) : null},
                ${row.directions_url ? String(row.directions_url) : null},
                ${JSON.stringify(parseJson(row.social_links, []))}::jsonb,
                ${String(row.default_seo_title)},
                ${String(row.default_seo_description)},
                ${JSON.stringify(parseJson(row.institutional_content, {}))}::jsonb,
                ${String(row.updated_at)}
              )
              ON CONFLICT (singleton_id) DO NOTHING
            `;
          }
        }
      });

      console.log('SQLite -> PostgreSQL data migration completed successfully.', {
        overwriteSettings,
        counts,
      });
    } finally {
      await closeDatabase();
    }
  } finally {
    sqlite.close();
  }
}

main().catch((error) => {
  console.error('SQLite -> PostgreSQL data migration failed:', error);
  process.exit(1);
});
