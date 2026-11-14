/**
 * Versioned PostgreSQL Migration Runner
 * Executes SQL migrations transactionally and records applied versions in schema_migrations.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { SqlClient } from '../types';

export interface PostgresMigration {
  version: number;
  name: string;
  filename: string;
}

export const POSTGRES_MIGRATIONS: readonly PostgresMigration[] = [
  {
    version: 1,
    name: '001_initial_schema',
    filename: '001_initial_schema.sql',
  },
];

function loadMigrationSql(filename: string): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'server', 'db', 'migrations', filename),
    path.join(__dirname, filename),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }
  throw new Error(`PostgreSQL migration file not found: ${filename}`);
}

export async function runMigrations(sql: SqlClient): Promise<{ applied: string[] }> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const applied: string[] = [];

  for (const migration of POSTGRES_MIGRATIONS) {
    const existing = await sql<{ version: number }[]>`
      SELECT version FROM schema_migrations WHERE version = ${migration.version} LIMIT 1
    `;
    if (existing.length > 0) {
      continue;
    }

    const migrationSql = loadMigrationSql(migration.filename);
    await sql.begin(async (tx) => {
      const txSql = tx as unknown as SqlClient;
      await txSql.unsafe(migrationSql);
      await txSql`
        INSERT INTO schema_migrations (version, name, applied_at)
        VALUES (${migration.version}, ${migration.name}, NOW())
        ON CONFLICT (version) DO NOTHING
      `;
    });
    applied.push(migration.name);
  }

  return { applied };
}
