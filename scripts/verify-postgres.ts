import { closeDatabase, getSqlClient } from '../src/server/db/client';

const EXPECTED_TABLES = [
  'schema_migrations',
  'admin_user',
  'gallery_album',
  'gallery_image',
  'news_article',
  'admissions_enquiry',
  'site_settings',
] as const;

async function main(): Promise<void> {
  const sql = getSqlClient();
  try {
    const ping = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    if (ping[0]?.ok !== 1) {
      throw new Error('PostgreSQL connectivity check returned unexpected result.');
    }

    const tableRows = await sql<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;
    const existingTables = new Set(tableRows.map((r) => r.tablename));
    const missingTables = EXPECTED_TABLES.filter((t) => !existingTables.has(t));

    if (missingTables.length > 0) {
      throw new Error(`Missing expected PostgreSQL tables: ${missingTables.join(', ')}`);
    }

    const counts: Record<string, number> = {};
    for (const table of EXPECTED_TABLES) {
      const result = await sql.unsafe<{ count: string }[]>(`SELECT count(*)::text AS count FROM "${table}"`);
      counts[table] = Number(result[0]?.count ?? 0);
    }

    const indexRows = await sql<{ indexname: string }[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;

    console.log('PostgreSQL verification passed.');
    console.log('Table row counts:', JSON.stringify(counts, null, 2));
    console.log('Public indexes:', indexRows.map((r) => r.indexname).sort().join(', '));
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error('PostgreSQL verification failed:', error);
  process.exit(1);
});
