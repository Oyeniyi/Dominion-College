/**
 * Server-Only SQLite Connection Manager
 * Uses Node.js built-in `node:sqlite` (`DatabaseSync`).
 * Adheres to AE-06 (server-only, parameterized queries, reviewed migrations).
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { getServerConfig } from '../config';
import { runMigrations } from './migrations';
import { seedInitialDataIfEmpty } from './seed-data';

let activeDb: DatabaseSync | null = null;
let activeDbPath: string | null = null;

export function getDatabase(): DatabaseSync {
  const config = getServerConfig();

  if (activeDb && activeDbPath === config.databasePath) {
    return activeDb;
  }

  if (config.databasePath !== ':memory:') {
    const dir = path.dirname(config.databasePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(config.databasePath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (config.databasePath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  runMigrations(db);
  seedInitialDataIfEmpty(db);

  activeDb = db;
  activeDbPath = config.databasePath;
  return db;
}

/**
 * Replaces the active database with a fresh in-memory or custom database for deterministic testing.
 */
export function resetDatabaseForTests(options?: { seed?: boolean }): DatabaseSync {
  if (activeDb) {
    try {
      activeDb.close();
    } catch {
      // Ignore already-closed errors
    }
  }
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  runMigrations(db);
  if (options?.seed !== false) {
    seedInitialDataIfEmpty(db);
  }
  activeDb = db;
  activeDbPath = ':memory:';
  return db;
}

