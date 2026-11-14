/**
 * Server Runtime Configuration & Validation
 * Adheres to AE-07 and SEC-11. Never import this module in client components.
 */

export interface ServerConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  siteUrl: string;
  sessionSecret: string;
  bootstrapAdminEmail: string;
  bootstrapAdminPassword: string;
  bootstrapAdminName: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseStorageStagingBucket: string;
  supabaseStoragePublicBucket: string;
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

  return {
    nodeEnv: rawEnv,
    siteUrl: (env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    sessionSecret,
    bootstrapAdminEmail: (
      env.BOOTSTRAP_ADMIN_EMAIL || (isProd ? '' : 'admin@dominioncollege.edu.ng')
    )
      .trim()
      .toLowerCase(),
    bootstrapAdminPassword:
      env.BOOTSTRAP_ADMIN_PASSWORD || (isProd ? '' : 'DominionAdmin!2026'),
    bootstrapAdminName: (env.BOOTSTRAP_ADMIN_NAME || 'Dominion College Administrator').trim(),
    supabaseUrl: (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, ''),
    supabaseServiceRoleKey: (env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    supabaseStorageStagingBucket: (
      env.SUPABASE_STORAGE_STAGING_BUCKET || 'dominion-media-staging'
    ).trim(),
    supabaseStoragePublicBucket: (
      env.SUPABASE_STORAGE_PUBLIC_BUCKET || 'dominion-media-public'
    ).trim(),
    schoolTimezone: env.SCHOOL_TIMEZONE || 'Africa/Lagos',
  };
}
