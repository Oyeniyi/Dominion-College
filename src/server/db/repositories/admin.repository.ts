import { AdminUser } from '@/domain/types';
import { getDatabase } from '../client';
import { SqlClient, toIsoString, toNullableIsoString } from '../types';

export interface AdminUserWithHash extends AdminUser {
  passwordHash: string;
}

function mapAdminUserRow(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    identitySubject: String(row.identity_subject),
    displayName: String(row.display_name),
    email: String(row.email),
    roleCode: String(row.role_code) as AdminUser['roleCode'],
    isActive: Boolean(row.is_active),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    lastLoginAt: toNullableIsoString(row.last_login_at),
  };
}

export async function findAdminByEmail(email: string): Promise<AdminUserWithHash | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT id, identity_subject, display_name, email, password_hash, role_code, is_active, created_at, updated_at, last_login_at
    FROM admin_user
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    ...mapAdminUserRow(row),
    passwordHash: String(row.password_hash || ''),
  };
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT id, identity_subject, display_name, email, role_code, is_active, created_at, updated_at, last_login_at
    FROM admin_user
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0];
  return row ? mapAdminUserRow(row) : null;
}

export async function findAdminPasswordHashById(
  id: string
): Promise<{ id: string; passwordHash: string; isActive: boolean } | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT id, password_hash, is_active
    FROM admin_user
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    passwordHash: String(row.password_hash || ''),
    isActive: Boolean(row.is_active),
  };
}

export async function recordAdminLoginTimestamp(id: string, nowIso: string): Promise<void> {
  const sql = await getDatabase();
  await sql`
    UPDATE admin_user
    SET last_login_at = ${nowIso}, updated_at = ${nowIso}
    WHERE id = ${id}
  `;
}

export async function listAllAdminUsers(): Promise<AdminUser[]> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT id, identity_subject, display_name, email, role_code, is_active, created_at, updated_at, last_login_at
    FROM admin_user
    ORDER BY created_at ASC
  `;
  return rows.map(mapAdminUserRow);
}

export async function countActiveAdminUsers(txClient?: SqlClient): Promise<number> {
  const sql = txClient ?? (await getDatabase());
  const rows = await sql<{ total: string }[]>`
    SELECT COUNT(*)::text as total FROM admin_user WHERE is_active = TRUE
  `;
  return Number(rows[0]?.total ?? 0);
}

export async function insertAdminUser(params: {
  id: string;
  identitySubject: string;
  displayName: string;
  email: string;
  passwordHash: string;
  nowIso: string;
}): Promise<AdminUser> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    INSERT INTO admin_user (
      id, identity_subject, display_name, email, password_hash, role_code, is_active, created_at, updated_at
    ) VALUES (
      ${params.id},
      ${params.identitySubject},
      ${params.displayName},
      ${params.email},
      ${params.passwordHash},
      'administrator',
      TRUE,
      ${params.nowIso},
      ${params.nowIso}
    )
    RETURNING id, identity_subject, display_name, email, role_code, is_active, created_at, updated_at, last_login_at
  `;
  return mapAdminUserRow(rows[0]);
}

export async function updateAdminPasswordHash(
  id: string,
  passwordHash: string,
  nowIso: string
): Promise<void> {
  const sql = await getDatabase();
  await sql`
    UPDATE admin_user
    SET password_hash = ${passwordHash}, updated_at = ${nowIso}
    WHERE id = ${id}
  `;
}

export async function updateAdminUserRecord(params: {
  id: string;
  displayName: string;
  isActive: boolean;
  passwordHash?: string;
  nowIso: string;
}): Promise<AdminUser | null> {
  const sql = await getDatabase();
  const rows = params.passwordHash
    ? await sql<Record<string, unknown>[]>`
        UPDATE admin_user
        SET display_name = ${params.displayName},
            is_active = ${params.isActive},
            password_hash = ${params.passwordHash},
            updated_at = ${params.nowIso}
        WHERE id = ${params.id}
        RETURNING id, identity_subject, display_name, email, role_code, is_active, created_at, updated_at, last_login_at
      `
    : await sql<Record<string, unknown>[]>`
        UPDATE admin_user
        SET display_name = ${params.displayName},
            is_active = ${params.isActive},
            updated_at = ${params.nowIso}
        WHERE id = ${params.id}
        RETURNING id, identity_subject, display_name, email, role_code, is_active, created_at, updated_at, last_login_at
      `;
  return rows[0] ? mapAdminUserRow(rows[0]) : null;
}
