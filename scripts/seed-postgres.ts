import { closeDatabase, getSqlClient } from '../src/server/db/client';
import { runMigrations } from '../src/server/db/migrations';
import { seedInitialDataIfEmpty } from '../src/server/db/seed-data';

async function main(): Promise<void> {
  const sql = getSqlClient();
  try {
    await runMigrations(sql);
    await seedInitialDataIfEmpty(sql);
    console.log('PostgreSQL seed check complete.');
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error('PostgreSQL seed failed:', error);
  process.exit(1);
});
