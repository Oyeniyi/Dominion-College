import {
  ContentVerificationStatus,
  GalleryAlbum,
  GalleryImage,
  PublicationStatus,
  PublicGalleryImageProjection,
} from '@/domain/types';
import { getDatabase } from '../client';
import { toIsoString } from '../types';

export function mapGalleryAlbumRow(row: Record<string, unknown>): GalleryAlbum {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    status: String(row.status) as PublicationStatus,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function mapGalleryImageRow(row: Record<string, unknown>): GalleryImage {
  return {
    id: String(row.id),
    albumId: row.album_id ? String(row.album_id) : null,
    storageKey: String(row.storage_key),
    publicUrl: String(row.public_url),
    altText: String(row.alt_text),
    caption: row.caption ? String(row.caption) : null,
    displayOrder: Number(row.display_order),
    status: String(row.status) as PublicationStatus,
    schoolApproved: Boolean(row.school_approved),
    identifiableStudents: Boolean(row.identifiable_students),
    approvalReference: row.approval_reference ? String(row.approval_reference) : null,
    contentStatus: String(row.content_status) as ContentVerificationStatus,
    uploadedBy: String(row.uploaded_by),
    createdAt: toIsoString(row.created_at),
  };
}

function mapPublicGalleryProjectionRow(
  row: Record<string, unknown>
): PublicGalleryImageProjection {
  return {
    id: String(row.id),
    albumId: row.album_id ? String(row.album_id) : null,
    albumTitle: row.album_title ? String(row.album_title) : null,
    imageUrl: String(row.public_url),
    altText: String(row.alt_text),
    caption: row.caption ? String(row.caption) : null,
    displayOrder: Number(row.display_order),
    contentStatus: String(row.content_status) as ContentVerificationStatus,
    createdAt: toIsoString(row.created_at),
  };
}

export async function queryPublishedGalleryAlbums(): Promise<GalleryAlbum[]> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM gallery_album
    WHERE status = 'published'
    ORDER BY created_at ASC
  `;
  return rows.map(mapGalleryAlbumRow);
}

export async function queryPublishedGalleryImages(params: {
  albumSlug?: string | null;
  limit: number;
  offset: number;
}): Promise<PublicGalleryImageProjection[]> {
  const sql = await getDatabase();
  const rows = params.albumSlug
    ? await sql<Record<string, unknown>[]>`
        SELECT gi.id, gi.album_id, gi.public_url, gi.alt_text, gi.caption, gi.display_order, gi.content_status, gi.created_at, ga.title AS album_title
        FROM gallery_image gi
        LEFT JOIN gallery_album ga ON ga.id = gi.album_id
        WHERE gi.status = 'published'
          AND gi.school_approved = TRUE
          AND ga.slug = ${params.albumSlug}
          AND ga.status = 'published'
        ORDER BY gi.display_order ASC, gi.created_at DESC
        LIMIT ${params.limit + 1} OFFSET ${params.offset}
      `
    : await sql<Record<string, unknown>[]>`
        SELECT gi.id, gi.album_id, gi.public_url, gi.alt_text, gi.caption, gi.display_order, gi.content_status, gi.created_at, ga.title AS album_title
        FROM gallery_image gi
        LEFT JOIN gallery_album ga ON ga.id = gi.album_id
        WHERE gi.status = 'published'
          AND gi.school_approved = TRUE
          AND (gi.album_id IS NULL OR ga.status = 'published')
        ORDER BY gi.display_order ASC, gi.created_at DESC
        LIMIT ${params.limit + 1} OFFSET ${params.offset}
      `;
  return rows.map(mapPublicGalleryProjectionRow);
}

export async function queryAdminAlbums(): Promise<GalleryAlbum[]> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM gallery_album ORDER BY updated_at DESC
  `;
  return rows.map(mapGalleryAlbumRow);
}

export async function findAlbumById(id: string): Promise<GalleryAlbum | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM gallery_album WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapGalleryAlbumRow(rows[0]) : null;
}

