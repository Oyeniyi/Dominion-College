/**
 * Server-Only Supabase Storage Admin Client
 * Uses SUPABASE_SERVICE_ROLE_KEY strictly on the server; never expose to the browser.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerConfig } from '../config';

const globalForStorage = globalThis as unknown as {
  __dominionSupabaseAdmin?: SupabaseClient;
  __dominionSupabaseUrl?: string;
  __dominionSupabaseKey?: string;
  __dominionSupabaseTestOverride?: SupabaseClient | null;
};

export function setSupabaseStorageClientForTests(client: SupabaseClient | null): void {
  globalForStorage.__dominionSupabaseTestOverride = client;
}

export function getSupabaseStorageAdminClient(): SupabaseClient {
  if (globalForStorage.__dominionSupabaseTestOverride) {
    return globalForStorage.__dominionSupabaseTestOverride;
  }

  const config = getServerConfig();
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error(
      'Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  if (
    globalForStorage.__dominionSupabaseAdmin &&
    globalForStorage.__dominionSupabaseUrl === config.supabaseUrl &&
    globalForStorage.__dominionSupabaseKey === config.supabaseServiceRoleKey
  ) {
    return globalForStorage.__dominionSupabaseAdmin;
  }

  const client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  globalForStorage.__dominionSupabaseAdmin = client;
  globalForStorage.__dominionSupabaseUrl = config.supabaseUrl;
  globalForStorage.__dominionSupabaseKey = config.supabaseServiceRoleKey;
  return client;
}

export function getSupabaseStorageBuckets(): {
  stagingBucket: string;
  publicBucket: string;
} {
  const config = getServerConfig();
  return {
    stagingBucket: config.supabaseStorageStagingBucket,
    publicBucket: config.supabaseStoragePublicBucket,
  };
}
