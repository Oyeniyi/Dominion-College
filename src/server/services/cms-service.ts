/**
 * Server-Side Application Services (Public Reads, Enquiries, News, Gallery, Settings, Dashboard)
 * Adheres to AE-01 through AE-18, SEC-01 through SEC-20, and TASK-014 through TASK-018.
 */

import crypto from 'node:crypto';
import {
  AdminActor,
  AdminUser,
  AdmissionsEnquiry,
  ApprovedEntryLevel,
  BrandColors,
  ContentVerificationStatus,
  DashboardOverview,
  EnquiryStatus,
  GalleryAlbum,
  GalleryImage,
  InstitutionalContent,
  NewsArticle,
  PaginatedResult,
  PublicationStatus,
  PublicGalleryImageProjection,
  PublicNewsArticleProjection,
  PublicSiteSettingsProjection,
  SiteSettings,
  SocialLink,
} from '@/domain/types';
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/domain/errors';
import {
  assertAuthorized,
  assertGalleryImagePublishable,
  assertValidEnquiryStatusTransition,
  assertValidPublicationTransition,
} from '@/domain/permissions';
import {
  normalizeSlug,
  sanitizeRichTextHtml,
  validateAdminAccountUpdateInput,
  validateChangePasswordInput,
  validateCreateAdminAccountInput,
  validateEnquiryCreateInput,
  validateEnquiryStatusInput,
  validateGalleryImageMetadata,
  validateInstitutionalContentUpdate,
  validateNewsArticleInput,
  validateSiteSettingsUpdate,
} from '@/domain/validation';
import { getDatabase } from '../db/client';
import { DEFAULT_BRAND_COLORS, DEFAULT_INSTITUTIONAL_CONTENT } from '../db/seed-data';
import { hashPassword, verifyPassword } from '../auth/crypto';
import {
  removeStoredMediaBytes,
  storeUploadedImageBytes,
  syncMediaPublicVisibility,
} from './media-storage';

// ============================================================================
// Pagination Helper (Opaque Cursor — API Specification §2)
// ============================================================================

export function encodeOpaqueCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ o: offset }), 'utf8').toString('base64url');
}

export function decodeOpaqueCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { o?: unknown };
    if (typeof parsed.o !== 'number' || !Number.isInteger(parsed.o) || parsed.o < 0) {
      throw new BadRequestError('Invalid pagination cursor.');
    }
    return parsed.o;
  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    throw new BadRequestError('Malformed pagination cursor.');
  }
}

export function parsePageLimit(rawLimit: string | number | null | undefined, defaultLimit = 20): number {
  if (rawLimit === undefined || rawLimit === null || rawLimit === '') {
    return defaultLimit;
  }
  const num = typeof rawLimit === 'number' ? rawLimit : Number(rawLimit);
  if (!Number.isInteger(num) || num < 1 || num > 100) {
    throw new BadRequestError('Pagination limit must be an integer between 1 and 100.');
  }
  return num;
}

// ============================================================================
// Row Mappers
// ============================================================================

function mapAdminUserRow(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    identitySubject: String(row.identity_subject),
    displayName: String(row.display_name),
    email: String(row.email),
    roleCode: String(row.role_code) as AdminUser['roleCode'],
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
  };
}

function mapGalleryImageRow(row: Record<string, unknown>): GalleryImage {
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
    createdAt: String(row.created_at),
  };
}