export async function findAlbumIdBySlug(slug: string): Promise<string | null> {
  const sql = await getDatabase();
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM gallery_album WHERE slug = ${slug} LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

export async function insertGalleryAlbum(params: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: PublicationStatus;
  nowIso: string;
}): Promise<GalleryAlbum> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    INSERT INTO gallery_album (id, title, slug, description, status, created_at, updated_at)
    VALUES (
      ${params.id},
      ${params.title},
      ${params.slug},
      ${params.description},
      ${params.status},
      ${params.nowIso},
      ${params.nowIso}
    )
    RETURNING *
  `;
  return mapGalleryAlbumRow(rows[0]);
}

export async function queryAdminGalleryImages(params: {
  albumId?: string | null;
  status?: PublicationStatus | null;
  limit: number;
  offset: number;
}): Promise<GalleryImage[]> {
  const sql = await getDatabase();
  let rows: Record<string, unknown>[];

  if (params.albumId && params.status) {
    rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM gallery_image
      WHERE album_id = ${params.albumId} AND status = ${params.status}
      ORDER BY display_order ASC, created_at DESC
      LIMIT ${params.limit + 1} OFFSET ${params.offset}
    `;
  } else if (params.albumId) {
    rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM gallery_image
      WHERE album_id = ${params.albumId}
      ORDER BY display_order ASC, created_at DESC
      LIMIT ${params.limit + 1} OFFSET ${params.offset}
    `;
  } else if (params.status) {
    rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM gallery_image
      WHERE status = ${params.status}
      ORDER BY display_order ASC, created_at DESC
      LIMIT ${params.limit + 1} OFFSET ${params.offset}
    `;
  } else {
    rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM gallery_image
      ORDER BY display_order ASC, created_at DESC
      LIMIT ${params.limit + 1} OFFSET ${params.offset}
    `;
  }

  return rows.map(mapGalleryImageRow);
}

export async function findGalleryImageById(id: string): Promise<GalleryImage | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM gallery_image WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapGalleryImageRow(rows[0]) : null;
}

export async function findNewsArticleReferencingImage(
  imageId: string
): Promise<{ id: string; title: string } | null> {
  const sql = await getDatabase();
  const rows = await sql<{ id: string; title: string }[]>`
    SELECT id, title FROM news_article WHERE featured_image_id = ${imageId} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function insertGalleryImage(params: {
  id: string;
  albumId: string | null;
  storageKey: string;
  publicUrl: string;
  altText: string;
  caption: string | null;
  displayOrder: number;
  status: PublicationStatus;
  schoolApproved: boolean;
  identifiableStudents: boolean;
  approvalReference: string | null;
  contentStatus: ContentVerificationStatus;
  uploadedBy: string;
  nowIso: string;
}): Promise<GalleryImage> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    INSERT INTO gallery_image (
      id, album_id, storage_key, public_url, alt_text, caption, display_order,
      status, school_approved, identifiable_students, approval_reference, content_status,
      uploaded_by, created_at
    ) VALUES (
      ${params.id},
      ${params.albumId},
      ${params.storageKey},
      ${params.publicUrl},
      ${params.altText},
      ${params.caption},
      ${params.displayOrder},
      ${params.status},
      ${params.schoolApproved},
      ${params.identifiableStudents},
      ${params.approvalReference},
      ${params.contentStatus},
      ${params.uploadedBy},
      ${params.nowIso}
    )
    RETURNING *
  `;
  return mapGalleryImageRow(rows[0]);
}

export async function updateGalleryImageRecord(params: {
  id: string;
  albumId: string | null;
  publicUrl?: string;
  altText: string;
  caption: string | null;
  displayOrder: number;
  status: PublicationStatus;
  schoolApproved: boolean;
  identifiableStudents: boolean;
  approvalReference: string | null;
  contentStatus: ContentVerificationStatus;
}): Promise<GalleryImage> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    UPDATE gallery_image
    SET album_id = ${params.albumId},
        public_url = COALESCE(${params.publicUrl ?? null}, public_url),
        alt_text = ${params.altText},
        caption = ${params.caption},
        display_order = ${params.displayOrder},
        status = ${params.status},
        school_approved = ${params.schoolApproved},
        identifiable_students = ${params.identifiableStudents},
        approval_reference = ${params.approvalReference},
        content_status = ${params.contentStatus}
    WHERE id = ${params.id}
    RETURNING *
  `;
  return mapGalleryImageRow(rows[0]);
}

export async function deleteGalleryImageById(id: string): Promise<void> {
  const sql = await getDatabase();
  await sql`DELETE FROM gallery_image WHERE id = ${id}`;
}

export async function countGallerySummary(): Promise<{
  total: number;
  publishedCount: number;
  albumCount: number;
}> {
  const sql = await getDatabase();
  const [imageRows, albumRows] = await Promise.all([
    sql<{ total: string; published_count: string }[]>`
      SELECT
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'published')::text as published_count
      FROM gallery_image
    `,
    sql<{ album_count: string }[]>`
      SELECT COUNT(*)::text as album_count FROM gallery_album
    `,
  ]);
  return {
    total: Number(imageRows[0]?.total ?? 0),
    publishedCount: Number(imageRows[0]?.published_count ?? 0),
    albumCount: Number(albumRows[0]?.album_count ?? 0),
  };
}
