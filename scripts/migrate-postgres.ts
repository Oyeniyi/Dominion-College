import { closeDatabase, getSqlClient } from '../src/server/db/client';
import { runMigrations } from '../src/server/db/migrations';

async function main(): Promise<void> {
  const sql = getSqlClient();
  try {
    await runMigrations(sql);
    const applied = await sql<{ version: string; name: string; applied_at: Date }[]>`
      SELECT version, name, applied_at
      FROM schema_migrations
      ORDER BY version ASC
    `;
    console.log(
      `PostgreSQL migrations complete. Applied versions (${applied.length}):`,
      applied.map((row) => `${row.version}:${row.name}`).join(', ')
    );
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error('PostgreSQL migration failed:', error);
  process.exit(1);
});
