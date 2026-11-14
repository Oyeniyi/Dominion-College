/**
 * Server-Only PostgreSQL Connection Manager (Supabase / Vercel Serverless Ready)
 * Uses Postgres.js (`postgres`) with conservative pooling and PgBouncer compatibility.
 * Adheres to AE-06 (server-only, parameterized queries, reviewed migrations).
 */

import postgres from 'postgres';
import { getPostgresConfig } from './config';
import { runMigrations } from './migrations';
import { seedInitialDataIfEmpty } from './seed-data';
import type { SqlClient } from './types';

const globalForDb = globalThis as unknown as {
  __dominionSql?: SqlClient;
  __dominionConnString?: string;
  __dominionInitPromise?: Promise<void>;
};

export function getSqlClient(): SqlClient {
  const cfg = getPostgresConfig();

  if (globalForDb.__dominionSql && globalForDb.__dominionConnString === cfg.connectionString) {
    return globalForDb.__dominionSql;
  }

  const client = postgres(cfg.connectionString, {
    max: cfg.maxConnections,
    prepare: cfg.prepare,
    ssl: cfg.ssl,
    idle_timeout: cfg.idleTimeoutSeconds,
    connect_timeout: cfg.connectTimeoutSeconds,
    onnotice: () => {
      // Suppress PostgreSQL NOTICE noise (e.g., CREATE TABLE IF NOT EXISTS)
    },
  });

  globalForDb.__dominionSql = client;
  globalForDb.__dominionConnString = cfg.connectionString;
  globalForDb.__dominionInitPromise = undefined;
  return client;
}

export async function getDatabase(): Promise<SqlClient> {
  const sql = getSqlClient();

  if (!globalForDb.__dominionInitPromise) {
    globalForDb.__dominionInitPromise = (async () => {
      await runMigrations(sql);
      await seedInitialDataIfEmpty(sql, { allowMissingProdBootstrap: true });
    })();
  }

  try {
    await globalForDb.__dominionInitPromise;
  } catch (err) {
    globalForDb.__dominionInitPromise = undefined;
    throw err;
  }

  return sql;
}

export async function closeDatabase(): Promise<void> {
  if (globalForDb.__dominionSql) {
    await globalForDb.__dominionSql.end({ timeout: 5 });
    globalForDb.__dominionSql = undefined;
    globalForDb.__dominionConnString = undefined;
    globalForDb.__dominionInitPromise = undefined;
  }
}

export async function resetDatabaseForTests(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('resetDatabaseForTests() must never run in production.');
  }
  const sql = getSqlClient();
  await runMigrations(sql);
  await sql`
    TRUNCATE TABLE
      news_article,
      gallery_image,
      gallery_album,
      admissions_enquiry,
      site_settings,
      admin_user
    RESTART IDENTITY CASCADE
  `;
  globalForDb.__dominionInitPromise = undefined;
  await seedInitialDataIfEmpty(sql);
}
