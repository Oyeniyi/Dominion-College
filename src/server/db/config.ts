/**
 * Server-Only PostgreSQL Database Configuration
 * Reads DATABASE_URL (or TEST_DATABASE_URL in test environments).
 * Never expose connection strings to client components.
 */

export interface PostgresConfig {
  connectionString: string;
  ssl: 'require' | 'prefer' | false;
  maxConnections: number;
  prepare: boolean;
  idleTimeoutSeconds: number;
  connectTimeoutSeconds: number;
}

function isLocalHostname(connectionString: string): boolean {
  try {
    const parsed = new URL(connectionString);
    return (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1'
    );
  } catch {
    return false;
  }
}

export function getPostgresConfig(env: NodeJS.ProcessEnv = process.env): PostgresConfig {
  const isTest = env.NODE_ENV === 'test';
  const isProd = env.NODE_ENV === 'production';

  const connectionString = (
    (isTest ? env.TEST_DATABASE_URL || env.DATABASE_URL : env.DATABASE_URL) || ''
  ).trim();

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not configured. Set DATABASE_URL to your Supabase PostgreSQL connection string.'
    );
  }

  const localHost = isLocalHostname(connectionString);
  const sslMode = (env.DATABASE_SSL || '').trim().toLowerCase();
  let ssl: PostgresConfig['ssl'] = localHost ? 'prefer' : 'require';
  if (sslMode === 'disable' || sslMode === 'false') {
    ssl = false;
  } else if (sslMode === 'require') {
    ssl = 'require';
  }

  const parsedMax = Number(env.DATABASE_POOL_MAX);
  const maxConnections =
    Number.isInteger(parsedMax) && parsedMax >= 1 && parsedMax <= 20
      ? parsedMax
      : isProd
        ? 1
        : 5;

  // Disable prepared statements by default for Supabase PgBouncer transaction pooling (port 6543)
  const prepare = env.DATABASE_PREPARE === 'true';

  return {
    connectionString,
    ssl,
    maxConnections,
    prepare,
    idleTimeoutSeconds: 20,
    connectTimeoutSeconds: 15,
  };
}
