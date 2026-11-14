import fs from 'node:fs';
import path from 'node:path';

function main(): void {
  const sourcePath = path.resolve(
    process.cwd(),
    process.env.SQLITE_SOURCE_PATH || './data/dominion_college.sqlite'
  );

  if (!fs.existsSync(sourcePath)) {
    console.error(`SQLite database file not found at: ${sourcePath}`);
    process.exit(1);
  }

  const backupDir = path.resolve(process.cwd(), './data/backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `dominion_college.${timestamp}.sqlite`);

  fs.copyFileSync(sourcePath, backupPath);

  for (const suffix of ['-wal', '-shm']) {
    const sidecar = `${sourcePath}${suffix}`;
    if (fs.existsSync(sidecar)) {
      fs.copyFileSync(sidecar, `${backupPath}${suffix}`);
    }
  }

  console.log(`SQLite backup created at: ${backupPath}`);
}

main();
