import { describe, it, afterEach } from 'vitest';
import assert from 'node:assert/strict';
import { getPostgresConfig } from '../../src/server/db/config';
import { closeDatabase, getSqlClient } from '../../src/server/db/client';

const hasPostgresTestDb = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

describe('PostgreSQL Configuration & Connection Manager', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws an actionable error when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    delete process.env.TEST_DATABASE_URL;
    assert.throws(() => getPostgresConfig(), /DATABASE_URL is not configured/i);
  });

  it('configures Supabase pooler defaults (prepare: false, ssl: require, maxConnections: 1 in production)', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres.proj:secret@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const cfg = getPostgresConfig();
    assert.equal(cfg.prepare, false);
    assert.equal(cfg.ssl, 'require');
    assert.equal(cfg.maxConnections, 1);
  });

  it('defaults SSL to prefer for localhost development connections and honors DATABASE_SSL_MODE', () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dominion_college';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    delete process.env.DATABASE_SSL_MODE;

    const cfg = getPostgresConfig();
    assert.equal(cfg.ssl, 'prefer');
    assert.equal(cfg.maxConnections, 5);

    process.env.DATABASE_SSL_MODE = 'require';
    assert.equal(getPostgresConfig().ssl, 'require');

    process.env.DATABASE_SSL_MODE = 'disable';
    assert.equal(getPostgresConfig().ssl, false);
  });

  it.runIf(hasPostgresTestDb)('connects to PostgreSQL and executes SELECT 1', async () => {
    const sql = getSqlClient();
    const rows = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    assert.equal(rows[0]?.ok, 1);
    await closeDatabase();
  });
});
