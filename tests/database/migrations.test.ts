import { describe, it, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { closeDatabase, getSqlClient } from '../../src/server/db/client';
import { runMigrations } from '../../src/server/db/migrations';

const hasPostgresTestDb = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

describe('PostgreSQL Schema & Migrations', () => {
  afterAll(async () => {
    if (hasPostgresTestDb) {
      await closeDatabase();
    }
  });

  it('defines 001_initial_schema.sql with all 7 required tables, native types, and indexes', () => {
    const sqlPath = path.resolve(
      process.cwd(),
      'src/server/db/migrations/001_initial_schema.sql'
    );
    const ddl = fs.readFileSync(sqlPath, 'utf8');

    const expectedTables = [
      'schema_migrations',
      'admin_user',
      'gallery_album',
      'gallery_image',
      'news_article',
      'admissions_enquiry',
      'site_settings',
    ];

    for (const table of expectedTables) {
      assert.match(ddl, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, 'i'));
    }

    assert.match(ddl, /\bTIMESTAMPTZ\b/);
    assert.match(ddl, /\bBOOLEAN\b/);
    assert.match(ddl, /\bJSONB\b/);
    assert.match(ddl, /news_article_status_published_at_idx/i);
    assert.match(ddl, /admissions_enquiry_status_created_at_idx/i);
    assert.match(ddl, /gallery_image_status_order_created_at_idx/i);
  });

  it.runIf(hasPostgresTestDb)('applies migrations idempotently and records schema_migrations', async () => {
    const sql = getSqlClient();
    await runMigrations(sql);
    await runMigrations(sql);

    const rows = await sql<{ version: string; name: string }[]>`
      SELECT version, name FROM schema_migrations ORDER BY version ASC
    `;
    assert.ok(rows.some((r) => r.version === '001'));
  });
});
