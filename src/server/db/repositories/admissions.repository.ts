import { AdmissionsEnquiry, ApprovedEntryLevel, EnquiryStatus } from '@/domain/types';
import { getDatabase } from '../client';
import { SqlClient, toIsoString } from '../types';

export function mapEnquiryRow(row: Record<string, unknown>): AdmissionsEnquiry {
  return {
    id: String(row.id),
    parentName: String(row.parent_name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    entryLevel: String(row.entry_level) as ApprovedEntryLevel,
    message: row.message ? String(row.message) : null,
    privacyAcknowledged: Boolean(row.privacy_acknowledged),
    status: String(row.status) as EnquiryStatus,
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    idempotencyKey: row.idempotency_key ? String(row.idempotency_key) : null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function findEnquiryByIdempotencyKey(
  tx: SqlClient,
  idempotencyKey: string
): Promise<string | null> {
  const rows = await tx<{ id: string }[]>`
    SELECT id FROM admissions_enquiry WHERE idempotency_key = ${idempotencyKey} LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

export async function findRecentDuplicateEnquiry(
  tx: SqlClient,
  params: {
    parentName: string;
    phone: string;
    entryLevel: string;
    message: string;
    sinceIso: string;
  }
): Promise<string | null> {
  const rows = await tx<{ id: string }[]>`
    SELECT id FROM admissions_enquiry
    WHERE parent_name = ${params.parentName}
      AND phone = ${params.phone}
      AND entry_level = ${params.entryLevel}
      AND COALESCE(message, '') = ${params.message}
      AND created_at >= ${params.sinceIso}
    LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

export async function insertAdmissionsEnquiry(
  tx: SqlClient,
  params: {
    id: string;
    parentName: string;
    phone: string;
    email: string | null;
    entryLevel: ApprovedEntryLevel;
    message: string | null;
    idempotencyKey: string | null;
    nowIso: string;
  }
): Promise<void> {
  await tx`
    INSERT INTO admissions_enquiry (
      id, parent_name, phone, email, entry_level, message,
      privacy_acknowledged, status, assigned_to, idempotency_key, created_at, updated_at
    ) VALUES (
      ${params.id},
      ${params.parentName},
      ${params.phone},
      ${params.email},
      ${params.entryLevel},
      ${params.message},
      TRUE,
      'new',
      NULL,
      ${params.idempotencyKey},
      ${params.nowIso},
      ${params.nowIso}
    )
  `;
}

export async function queryEnquiries(params: {
  status?: EnquiryStatus | null;
  limit: number;
  offset: number;
}): Promise<AdmissionsEnquiry[]> {
  const sql = await getDatabase();
  const rows = params.status
    ? await sql<Record<string, unknown>[]>`
        SELECT * FROM admissions_enquiry
        WHERE status = ${params.status}
        ORDER BY created_at DESC
        LIMIT ${params.limit + 1} OFFSET ${params.offset}
      `
    : await sql<Record<string, unknown>[]>`
        SELECT * FROM admissions_enquiry
        ORDER BY created_at DESC
        LIMIT ${params.limit + 1} OFFSET ${params.offset}
      `;
  return rows.map(mapEnquiryRow);
}

export async function findEnquiryById(id: string): Promise<AdmissionsEnquiry | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM admissions_enquiry WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapEnquiryRow(rows[0]) : null;
}

export async function updateEnquiryRecord(params: {
  id: string;
  status: EnquiryStatus;
  assignedTo: string | null;
  nowIso: string;
}): Promise<AdmissionsEnquiry> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    UPDATE admissions_enquiry
    SET status = ${params.status},
        assigned_to = ${params.assignedTo},
        updated_at = ${params.nowIso}
    WHERE id = ${params.id}
    RETURNING *
  `;
  return mapEnquiryRow(rows[0]);
}

export async function countEnquiriesSummary(): Promise<{
  total: number;
  newCount: number;
}> {
  const sql = await getDatabase();
  const rows = await sql<{ total: string; new_count: string }[]>`
    SELECT
      COUNT(*)::text as total,
      COUNT(*) FILTER (WHERE status = 'new')::text as new_count
    FROM admissions_enquiry
  `;
  return {
    total: Number(rows[0]?.total ?? 0),
    newCount: Number(rows[0]?.new_count ?? 0),
  };
}