function mapNewsArticleRow(row: Record<string, unknown>): NewsArticle {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    body: String(row.body),
    featuredImageId: row.featured_image_id ? String(row.featured_image_id) : null,
    status: String(row.status) as PublicationStatus,
    publishedAt: row.published_at ? String(row.published_at) : null,
    authorId: String(row.author_id),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapEnquiryRow(row: Record<string, unknown>): AdmissionsEnquiry {
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
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// ============================================================================
// Authentication & Admin User Lookup (TASK-012)
// ============================================================================

export function authenticateAdminCredentials(email: string, password: string): AdminUser {
  const db = getDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const row = db
    .prepare('SELECT * FROM admin_user WHERE lower(email) = ? LIMIT 1')
    .get(normalizedEmail) as Record<string, unknown> | undefined;

  if (!row) {
    // Generic error message to prevent account enumeration (SEC-01, API §5)
    throw new AuthenticationError('Invalid email or password.');
  }

  const passwordHash = String(row.password_hash || '');
  if (!verifyPassword(password, passwordHash)) {
    throw new AuthenticationError('Invalid email or password.');
  }

  const user = mapAdminUserRow(row);
  if (!user.isActive) {
    throw new AuthorizationError('This administrator account is disabled.');
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE admin_user SET last_login_at = ?, updated_at = ? WHERE id = ?').run(
    now,
    now,
    user.id
  );

  return { ...user, lastLoginAt: now };
}

export function getActiveAdminUserById(id: string): AdminUser | null {
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM admin_user WHERE id = ? LIMIT 1')
    .get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const user = mapAdminUserRow(row);
  return user;
}

// ============================================================================
// Public Read Services (TASK-014 — Explicit Public Projections Only)
// ============================================================================

export function getPublicSiteSettings(): PublicSiteSettingsProjection {
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM site_settings WHERE singleton_id = 1 LIMIT 1')
    .get() as Record<string, unknown> | undefined;

  if (!row) {
    return {
      officialName: 'Dominion College, Oba-Ile, Akure',
      motto: 'THE SECERET OF WISDOM IS GOD',
      logoUrl: '/images/dominion_logo.jpg',
      brandColors: DEFAULT_BRAND_COLORS,
      telephone: null,
      email: 'info@dominioncollege.edu.ng',
      whatsappNumber: null,
      address: 'Oba-Ile, Akure, Ondo State, Nigeria',
      officeHours: 'Monday – Friday: 8:00 AM – 4:00 PM (WAT)',
      directionsUrl: null,
      socialLinks: [],
      defaultSeoTitle: 'Dominion College, Oba-Ile, Akure',
      defaultSeoDescription:
        'Official website of Dominion College, Oba-Ile, Akure, Ondo State, Nigeria.',
    };
  }

  let brandColors = DEFAULT_BRAND_COLORS;
  try {
    brandColors = JSON.parse(String(row.brand_colors)) as BrandColors;
  } catch {
    brandColors = DEFAULT_BRAND_COLORS;
  }

  let socialLinks: SocialLink[] = [];
  try {
    socialLinks = JSON.parse(String(row.social_links || '[]')) as SocialLink[];
  } catch {
    socialLinks = [];
  }

  return {
    officialName: String(row.official_name),
    motto: String(row.motto),
    logoUrl: String(row.logo_url),
    brandColors,
    telephone: row.telephone ? String(row.telephone) : null,
    email: row.email ? String(row.email) : null,
    whatsappNumber: row.whatsapp_number ? String(row.whatsapp_number) : null,
    address: row.address ? String(row.address) : null,
    officeHours: row.office_hours ? String(row.office_hours) : null,
    directionsUrl: row.directions_url ? String(row.directions_url) : null,
    socialLinks,
    defaultSeoTitle: String(row.default_seo_title),
    defaultSeoDescription: String(row.default_seo_description),
  };
}

export function getPublicInstitutionalContent(): InstitutionalContent {
  const db = getDatabase();
  const row = db
    .prepare('SELECT institutional_content FROM site_settings WHERE singleton_id = 1 LIMIT 1')
    .get() as { institutional_content?: string } | undefined;

  if (!row?.institutional_content) {
    return DEFAULT_INSTITUTIONAL_CONTENT;
  }
  try {
    return JSON.parse(row.institutional_content) as InstitutionalContent;
  } catch {
    return DEFAULT_INSTITUTIONAL_CONTENT;
  }
}

export function listPublishedNews(options?: {
  cursor?: string | null;
  limit?: number | string | null;
}): PaginatedResult<PublicNewsArticleProjection> {
  const db = getDatabase();
  const offset = decodeOpaqueCursor(options?.cursor);
  const limit = parsePageLimit(options?.limit, 20);

  const rows = db
    .prepare(
      `SELECT
         n.title, n.slug, n.excerpt, n.body, n.published_at, n.seo_title, n.seo_description,
         g.public_url AS image_url, g.alt_text AS image_alt, g.caption AS image_caption,
         g.status AS image_status, g.school_approved AS image_approved, g.content_status AS image_content_status
       FROM news_article n
       LEFT JOIN gallery_image g ON n.featured_image_id = g.id
       WHERE n.status = 'published' AND n.published_at IS NOT NULL
       ORDER BY n.published_at DESC, n.id ASC
       LIMIT ? OFFSET ?`
    )
    .all(limit + 1, offset) as Array<Record<string, unknown>>;

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;

  const items: PublicNewsArticleProjection[] = slice.map((r) => {
    const canShowImage =
      r.image_url && r.image_status === 'published' && Boolean(r.image_approved);
    return {
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ? String(r.excerpt) : null,
      body: sanitizeRichTextHtml(String(r.body)),
      featuredImage: canShowImage
        ? {
            imageUrl: String(r.image_url),
            altText: String(r.image_alt),
            caption: r.image_caption ? String(r.image_caption) : null,
            contentStatus: String(r.image_content_status) as ContentVerificationStatus,
          }
        : null,
      publishedAt: String(r.published_at),
      seoTitle: r.seo_title ? String(r.seo_title) : null,
      seoDescription: r.seo_description ? String(r.seo_description) : null,
    };
  });

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

/**
 * Resolves a single published article by slug.
 * Draft, unpublished, archived, and nonexistent slugs return indistinguishable NotFoundError (AE-03, FR-06).
 */
export function getPublishedNewsBySlug(slug: string): PublicNewsArticleProjection {
  const db = getDatabase();
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) {
    throw new NotFoundError('The requested news article was not found.');
  }

  const row = db
    .prepare(
      `SELECT
         n.title, n.slug, n.excerpt, n.body, n.published_at, n.seo_title, n.seo_description,
         g.public_url AS image_url, g.alt_text AS image_alt, g.caption AS image_caption,
         g.status AS image_status, g.school_approved AS image_approved, g.content_status AS image_content_status
       FROM news_article n
       LEFT JOIN gallery_image g ON n.featured_image_id = g.id
       WHERE n.slug = ? AND n.status = 'published' AND n.published_at IS NOT NULL
       LIMIT 1`
    )
    .get(cleanSlug) as Record<string, unknown> | undefined;

  if (!row) {
    throw new NotFoundError('The requested news article was not found.');
  }

  const canShowImage =
    row.image_url && row.image_status === 'published' && Boolean(row.image_approved);

  return {
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    body: sanitizeRichTextHtml(String(row.body)),
    featuredImage: canShowImage
      ? {
          imageUrl: String(row.image_url),
          altText: String(row.image_alt),
          caption: row.image_caption ? String(row.image_caption) : null,
          contentStatus: String(row.image_content_status) as ContentVerificationStatus,
        }
      : null,
    publishedAt: String(row.published_at),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
  };
}

export function listPublishedAlbums(): Array<{
  id: string;
  title: string;
  slug: string;
  description: string | null;
}> {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT id, title, slug, description
       FROM gallery_album
       WHERE status = 'published'
       ORDER BY created_at DESC, id ASC`
    )
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    slug: String(r.slug),
    description: r.description ? String(r.description) : null,
  }));
}

/**
 * Lists only published, school-approved gallery images (FR-07, AE-03, SEC-05, SEC-16).
 * If an image belongs to an album, the parent album must also be published.
 * Never returns internal storageKey or approvalReference.
 */
export function listPublishedGalleryImages(options?: {
  albumSlugOrId?: string | null;
  cursor?: string | null;
  limit?: number | string | null;
}): PaginatedResult<PublicGalleryImageProjection> {
  const db = getDatabase();
  const offset = decodeOpaqueCursor(options?.cursor);
  const limit = parsePageLimit(options?.limit, 24);
  const albumFilter = options?.albumSlugOrId?.trim() || null;

  const params: Array<string | number> = [];
  let whereClause = `
    WHERE g.status = 'published'
      AND g.school_approved = 1
      AND (g.identifiable_students = 0 OR (g.approval_reference IS NOT NULL AND length(trim(g.approval_reference)) >= 3))
      AND (g.album_id IS NULL OR a.status = 'published')
  `;

  if (albumFilter) {
    whereClause += ` AND (a.id = ? OR a.slug = ?)`;
    params.push(albumFilter, albumFilter);
  }

  params.push(limit + 1, offset);

  const rows = db
    .prepare(
      `SELECT
         g.id, g.album_id, g.public_url, g.alt_text, g.caption, g.display_order, g.content_status, g.created_at,
         a.title AS album_title
       FROM gallery_image g
       LEFT JOIN gallery_album a ON g.album_id = a.id
       ${whereClause}
       ORDER BY g.display_order ASC, g.created_at DESC, g.id ASC
       LIMIT ? OFFSET ?`
    )
    .all(...params) as Array<Record<string, unknown>>;

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;

  const items: PublicGalleryImageProjection[] = slice.map((r) => ({
    id: String(r.id),
    albumId: r.album_id ? String(r.album_id) : null,
    albumTitle: r.album_title ? String(r.album_title) : null,
    imageUrl: String(r.public_url),
    altText: String(r.alt_text),
    caption: r.caption ? String(r.caption) : null,
    displayOrder: Number(r.display_order),
    contentStatus: String(r.content_status) as ContentVerificationStatus,
    createdAt: String(r.created_at),
  }));

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

// ============================================================================
// Admissions Enquiry Services (TASK-015 — FR-04, AE-05, AE-09)
// ============================================================================

export function createAdmissionsEnquiry(rawPayload: unknown): {
  message: string;
  createdId: string;
  deduplicated: boolean;
} {
  const input = validateEnquiryCreateInput(rawPayload);
  const db = getDatabase();
  const now = new Date().toISOString();

  db.exec('BEGIN IMMEDIATE');
  try {
    // Check explicit idempotency key or recent identical submission within 2 minutes (FR-04 duplicate prevention)
    if (input.idempotencyKey) {
      const existingByKey = db
        .prepare('SELECT id FROM admissions_enquiry WHERE idempotency_key = ? LIMIT 1')
        .get(input.idempotencyKey) as { id: string } | undefined;
      if (existingByKey) {
        db.exec('COMMIT');
        return {
          message: 'Enquiry received.',
          createdId: existingByKey.id,
          deduplicated: true,
        };
      }
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const recentDuplicate = db
      .prepare(
        `SELECT id FROM admissions_enquiry
         WHERE parent_name = ? AND phone = ? AND entry_level = ? AND COALESCE(message, '') = ?
           AND created_at >= ?
         LIMIT 1`
      )
      .get(
        input.parentName,
        input.phone,
        input.entryLevel,
        input.message ?? '',
        twoMinutesAgo
      ) as { id: string } | undefined;

    if (recentDuplicate) {
      db.exec('COMMIT');
      return {
        message: 'Enquiry received.',
        createdId: recentDuplicate.id,
        deduplicated: true,
      };
    }

    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO admissions_enquiry (
        id, parent_name, phone, email, entry_level, message,
        privacy_acknowledged, status, assigned_to, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 'new', NULL, ?, ?, ?)`
    ).run(
      id,
      input.parentName,
      input.phone,
      input.email,
      input.entryLevel,
      input.message,
      input.idempotencyKey,
      now,
      now
    );

    db.exec('COMMIT');
    return {
      message: 'Enquiry received.',
      createdId: id,
      deduplicated: false,
    };
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // Ignore rollback error
    }
    throw err;
  }
}

