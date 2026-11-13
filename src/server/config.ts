/**
 * Server Runtime Configuration & Validation
 * Adheres to AE-07 and SEC-11. Never import this module in client components.
 */

import path from 'node:path';

export interface ServerConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  siteUrl: string;
  databasePath: string;
  sessionSecret: string;
  bootstrapAdminEmail: string;
  bootstrapAdminPassword: string;
  bootstrapAdminName: string;
  mediaStagingDir: string;
  mediaPublicDir: string;
  schoolTimezone: string;
}

const DEFAULT_DEV_SESSION_SECRET =
  'dominion-college-dev-only-session-secret-key-min-32-bytes-2026';

export function getServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const rawEnv = (env.NODE_ENV || 'development') as ServerConfig['nodeEnv'];
  const isProd = rawEnv === 'production';
  const isBuildPhase = env.NEXT_PHASE === 'phase-production-build';

  const sessionSecret =
    env.SESSION_SECRET?.trim() || (isProd && !isBuildPhase ? '' : DEFAULT_DEV_SESSION_SECRET);
  if (sessionSecret.length < 32) {
    throw new Error(
      'CRITICAL CONFIGURATION ERROR: SESSION_SECRET must be set and at least 32 characters long.'
    );
  }

  const databasePath =
    env.DATABASE_PATH?.trim() ||
    (rawEnv === 'test'
      ? ':memory:'
      : path.join(process.cwd(), 'data', 'dominion_college.sqlite'));

  return {
    nodeEnv: rawEnv,
    siteUrl: (env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    databasePath,
    sessionSecret,
    bootstrapAdminEmail: (env.BOOTSTRAP_ADMIN_EMAIL || 'admin@dominioncollege.edu.ng')
      .trim()
      .toLowerCase(),
    bootstrapAdminPassword: env.BOOTSTRAP_ADMIN_PASSWORD || 'DominionAdmin!2026',
    bootstrapAdminName: (env.BOOTSTRAP_ADMIN_NAME || 'Dominion College Administrator').trim(),
    mediaStagingDir:
      env.MEDIA_STAGING_DIR || path.join(process.cwd(), 'data', 'staging-uploads'),
    mediaPublicDir: env.MEDIA_PUBLIC_DIR || path.join(process.cwd(), 'public', 'uploads'),
    schoolTimezone: env.SCHOOL_TIMEZONE || 'Africa/Lagos',
  };
}

