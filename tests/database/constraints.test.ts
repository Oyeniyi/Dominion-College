import { describe, it, beforeEach, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { closeDatabase, getSqlClient, resetDatabaseForTests } from '../../src/server/db/client';

const hasPostgresTestDb = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

describe.runIf(hasPostgresTestDb)('PostgreSQL Schema Constraints & Child Protection Rules', () => {
  beforeEach(async () => {
    await resetDatabaseForTests();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('enforces invalid entry_level CHECK constraint on admissions_enquiry', async () => {
    const sql = getSqlClient();
    const now = new Date().toISOString();
    await assert.rejects(
      () => sql`
        INSERT INTO admissions_enquiry (
          id, parent_name, phone, email, entry_level, message,
          privacy_acknowledged, status, created_at, updated_at
        )
        VALUES (
          ${crypto.randomUUID()}, 'Test Parent', '+2348030000000', null,
          'Invalid Grade', null, true, 'new', ${now}, ${now}
        )
      `
    );
  });

  it('enforces site_settings singleton_id = 1 constraint', async () => {
    const sql = getSqlClient();
    await assert.rejects(
      () => sql`
        INSERT INTO site_settings (
          singleton_id, official_name, motto, logo_url,
          brand_colors, default_seo_title, default_seo_description, institutional_content
        )
        VALUES (
          2, 'Duplicate', 'Motto', '/logo.jpg',
          '{}'::jsonb, 'Title', 'Desc', '{}'::jsonb
        )
      `
    );
  });

  it('enforces student media consent CHECK constraint on gallery_image', async () => {
    const sql = getSqlClient();
    const now = new Date().toISOString();
    await assert.rejects(
      () => sql`
        INSERT INTO gallery_image (
          id, storage_key, public_url, alt_text, status, school_approved,
          identifiable_students, approval_reference, content_status, uploaded_by, created_at
        )
        VALUES (
          ${crypto.randomUUID()}, 'media:bad.jpg', '/uploads/bad.jpg', 'Student photo',
          'published', true, true, null, 'verified', 'admin', ${now}
        )
      `
    );
  });
});