export function listAdminEnquiries(
  actor: AdminActor | null,
  options?: {
    status?: string | null;
    cursor?: string | null;
    limit?: number | string | null;
  }
): PaginatedResult<AdmissionsEnquiry> {
  assertAuthorized(actor, 'enquiries:read');
  const db = getDatabase();
  const offset = decodeOpaqueCursor(options?.cursor);
  const limit = parsePageLimit(options?.limit, 20);

  const statusFilter = options?.status?.trim() || null;
  const validStatuses = ['new', 'contacted', 'resolved', 'archived'];
  if (statusFilter && !validStatuses.includes(statusFilter)) {
    throw new BadRequestError('Invalid enquiry status filter.');
  }

  const params: Array<string | number> = [];
  let where = '';
  if (statusFilter) {
    where = 'WHERE status = ?';
    params.push(statusFilter);
  }
  params.push(limit + 1, offset);

  const rows = db
    .prepare(
      `SELECT * FROM admissions_enquiry
       ${where}
       ORDER BY created_at DESC, id ASC
       LIMIT ? OFFSET ?`
    )
    .all(...params) as Array<Record<string, unknown>>;

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: slice.map(mapEnquiryRow),
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export function getAdminEnquiryById(actor: AdminActor | null, id: string): AdmissionsEnquiry {
  assertAuthorized(actor, 'enquiries:read');
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM admissions_enquiry WHERE id = ? LIMIT 1')
    .get(id.trim()) as Record<string, unknown> | undefined;

  if (!row) {
    throw new NotFoundError('Enquiry record not found.');
  }
  return mapEnquiryRow(row);
}

export function updateAdminEnquiryStatus(
  actor: AdminActor | null,
  id: string,
  rawPayload: unknown
): AdmissionsEnquiry {
  assertAuthorized(actor, 'enquiries:update');
  const { status, assignedTo } = validateEnquiryStatusInput(rawPayload);
  const db = getDatabase();

  const existingRow = db
    .prepare('SELECT * FROM admissions_enquiry WHERE id = ? LIMIT 1')
    .get(id.trim()) as Record<string, unknown> | undefined;

  if (!existingRow) {
    throw new NotFoundError('Enquiry record not found.');
  }

  const existing = mapEnquiryRow(existingRow);
  assertValidEnquiryStatusTransition(existing.status, status);

  let nextAssignedTo = existing.assignedTo;
  if (assignedTo !== undefined) {
    if (assignedTo === null) {
      nextAssignedTo = null;
    } else {
      const targetAdmin = getActiveAdminUserById(assignedTo);
      if (!targetAdmin || !targetAdmin.isActive) {
        throw new ConflictError('Assigned administrator does not exist or is inactive.');
      }
      nextAssignedTo = targetAdmin.id;
    }
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE admissions_enquiry
     SET status = ?, assigned_to = ?, updated_at = ?
     WHERE id = ?`
  ).run(status, nextAssignedTo, now, existing.id);

  return getAdminEnquiryById(actor, existing.id);
}

// ============================================================================
// Admin Dashboard Overview (TASK-023 — FR-09 Persisted Counts Only)
// ============================================================================

export function getAdminDashboardOverview(
  actor: AdminActor | null,
  recentLimit = 5
): DashboardOverview {
  assertAuthorized(actor, 'dashboard:read');
  const db = getDatabase();
  const boundedLimit = parsePageLimit(recentLimit, 5);

  const publishedNewsCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM news_article WHERE status = 'published'")
      .get() as { c: number }
  ).c;

  const draftNewsCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM news_article WHERE status = 'draft'")
      .get() as { c: number }
  ).c;

  const publishedGalleryCount = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM gallery_image WHERE status = 'published' AND school_approved = 1"
      )
      .get() as { c: number }
  ).c;

  const totalGalleryCount = (
    db.prepare('SELECT COUNT(*) as c FROM gallery_image').get() as { c: number }
  ).c;

  const albumCount = (
    db.prepare('SELECT COUNT(*) as c FROM gallery_album').get() as { c: number }
  ).c;

  const newEnquiriesCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM admissions_enquiry WHERE status = 'new'")
      .get() as { c: number }
  ).c;

  const totalEnquiriesCount = (
    db.prepare('SELECT COUNT(*) as c FROM admissions_enquiry').get() as { c: number }
  ).c;

  const recentRows = db
    .prepare(
      `SELECT id, parent_name, entry_level, status, created_at
       FROM admissions_enquiry
       ORDER BY created_at DESC, id ASC
       LIMIT ?`
    )
    .all(boundedLimit) as Array<Record<string, unknown>>;

  return {
    publishedNewsCount,
    draftNewsCount,
    publishedGalleryCount,
    totalGalleryCount,
    albumCount,
    newEnquiriesCount,
    totalEnquiriesCount,
    recentEnquiries: recentRows.map((r) => ({
      id: String(r.id),
      parentName: String(r.parent_name),
      entryLevel: String(r.entry_level) as ApprovedEntryLevel,
      status: String(r.status) as EnquiryStatus,
      createdAt: String(r.created_at),
    })),
  };
}

// ============================================================================
// Admin News Management Services (TASK-016 — FR-06, FR-09)
// ============================================================================

export function listAdminNews(
  actor: AdminActor | null,
  options?: {
    status?: string | null;
    cursor?: string | null;
    limit?: number | string | null;
  }
): PaginatedResult<NewsArticle> {
  assertAuthorized(actor, 'content:read');
  const db = getDatabase();
  const offset = decodeOpaqueCursor(options?.cursor);
  const limit = parsePageLimit(options?.limit, 20);
  const statusFilter = options?.status?.trim() || null;

  const validStatuses = ['draft', 'published', 'unpublished', 'archived'];
  if (statusFilter && !validStatuses.includes(statusFilter)) {
    throw new BadRequestError('Invalid article status filter.');
  }

  const params: Array<string | number> = [];
  let where = '';
  if (statusFilter) {
    where = 'WHERE status = ?';
    params.push(statusFilter);
  }
  params.push(limit + 1, offset);

  const rows = db
    .prepare(
      `SELECT * FROM news_article
       ${where}
       ORDER BY updated_at DESC, created_at DESC, id ASC
       LIMIT ? OFFSET ?`
    )
    .all(...params) as Array<Record<string, unknown>>;

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: slice.map(mapNewsArticleRow),
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export function getAdminNewsById(actor: AdminActor | null, id: string): NewsArticle {
  assertAuthorized(actor, 'content:read');
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM news_article WHERE id = ? LIMIT 1')
    .get(id.trim()) as Record<string, unknown> | undefined;

  if (!row) {
    throw new NotFoundError('News article not found.');
  }
  return mapNewsArticleRow(row);
}

function assertFeaturedImageEligible(
  featuredImageId: string | null,
  articleStatus: PublicationStatus
): void {
  if (!featuredImageId) return;
  const db = getDatabase();
  const imgRow = db
    .prepare('SELECT * FROM gallery_image WHERE id = ? LIMIT 1')
    .get(featuredImageId) as Record<string, unknown> | undefined;

  if (!imgRow) {
    throw new ConflictError('Selected featured image does not exist.');
  }
  const img = mapGalleryImageRow(imgRow);
  if (articleStatus === 'published' && (img.status !== 'published' || !img.schoolApproved)) {
    throw new ConflictError(
      'A published news article can only reference a featured image that is school-approved and published.'
    );
  }
}

export function createAdminNews(actor: AdminActor | null, rawPayload: unknown): NewsArticle {
  assertAuthorized(actor, 'content:create');
  const input = validateNewsArticleInput(rawPayload);
  if (input.status === 'published') {
    assertAuthorized(actor, 'content:publish');
  }

  const db = getDatabase();
  const existingSlug = db
    .prepare('SELECT id FROM news_article WHERE slug = ? LIMIT 1')
    .get(input.slug) as { id: string } | undefined;

  if (existingSlug) {
    throw new ConflictError(`An article with slug '${input.slug}' already exists.`, [
      {
        field: 'slug',
        code: 'DUPLICATE_SLUG',
        message: 'Choose a unique URL slug for this article.',
      },
    ]);
  }

  assertFeaturedImageEligible(input.featuredImageId, input.status);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO news_article (
      id, title, slug, excerpt, body, featured_image_id, status, published_at,
      author_id, seo_title, seo_description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.title,
    input.slug,
    input.excerpt,
    input.body,
    input.featuredImageId,
    input.status,
    input.status === 'published' ? input.publishedAt || now : input.publishedAt,
    actor!.id,
    input.seoTitle,
    input.seoDescription,
    now,
    now
  );

  return getAdminNewsById(actor, id);
}

export function updateAdminNews(
  actor: AdminActor | null,
  id: string,
  rawPayload: unknown
): NewsArticle {
  assertAuthorized(actor, 'content:update');
  const existing = getAdminNewsById(actor, id);

  const mergedPayload = {
    title: existing.title,
    slug: existing.slug,
    excerpt: existing.excerpt,
    body: existing.body,
    featuredImageId: existing.featuredImageId,
    status: existing.status,
    publishedAt: existing.publishedAt,
    seoTitle: existing.seoTitle,
    seoDescription: existing.seoDescription,
    ...(rawPayload && typeof rawPayload === 'object' ? (rawPayload as Record<string, unknown>) : {}),
  };

  const input = validateNewsArticleInput(mergedPayload);
  assertValidPublicationTransition(existing.status, input.status);

  if (input.status === 'published' || existing.status === 'published') {
    assertAuthorized(actor, 'content:publish');
  }

  const db = getDatabase();
  const conflictSlug = db
    .prepare('SELECT id FROM news_article WHERE slug = ? AND id <> ? LIMIT 1')
    .get(input.slug, existing.id) as { id: string } | undefined;

  if (conflictSlug) {
    throw new ConflictError(`Another article already uses the slug '${input.slug}'.`, [
      {
        field: 'slug',
        code: 'DUPLICATE_SLUG',
        message: 'Choose a unique URL slug for this article.',
      },
    ]);
  }

  assertFeaturedImageEligible(input.featuredImageId, input.status);

  const now = new Date().toISOString();
  const nextPublishedAt =
    input.status === 'published' ? input.publishedAt || existing.publishedAt || now : existing.publishedAt;

  db.prepare(
    `UPDATE news_article
     SET title = ?, slug = ?, excerpt = ?, body = ?, featured_image_id = ?,
         status = ?, published_at = ?, seo_title = ?, seo_description = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    input.title,
    input.slug,
    input.excerpt,
    input.body,
    input.featuredImageId,
    input.status,
    nextPublishedAt,
    input.seoTitle,
    input.seoDescription,
    now,
    existing.id
  );

  return getAdminNewsById(actor, existing.id);
}

/**
 * Generates an authenticated, non-persisted, sanitized preview representation (FR-06, API §4).
 */
export function previewAdminNews(
  actor: AdminActor | null,
  rawPayload: unknown
): PublicNewsArticleProjection {
  assertAuthorized(actor, 'content:read');
  const input = validateNewsArticleInput(rawPayload);
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: sanitizeRichTextHtml(input.body),
    featuredImage: null,
    publishedAt: input.publishedAt || new Date().toISOString(),
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  };
}

export function deleteAdminNews(actor: AdminActor | null, id: string): void {
  assertAuthorized(actor, 'content:delete');
  const existing = getAdminNewsById(actor, id);
  const db = getDatabase();
  db.prepare('DELETE FROM news_article WHERE id = ?').run(existing.id);
}

// ============================================================================
// Admin Gallery & Media Services (TASK-017 — FR-07, SEC-09, SEC-16)
// ============================================================================

export function listAdminAlbums(actor: AdminActor | null): GalleryAlbum[] {
  assertAuthorized(actor, 'gallery:read');
  const db = getDatabase();
  const rows = db
    .prepare('SELECT * FROM gallery_album ORDER BY created_at DESC, id ASC')
    .all() as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    slug: String(r.slug),
    description: r.description ? String(r.description) : null,
    status: String(r.status) as PublicationStatus,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

export function createAdminAlbum(
  actor: AdminActor | null,
  rawPayload: unknown
): GalleryAlbum {
  assertAuthorized(actor, 'gallery:upload');
  if (!rawPayload || typeof rawPayload !== 'object') {
    throw new BadRequestError('Album input must be an object.');
  }
  const record = rawPayload as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!title || title.length < 2 || title.length > 120) {
    throw new BadRequestError('Album title is required (2 to 120 characters).');
  }
  const slug =
    typeof record.slug === 'string' && record.slug.trim()
      ? normalizeSlug(record.slug)
      : normalizeSlug(title);
  const description =
    typeof record.description === 'string' && record.description.trim()
      ? record.description.trim().slice(0, 400)
      : null;
  const status: PublicationStatus =
    record.status === 'published' || record.status === 'unpublished' || record.status === 'archived'
      ? record.status
      : 'published';

  const db = getDatabase();
  const existingSlug = db
    .prepare('SELECT id FROM gallery_album WHERE slug = ? LIMIT 1')
    .get(slug) as { id: string } | undefined;
  if (existingSlug) {
    throw new ConflictError(`An album with slug '${slug}' already exists.`);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO gallery_album (id, title, slug, description, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, title, slug, description, status, now, now);

  return {
    id,
    title,
    slug,
    description,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

export function listAdminGalleryImages(
  actor: AdminActor | null,
  options?: {
    albumId?: string | null;
    status?: string | null;
    cursor?: string | null;
    limit?: number | string | null;
  }
): PaginatedResult<Omit<GalleryImage, 'storageKey'>> {
  assertAuthorized(actor, 'gallery:read');
  const db = getDatabase();
  const offset = decodeOpaqueCursor(options?.cursor);
  const limit = parsePageLimit(options?.limit, 30);

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (options?.albumId?.trim()) {
    conditions.push('album_id = ?');
    params.push(options.albumId.trim());
  }
  if (options?.status?.trim()) {
    conditions.push('status = ?');
    params.push(options.status.trim());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit + 1, offset);

  const rows = db
    .prepare(
      `SELECT * FROM gallery_image
       ${where}
       ORDER BY display_order ASC, created_at DESC, id ASC
       LIMIT ? OFFSET ?`
    )
    .all(...params) as Array<Record<string, unknown>>;

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: slice.map((r) => {
      const full = mapGalleryImageRow(r);
      const { storageKey: _omitStorageKey, ...safeAdminProjection } = full;
      return safeAdminProjection;
    }),
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export function uploadAdminGalleryImage(
  actor: AdminActor | null,
  options: {
    fileBuffer?: Buffer | null;
    placeholderUrl?: string | null;
    metadata: Record<string, unknown>;
  }
): Omit<GalleryImage, 'storageKey'> {
  assertAuthorized(actor, 'gallery:upload');
  const validated = validateGalleryImageMetadata(options.metadata);

  if (validated.status === 'published') {
    assertAuthorized(actor, 'gallery:publish');
  }
  assertGalleryImagePublishable(validated);

  const db = getDatabase();
  if (validated.albumId) {
    const albumExists = db
      .prepare('SELECT id FROM gallery_album WHERE id = ? LIMIT 1')
      .get(validated.albumId) as { id: string } | undefined;
    if (!albumExists) {
      throw new ConflictError('Selected gallery album does not exist.');
    }
  }

  let storageKey: string;
  let publicUrl: string;
  let contentStatus = validated.contentStatus;

  const allowedPlaceholders = new Set([
    '/placeholders/campus-hero.svg',
    '/placeholders/science-lab.svg',
    '/placeholders/library-study.svg',
    '/placeholders/classroom-learning.svg',
    '/placeholders/sports-activities.svg',
    '/placeholders/news-announcement.svg',
  ]);

  if (options.fileBuffer && options.fileBuffer.length > 0) {
    const stored = storeUploadedImageBytes({
      buffer: options.fileBuffer,
      publishImmediately: validated.status === 'published' && validated.schoolApproved,
    });
    storageKey = stored.storageKey;
    publicUrl = stored.publicUrl;
  } else if (options.placeholderUrl && allowedPlaceholders.has(options.placeholderUrl)) {
    storageKey = `placeholder:${crypto.randomUUID()}:${path.basename(options.placeholderUrl)}`;
    publicUrl = options.placeholderUrl;
    contentStatus = 'placeholder';
  } else {
    throw new BadRequestError('Provide a valid image file to upload or select an approved placeholder visual.');
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    db.prepare(
      `INSERT INTO gallery_image (
        id, album_id, storage_key, public_url, alt_text, caption, display_order,
        status, school_approved, identifiable_students, approval_reference, content_status, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      validated.albumId,
      storageKey,
      publicUrl,
      validated.altText,
      validated.caption,
      validated.displayOrder,
      validated.status,
      validated.schoolApproved ? 1 : 0,
      validated.identifiableStudents ? 1 : 0,
      validated.approvalReference,
      contentStatus,
      actor!.id,
      now
    );
  } catch (err) {
    // Clean up staged/public bytes if database persistence fails (AE-09)
    removeStoredMediaBytes(storageKey);
    throw err;
  }

  const createdRow = db
    .prepare('SELECT * FROM gallery_image WHERE id = ? LIMIT 1')
    .get(id) as Record<string, unknown>;
  const { storageKey: _omit, ...projection } = mapGalleryImageRow(createdRow);
  return projection;
}

import path from 'node:path';

export function updateAdminGalleryImage(
  actor: AdminActor | null,
  id: string,
  rawPayload: unknown
): Omit<GalleryImage, 'storageKey'> {
  assertAuthorized(actor, 'gallery:update');
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    throw new BadRequestError('Gallery update payload must be an object.');
  }
  const record = rawPayload as Record<string, unknown>;
  if ('storageKey' in record || 'storage_key' in record) {
    throw new BadRequestError('Storage key cannot be modified by clients.');
  }

  const db = getDatabase();
  const existingRow = db
    .prepare('SELECT * FROM gallery_image WHERE id = ? LIMIT 1')
    .get(id.trim()) as Record<string, unknown> | undefined;

  if (!existingRow) {
    throw new NotFoundError('Gallery image not found.');
  }
  const existing = mapGalleryImageRow(existingRow);

  const merged = {
    altText: existing.altText,
    caption: existing.caption,
    albumId: existing.albumId,
    displayOrder: existing.displayOrder,
    status: existing.status,
    schoolApproved: existing.schoolApproved,
    identifiableStudents: existing.identifiableStudents,
    approvalReference: existing.approvalReference,
    contentStatus: existing.contentStatus,
    ...record,
  };

  const validated = validateGalleryImageMetadata(merged);
  assertValidPublicationTransition(existing.status, validated.status);

  if (validated.status === 'published' || existing.status === 'published') {
    assertAuthorized(actor, 'gallery:publish');
  }
  assertGalleryImagePublishable(validated);

  db.prepare(
    `UPDATE gallery_image
     SET album_id = ?, alt_text = ?, caption = ?, display_order = ?,
         status = ?, school_approved = ?, identifiable_students = ?, approval_reference = ?, content_status = ?
     WHERE id = ?`
  ).run(
    validated.albumId,
    validated.altText,
    validated.caption,
    validated.displayOrder,
    validated.status,
    validated.schoolApproved ? 1 : 0,
    validated.identifiableStudents ? 1 : 0,
    validated.approvalReference,
    validated.contentStatus,
    existing.id
  );

  syncMediaPublicVisibility({
    storageKey: existing.storageKey,
    isPubliclyVisible: validated.status === 'published' && validated.schoolApproved,
  });

  const updatedRow = db
    .prepare('SELECT * FROM gallery_image WHERE id = ? LIMIT 1')
    .get(existing.id) as Record<string, unknown>;
  const { storageKey: _omit, ...projection } = mapGalleryImageRow(updatedRow);
  return projection;
}

export function deleteAdminGalleryImage(actor: AdminActor | null, id: string): void {
  assertAuthorized(actor, 'gallery:delete');
  const db = getDatabase();
  const existingRow = db
    .prepare('SELECT * FROM gallery_image WHERE id = ? LIMIT 1')
    .get(id.trim()) as Record<string, unknown> | undefined;

  if (!existingRow) {
    throw new NotFoundError('Gallery image not found.');
  }
  const existing = mapGalleryImageRow(existingRow);

  const referencedArticle = db
    .prepare('SELECT id, title FROM news_article WHERE featured_image_id = ? LIMIT 1')
    .get(existing.id) as { id: string; title: string } | undefined;

  if (referencedArticle) {
    throw new ConflictError(
      `Cannot delete this image while it is referenced as the featured image of article "${referencedArticle.title}". Remove or replace the article's featured image first.`
    );
  }

  // Private-first removal before DB deletion (AE-09)
  syncMediaPublicVisibility({ storageKey: existing.storageKey, isPubliclyVisible: false });
  db.prepare('DELETE FROM gallery_image WHERE id = ?').run(existing.id);
  removeStoredMediaBytes(existing.storageKey);
}

// ============================================================================
// Admin Settings & Institutional Content Services (TASK-018 — FR-02, FR-03, FR-08)
// ============================================================================

export function getAdminSiteSettings(actor: AdminActor | null): SiteSettings {
  assertAuthorized(actor, 'settings:read');
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM site_settings WHERE singleton_id = 1 LIMIT 1')
    .get() as Record<string, unknown>;

  return {
    singletonId: 1,
    officialName: String(row.official_name),
    motto: String(row.motto),
    logoUrl: String(row.logo_url),
    brandColors: JSON.parse(String(row.brand_colors)) as BrandColors,
    telephone: row.telephone ? String(row.telephone) : null,
    email: row.email ? String(row.email) : null,
    whatsappNumber: row.whatsapp_number ? String(row.whatsapp_number) : null,
    address: row.address ? String(row.address) : null,
    officeHours: row.office_hours ? String(row.office_hours) : null,
    directionsUrl: row.directions_url ? String(row.directions_url) : null,
    socialLinks: JSON.parse(String(row.social_links || '[]')) as SocialLink[],
    defaultSeoTitle: String(row.default_seo_title),
    defaultSeoDescription: String(row.default_seo_description),
    updatedAt: String(row.updated_at),
  };
}

export function updateAdminSiteSettings(
  actor: AdminActor | null,
  rawPayload: unknown
): SiteSettings {
  assertAuthorized(actor, 'settings:update');
  const validated = validateSiteSettingsUpdate(rawPayload);
  const current = getAdminSiteSettings(actor);
  const db = getDatabase();
  const now = new Date().toISOString();

  const nextOfficialName = validated.officialName ?? current.officialName;
  const nextMotto = validated.motto ?? current.motto;
  const nextTelephone = validated.telephone !== undefined ? validated.telephone : current.telephone;
  const nextEmail = validated.email !== undefined ? validated.email : current.email;
  const nextWhatsapp =
    validated.whatsappNumber !== undefined ? validated.whatsappNumber : current.whatsappNumber;
  const nextAddress = validated.address !== undefined ? validated.address : current.address;
  const nextOfficeHours =
    validated.officeHours !== undefined ? validated.officeHours : current.officeHours;
  const nextDirectionsUrl =
    validated.directionsUrl !== undefined ? validated.directionsUrl : current.directionsUrl;
  const nextSocialLinks = validated.socialLinks ?? current.socialLinks;
  const nextBrandColors = validated.brandColors ?? current.brandColors;
  const nextSeoTitle = validated.defaultSeoTitle ?? current.defaultSeoTitle;
  const nextSeoDescription = validated.defaultSeoDescription ?? current.defaultSeoDescription;

  db.prepare(
    `UPDATE site_settings
     SET official_name = ?, motto = ?, brand_colors = ?, telephone = ?, email = ?,
         whatsapp_number = ?, address = ?, office_hours = ?, directions_url = ?,
         social_links = ?, default_seo_title = ?, default_seo_description = ?, updated_at = ?
     WHERE singleton_id = 1`
  ).run(
    nextOfficialName,
    nextMotto,
    JSON.stringify(nextBrandColors),
    nextTelephone,
    nextEmail,
    nextWhatsapp,
    nextAddress,
    nextOfficeHours,
    nextDirectionsUrl,
    JSON.stringify(nextSocialLinks),
    nextSeoTitle,
    nextSeoDescription,
    now
  );

  return getAdminSiteSettings(actor);
}

export function getAdminInstitutionalContent(actor: AdminActor | null): InstitutionalContent {
  assertAuthorized(actor, 'content:read');
  return getPublicInstitutionalContent();
}

export function updateAdminInstitutionalContent(
  actor: AdminActor | null,
  rawPayload: unknown
): InstitutionalContent {
  assertAuthorized(actor, 'content:update');
  const current = getPublicInstitutionalContent();
  const updated = validateInstitutionalContentUpdate(rawPayload, current);
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE site_settings
     SET institutional_content = ?, updated_at = ?
     WHERE singleton_id = 1`
  ).run(JSON.stringify(updated), now);

  return getPublicInstitutionalContent();
}

// ============================================================================
// Admin Staff Account & Password Management Services
// ============================================================================

export function listAdminUsers(actor: AdminActor | null): AdminUser[] {
  assertAuthorized(actor, 'users:read');
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT id, identity_subject, display_name, email, role_code, is_active, created_at, updated_at, last_login_at
       FROM admin_user
       ORDER BY created_at ASC`
    )
    .all() as Record<string, unknown>[];
  return rows.map(mapAdminUserRow);
}

export function createAdminUser(actor: AdminActor | null, rawPayload: unknown): AdminUser {
  assertAuthorized(actor, 'users:create');
  const input = validateCreateAdminAccountInput(rawPayload);
  const db = getDatabase();

  const existing = db
    .prepare('SELECT id FROM admin_user WHERE lower(email) = lower(?) LIMIT 1')
    .get(input.email) as { id?: string } | undefined;
  if (existing?.id) {
    throw new ConflictError('An administrator account with this email already exists.');
  }

  const id = crypto.randomUUID();
  const identitySubject = `local:${input.email}`;
  const passwordHash = hashPassword(input.password);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO admin_user (
      id, identity_subject, display_name, email, password_hash, role_code, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'administrator', 1, ?, ?)`
  ).run(id, identitySubject, input.displayName, input.email, passwordHash, now, now);

  const created = getActiveAdminUserById(id);
  if (!created) {
    throw new Error('Failed to load newly created administrator account.');
  }
  return created;
}

export function changeOwnAdminPassword(actor: AdminActor | null, rawPayload: unknown): void {
  if (!actor || !actor.id || !actor.isActive) {
    throw new AuthorizationError('Active authenticated administrator context is required.');
  }
  const input = validateChangePasswordInput(rawPayload);
  const db = getDatabase();

  const row = db
    .prepare('SELECT id, password_hash, is_active FROM admin_user WHERE id = ? LIMIT 1')
    .get(actor.id) as { id?: string; password_hash?: string; is_active?: number } | undefined;

  if (!row || !row.id || !row.is_active) {
    throw new AuthorizationError('This administrator account is unavailable.');
  }

  if (!verifyPassword(input.currentPassword, String(row.password_hash || ''))) {
    throw new AuthenticationError('Current password is incorrect.');
  }

  const nextHash = hashPassword(input.newPassword);
  const now = new Date().toISOString();
  db.prepare('UPDATE admin_user SET password_hash = ?, updated_at = ? WHERE id = ?').run(
    nextHash,
    now,
    actor.id
  );
}

export function updateAdminUserAccount(
  actor: AdminActor | null,
  targetUserId: string,
  rawPayload: unknown
): AdminUser {
  assertAuthorized(actor, 'users:update');
  const input = validateAdminAccountUpdateInput(rawPayload);
  const db = getDatabase();

  const existingRow = db
    .prepare('SELECT * FROM admin_user WHERE id = ? LIMIT 1')
    .get(targetUserId) as Record<string, unknown> | undefined;
  if (!existingRow) {
    throw new NotFoundError('Administrator account not found.');
  }
  const existing = mapAdminUserRow(existingRow);

  if (input.isActive === false) {
    if (actor && actor.id === existing.id) {
      throw new ConflictError('You cannot deactivate your own currently signed-in account.');
    }
    const activeCountRow = db
      .prepare('SELECT COUNT(*) as total FROM admin_user WHERE is_active = 1')
      .get() as { total?: number } | undefined;
    if ((activeCountRow?.total ?? 0) <= 1 && existing.isActive) {
      throw new ConflictError('At least one active administrator account must remain.');
    }
  }

  const nextDisplayName = input.displayName ?? existing.displayName;
  const nextIsActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.isActive ? 1 : 0;
  const now = new Date().toISOString();

  if (input.newPassword) {
    const nextHash = hashPassword(input.newPassword);
    db.prepare(
      `UPDATE admin_user
       SET display_name = ?, is_active = ?, password_hash = ?, updated_at = ?
       WHERE id = ?`
    ).run(nextDisplayName, nextIsActive, nextHash, now, targetUserId);
  } else {
    db.prepare(
      `UPDATE admin_user
       SET display_name = ?, is_active = ?, updated_at = ?
       WHERE id = ?`
    ).run(nextDisplayName, nextIsActive, now, targetUserId);
  }

  const updated = getActiveAdminUserById(targetUserId);
  if (!updated) {
    throw new NotFoundError('Administrator account not found after update.');
  }
  return updated;
}

