/**
 * Server-Side Application Services (Public Reads, Enquiries, News, Gallery, Settings, Dashboard, Staff)
 * Async PostgreSQL implementation delegating persistence to parameterized repositories.
 * Adheres to AE-01 through AE-18, SEC-01 through SEC-20, and TASK-014 through TASK-018.
 */

import crypto from 'node:crypto';
import {
  AdminActor,
  AdminUser,
  AdmissionsEnquiry,
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
import type { SqlClient } from '../db/types';
import {
  countActiveAdminUsers,
  findAdminByEmail,
  findAdminById,
  findAdminPasswordHashById,
  insertAdminUser,
  listAllAdminUsers,
  recordAdminLoginTimestamp,
  updateAdminPasswordHash,
  updateAdminUserRecord,
} from '../db/repositories/admin.repository';
import {
  fetchInstitutionalContent,
  fetchSiteSettingsRow,
  mapAdminSiteSettings,
  mapPublicSiteSettings,
  updateInstitutionalContentRow,
  updateSiteSettingsRow,
} from '../db/repositories/settings.repository';
import {
  countEnquiriesSummary,
  findEnquiryById,
  findEnquiryByIdempotencyKey,
  findRecentDuplicateEnquiry,
  insertAdmissionsEnquiry,
  queryEnquiries,
  updateEnquiryRecord,
} from '../db/repositories/admissions.repository';
import {
  countNewsSummary,
  deleteNewsArticleById,
  findNewsById,
  findNewsIdBySlug,
  findPublishedNewsBySlug,
  insertNewsArticle,
  queryAdminNews,
  queryPublishedNews,
  updateNewsArticleRecord,
} from '../db/repositories/news.repository';
import {
  countGallerySummary,
  deleteGalleryImageById,
  findAlbumById,
  findAlbumIdBySlug,
  findGalleryImageById,
  findNewsArticleReferencingImage,
  insertGalleryAlbum,
  insertGalleryImage,
  queryAdminAlbums,
  queryAdminGalleryImages,
  queryPublishedGalleryAlbums,
  queryPublishedGalleryImages,
  updateGalleryImageRecord,
} from '../db/repositories/gallery.repository';
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

export function parsePageLimit(
  rawLimit: string | number | null | undefined,
  defaultLimit = 20
): number {
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
// Authentication & Admin User Lookup (TASK-012)
// ============================================================================

export async function authenticateAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const userWithHash = await findAdminByEmail(normalizedEmail);

  if (!userWithHash) {
    throw new AuthenticationError('Invalid email or password.');
  }

  if (!verifyPassword(password, userWithHash.passwordHash)) {
    throw new AuthenticationError('Invalid email or password.');
  }

  if (!userWithHash.isActive) {
    throw new AuthorizationError('This administrator account is disabled.');
  }

  const now = new Date().toISOString();
  await recordAdminLoginTimestamp(userWithHash.id, now);

  const { passwordHash: _omitted, ...user } = userWithHash;
  return { ...user, lastLoginAt: now };
}

export async function getActiveAdminUserById(id: string): Promise<AdminUser | null> {
  return findAdminById(id);
}

// ============================================================================
// Public Read Services (TASK-014 — Explicit Public Projections Only)
// ============================================================================

export async function getPublicSiteSettings(): Promise<PublicSiteSettingsProjection> {
  const row = await fetchSiteSettingsRow();
  return mapPublicSiteSettings(row);
}

export async function getPublicInstitutionalContent(): Promise<InstitutionalContent> {
  return fetchInstitutionalContent();
}

export async function listPublishedNews(options?: {
  cursor?: string | null;
  limit?: string | number | null;
}): Promise<PaginatedResult<PublicNewsArticleProjection>> {
  const limit = parsePageLimit(options?.limit, 10);
  const offset = decodeOpaqueCursor(options?.cursor);

  const rows = await queryPublishedNews(limit, offset);
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export async function getPublishedNewsBySlug(
  rawSlug: string
): Promise<PublicNewsArticleProjection> {
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    throw new NotFoundError('News article not found.');
  }
  const article = await findPublishedNewsBySlug(slug);
  if (!article) {
    throw new NotFoundError('News article not found.');
  }
  return article;
}

export async function listPublishedGalleryAlbums(): Promise<GalleryAlbum[]> {
  return queryPublishedGalleryAlbums();
}

export const listPublishedAlbums = listPublishedGalleryAlbums;

export async function listPublishedGalleryImages(options?: {
  albumSlug?: string | null;
  albumSlugOrId?: string | null;
  cursor?: string | null;
  limit?: string | number | null;
}): Promise<PaginatedResult<PublicGalleryImageProjection>> {
  const limit = parsePageLimit(options?.limit, 24);
  const offset = decodeOpaqueCursor(options?.cursor);
  const rawAlbum = options?.albumSlug ?? options?.albumSlugOrId;
  const albumSlug = rawAlbum ? normalizeSlug(rawAlbum) : null;

  const rows = await queryPublishedGalleryImages({ albumSlug, limit, offset });
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

// ============================================================================
// Admissions Enquiry Service (TASK-015 — Transactional + Idempotent)
// ============================================================================

export async function createAdmissionsEnquiry(rawPayload: unknown): Promise<{
  message: string;
  createdId: string;
  deduplicated: boolean;
}> {
  const input = validateEnquiryCreateInput(rawPayload);
  const sql = await getDatabase();
  const now = new Date().toISOString();

  return sql.begin(async (tx) => {
    const txSql = tx as unknown as SqlClient;

    if (input.idempotencyKey) {
      const existingId = await findEnquiryByIdempotencyKey(txSql, input.idempotencyKey);
      if (existingId) {
        return {
          message: 'Enquiry received.',
          createdId: existingId,
          deduplicated: true,
        };
      }
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const recentId = await findRecentDuplicateEnquiry(txSql, {
      parentName: input.parentName,
      phone: input.phone,
      entryLevel: input.entryLevel,
      message: input.message ?? '',
      sinceIso: twoMinutesAgo,
    });

    if (recentId) {
      return {
        message: 'Enquiry received.',
        createdId: recentId,
        deduplicated: true,
      };
    }

    const id = crypto.randomUUID();
    await insertAdmissionsEnquiry(txSql, {
      id,
      parentName: input.parentName,
      phone: input.phone,
      email: input.email,
      entryLevel: input.entryLevel,
      message: input.message,
      idempotencyKey: input.idempotencyKey,
      nowIso: now,
    });

    return {
      message: 'Enquiry received.',
      createdId: id,
      deduplicated: false,
    };
  });
}

export async function listAdminEnquiries(
  actor: AdminActor | null,
  options?: {
    status?: string | null;
    cursor?: string | null;
    limit?: string | number | null;
  }
): Promise<PaginatedResult<AdmissionsEnquiry>> {
  assertAuthorized(actor, 'enquiries:read');
  const limit = parsePageLimit(options?.limit, 20);
  const offset = decodeOpaqueCursor(options?.cursor);

  const validStatuses: EnquiryStatus[] = ['new', 'contacted', 'resolved', 'archived'];
  const statusFilter =
    options?.status && validStatuses.includes(options.status as EnquiryStatus)
      ? (options.status as EnquiryStatus)
      : null;

  if (options?.status && !statusFilter) {
    throw new BadRequestError('Invalid enquiry status filter.');
  }

  const rows = await queryEnquiries({ status: statusFilter, limit, offset });
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export async function getAdminEnquiryById(
  actor: AdminActor | null,
  enquiryId: string
): Promise<AdmissionsEnquiry> {
  assertAuthorized(actor, 'enquiries:read');
  if (!enquiryId || !enquiryId.trim()) {
    throw new BadRequestError('Enquiry ID is required.');
  }
  const existing = await findEnquiryById(enquiryId.trim());
  if (!existing) {
    throw new NotFoundError('Admissions enquiry not found.');
  }
  return existing;
}

export async function updateAdminEnquiryStatus(
  actor: AdminActor | null,
  enquiryId: string,
  rawPayload: unknown
): Promise<AdmissionsEnquiry> {
  assertAuthorized(actor, 'enquiries:update');
  if (!enquiryId || !enquiryId.trim()) {
    throw new BadRequestError('Enquiry ID is required.');
  }

  const input = validateEnquiryStatusInput(rawPayload);
  const existing = await findEnquiryById(enquiryId.trim());
  if (!existing) {
    throw new NotFoundError('Admissions enquiry not found.');
  }

  assertValidEnquiryStatusTransition(existing.status, input.status);

  let nextAssignedTo = existing.assignedTo;
  if (input.assignedTo !== undefined) {
    if (input.assignedTo === null) {
      nextAssignedTo = null;
    } else {
      const assignee = await findAdminById(input.assignedTo);
      if (!assignee || !assignee.isActive) {
        throw new BadRequestError('Assigned administrator must be an active administrator.');
      }
      nextAssignedTo = assignee.id;
    }
  }

  const now = new Date().toISOString();
  return updateEnquiryRecord({
    id: existing.id,
    status: input.status,
    assignedTo: nextAssignedTo,
    nowIso: now,
  });
}

// ============================================================================
// Admin Dashboard Overview (TASK-018)
// ============================================================================

export async function getAdminDashboardOverview(
  actor: AdminActor | null
): Promise<DashboardOverview> {
  assertAuthorized(actor, 'dashboard:read');

  const [enquiryCounts, newsCounts, galleryCounts, recentEnquiries] = await Promise.all([
    countEnquiriesSummary(),
    countNewsSummary(),
    countGallerySummary(),
    queryEnquiries({ status: null, limit: 5, offset: 0 }),
  ]);

  return {
    newEnquiriesCount: enquiryCounts.newCount,
    totalEnquiriesCount: enquiryCounts.total,
    publishedNewsCount: newsCounts.publishedCount,
    draftNewsCount: newsCounts.draftCount,
    publishedGalleryCount: galleryCounts.publishedCount,
    totalGalleryCount: galleryCounts.total,
    albumCount: galleryCounts.albumCount,
    recentEnquiries: recentEnquiries.slice(0, 5),
  };
}

// ============================================================================
// News CMS Services (TASK-016)
// ============================================================================

export async function listAdminNews(
  actor: AdminActor | null,
  options?: {
    status?: string | null;
    cursor?: string | null;
    limit?: string | number | null;
  }
): Promise<PaginatedResult<NewsArticle>> {
  assertAuthorized(actor, 'content:read');
  const limit = parsePageLimit(options?.limit, 20);
  const offset = decodeOpaqueCursor(options?.cursor);

  const validStatuses: PublicationStatus[] = ['draft', 'published', 'unpublished', 'archived'];
  const statusFilter =
    options?.status && validStatuses.includes(options.status as PublicationStatus)
      ? (options.status as PublicationStatus)
      : null;

  if (options?.status && !statusFilter) {
    throw new BadRequestError('Invalid news status filter.');
  }

  const rows = await queryAdminNews({ status: statusFilter, limit, offset });
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export async function getAdminNewsById(
  actor: AdminActor | null,
  id: string
): Promise<NewsArticle> {
  assertAuthorized(actor, 'content:read');
  if (!id || !id.trim()) {
    throw new BadRequestError('Article ID is required.');
  }
  const article = await findNewsById(id.trim());
  if (!article) {
    throw new NotFoundError('News article not found.');
  }
  return article;
}

export function previewNewsBodyHtml(actor: AdminActor | null, rawBody: string): string {
  assertAuthorized(actor, 'content:read');
  return sanitizeRichTextHtml(rawBody);
}

export function previewAdminNews(
  actor: AdminActor | null,
  rawPayload: unknown
): { sanitizedHtml: string } {
  assertAuthorized(actor, 'content:read');
  const rawBody =
    typeof rawPayload === 'string'
      ? rawPayload
      : typeof (rawPayload as { body?: unknown })?.body === 'string'
        ? String((rawPayload as { body: string }).body)
        : '';
  return { sanitizedHtml: sanitizeRichTextHtml(rawBody) };
}

async function validateFeaturedImageEligibility(
  featuredImageId: string | null,
  targetStatus: PublicationStatus
): Promise<void> {
  if (!featuredImageId) return;
  const img = await findGalleryImageById(featuredImageId);
  if (!img) {
    throw new BadRequestError('Selected featured image does not exist.');
  }
  if (targetStatus === 'published' && (img.status !== 'published' || !img.schoolApproved)) {
    throw new BadRequestError(
      'A published news article can only reference a published, school-approved gallery image.'
    );
  }
}

export async function createAdminNews(
  actor: AdminActor | null,
  rawPayload: unknown
): Promise<NewsArticle> {
  assertAuthorized(actor, 'content:create');
  const input = validateNewsArticleInput(rawPayload);
  if (input.status === 'published') {
    assertAuthorized(actor, 'content:publish');
  }

  const existingSlugId = await findNewsIdBySlug(input.slug);
  if (existingSlugId) {
    throw new ConflictError(`An article with slug '${input.slug}' already exists.`);
  }

  await validateFeaturedImageEligibility(input.featuredImageId, input.status);

  const now = new Date().toISOString();
  const publishedAt =
    input.status === 'published' ? input.publishedAt || now : input.publishedAt;

  return insertNewsArticle({
    id: crypto.randomUUID(),
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: input.body,
    featuredImageId: input.featuredImageId,
    status: input.status,
    publishedAt,
    authorId: actor!.id,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    nowIso: now,
  });
}

export async function updateAdminNews(
  actor: AdminActor | null,
  id: string,
  rawPayload: unknown
): Promise<NewsArticle> {
  assertAuthorized(actor, 'content:update');
  if (!id || !id.trim()) {
    throw new BadRequestError('Article ID is required.');
  }

  const existing = await findNewsById(id.trim());
  if (!existing) {
    throw new NotFoundError('News article not found.');
  }

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
    ...(typeof rawPayload === 'object' && rawPayload !== null ? rawPayload : {}),
  };

  const input = validateNewsArticleInput(mergedPayload);
  assertValidPublicationTransition(existing.status, input.status);

  if (input.status === 'published' && existing.status !== 'published') {
    assertAuthorized(actor, 'content:publish');
  }

  const slugConflictId = await findNewsIdBySlug(input.slug, existing.id);
  if (slugConflictId) {
    throw new ConflictError(`An article with slug '${input.slug}' already exists.`);
  }

  await validateFeaturedImageEligibility(input.featuredImageId, input.status);

  const now = new Date().toISOString();
  const publishedAt =
    input.status === 'published' ? input.publishedAt || existing.publishedAt || now : input.publishedAt;

  return updateNewsArticleRecord({
    id: existing.id,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: input.body,
    featuredImageId: input.featuredImageId,
    status: input.status,
    publishedAt,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    nowIso: now,
  });
}

export async function deleteAdminNews(actor: AdminActor | null, id: string): Promise<void> {
  assertAuthorized(actor, 'content:delete');
  if (!id || !id.trim()) {
    throw new BadRequestError('Article ID is required.');
  }
  const existing = await findNewsById(id.trim());
  if (!existing) {
    throw new NotFoundError('News article not found.');
  }
  await deleteNewsArticleById(existing.id);
}

// ============================================================================
// Gallery Album & Image Services (TASK-017)
// ============================================================================

export async function listAdminAlbums(actor: AdminActor | null): Promise<GalleryAlbum[]> {
  assertAuthorized(actor, 'gallery:read');
  return queryAdminAlbums();
}

export async function createAdminAlbum(
  actor: AdminActor | null,
  rawPayload: unknown
): Promise<GalleryAlbum> {
  assertAuthorized(actor, 'gallery:upload');
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    throw new BadRequestError('Album payload must be an object.');
  }
  const record = rawPayload as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const slug = normalizeSlug(typeof record.slug === 'string' && record.slug ? record.slug : title);
  const description = typeof record.description === 'string' ? record.description.trim() || null : null;
  const status: PublicationStatus =
    record.status === 'published' ||
    record.status === 'draft' ||
    record.status === 'unpublished' ||
    record.status === 'archived'
      ? record.status
      : 'published';

  if (title.length < 2 || title.length > 140) {
    throw new BadRequestError('Album title must be between 2 and 140 characters.');
  }
  if (!slug) {
    throw new BadRequestError('Valid album slug is required.');
  }

  const existingId = await findAlbumIdBySlug(slug);
  if (existingId) {
    throw new ConflictError(`Album slug '${slug}' already exists.`);
  }

  const now = new Date().toISOString();
  return insertGalleryAlbum({
    id: crypto.randomUUID(),
    title,
    slug,
    description,
    status,
    nowIso: now,
  });
}

export async function listAdminGalleryImages(
  actor: AdminActor | null,
  options?: {
    albumId?: string | null;
    status?: string | null;
    cursor?: string | null;
    limit?: string | number | null;
  }
): Promise<PaginatedResult<GalleryImage>> {
  assertAuthorized(actor, 'gallery:read');
  const limit = parsePageLimit(options?.limit, 30);
  const offset = decodeOpaqueCursor(options?.cursor);

  const validStatuses: PublicationStatus[] = ['draft', 'published', 'unpublished', 'archived'];
  const statusFilter =
    options?.status && validStatuses.includes(options.status as PublicationStatus)
      ? (options.status as PublicationStatus)
      : null;

  if (options?.status && !statusFilter) {
    throw new BadRequestError('Invalid gallery status filter.');
  }

  const rows = await queryAdminGalleryImages({
    albumId: options?.albumId?.trim() || null,
    status: statusFilter,
    limit,
    offset,
  });
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);

  return {
    items,
    nextCursor: hasMore ? encodeOpaqueCursor(offset + limit) : null,
  };
}

export async function uploadAdminGalleryImage(
  actor: AdminActor | null,
  params: {
    fileBuffer?: Buffer;
    metadata: unknown;
    placeholderUrl?: string;
  }
): Promise<GalleryImage> {
  assertAuthorized(actor, 'gallery:upload');
  const meta = validateGalleryImageMetadata((params.metadata ?? {}) as Record<string, unknown>);

  if (meta.status === 'published') {
    assertAuthorized(actor, 'gallery:publish');
    assertGalleryImagePublishable({
      status: meta.status,
      schoolApproved: meta.schoolApproved,
      identifiableStudents: meta.identifiableStudents,
      approvalReference: meta.approvalReference,
    });
  }

  if (meta.albumId) {
    const album = await findAlbumById(meta.albumId);
    if (!album) {
      throw new BadRequestError('Selected gallery album does not exist.');
    }
  }

  let storageKey: string;
  let publicUrl: string;
  let contentStatus: ContentVerificationStatus = meta.contentStatus;

  if (params.fileBuffer) {
    const stored = await storeUploadedImageBytes({
      buffer: params.fileBuffer,
      publishImmediately: meta.status === 'published' && meta.schoolApproved,
    });
    storageKey = stored.storageKey;
    publicUrl = stored.publicUrl;
  } else if (params.placeholderUrl && params.placeholderUrl.startsWith('/placeholders/')) {
    storageKey = `placeholder:${pathBasenameSafe(params.placeholderUrl)}:${crypto.randomUUID()}`;
    publicUrl = params.placeholderUrl;
    contentStatus = 'placeholder';
  } else {
    throw new BadRequestError('An image file upload (JPEG, PNG, or WebP) is required.');
  }

  const now = new Date().toISOString();
  try {
    return await insertGalleryImage({
      id: crypto.randomUUID(),
      albumId: meta.albumId,
      storageKey,
      publicUrl,
      altText: meta.altText,
      caption: meta.caption,
      displayOrder: meta.displayOrder,
      status: meta.status,
      schoolApproved: meta.schoolApproved,
      identifiableStudents: meta.identifiableStudents,
      approvalReference: meta.approvalReference,
      contentStatus,
      uploadedBy: actor!.id,
      nowIso: now,
    });
  } catch (error) {
    if (!storageKey.startsWith('placeholder:')) {
      await removeStoredMediaBytes(storageKey).catch(() => {});
    }
    throw error;
  }
}

function pathBasenameSafe(p: string): string {
  return p.split('/').filter(Boolean).pop() || 'placeholder.svg';
}

export async function updateAdminGalleryImage(
  actor: AdminActor | null,
  imageId: string,
  rawPayload: unknown
): Promise<GalleryImage> {
  assertAuthorized(actor, 'gallery:update');
  if (!imageId || !imageId.trim()) {
    throw new BadRequestError('Image ID is required.');
  }

  const existing = await findGalleryImageById(imageId.trim());
  if (!existing) {
    throw new NotFoundError('Gallery image not found.');
  }

  const merged = {
    albumId: existing.albumId,
    altText: existing.altText,
    caption: existing.caption,
    displayOrder: existing.displayOrder,
    status: existing.status,
    schoolApproved: existing.schoolApproved,
    identifiableStudents: existing.identifiableStudents,
    approvalReference: existing.approvalReference,
    contentStatus: existing.contentStatus,
    ...(typeof rawPayload === 'object' && rawPayload !== null ? rawPayload : {}),
  };

  const meta = validateGalleryImageMetadata(merged);
  assertValidPublicationTransition(existing.status, meta.status);

  if (meta.status === 'published') {
    if (existing.status !== 'published') {
      assertAuthorized(actor, 'gallery:publish');
    }
    assertGalleryImagePublishable({
      status: meta.status,
      schoolApproved: meta.schoolApproved,
      identifiableStudents: meta.identifiableStudents,
      approvalReference: meta.approvalReference,
    });
  }

  if (meta.albumId) {
    const album = await findAlbumById(meta.albumId);
    if (!album) {
      throw new BadRequestError('Selected gallery album does not exist.');
    }
  }

  let updatedPublicUrl: string | undefined;
  if (!existing.storageKey.startsWith('placeholder:')) {
    const shouldBePublic = meta.status === 'published' && meta.schoolApproved;
    const synced = await syncMediaPublicVisibility({
      storageKey: existing.storageKey,
      isPubliclyVisible: shouldBePublic,
    });
    if (synced.publicUrl) {
      updatedPublicUrl = synced.publicUrl;
    }
  }

  return updateGalleryImageRecord({
    id: existing.id,
    albumId: meta.albumId,
    publicUrl: updatedPublicUrl,
    altText: meta.altText,
    caption: meta.caption,
    displayOrder: meta.displayOrder,
    status: meta.status,
    schoolApproved: meta.schoolApproved,
    identifiableStudents: meta.identifiableStudents,
    approvalReference: meta.approvalReference,
    contentStatus: meta.contentStatus,
  });
}

export async function deleteAdminGalleryImage(
  actor: AdminActor | null,
  imageId: string
): Promise<void> {
  assertAuthorized(actor, 'gallery:delete');
  if (!imageId || !imageId.trim()) {
    throw new BadRequestError('Image ID is required.');
  }

  const existing = await findGalleryImageById(imageId.trim());
  if (!existing) {
    throw new NotFoundError('Gallery image not found.');
  }

  const referencingArticle = await findNewsArticleReferencingImage(existing.id);
  if (referencingArticle) {
    throw new ConflictError(
      `Cannot delete image while it is referenced by news article '${referencingArticle.title}'.`
    );
  }

  await deleteGalleryImageById(existing.id);

  if (!existing.storageKey.startsWith('placeholder:')) {
    await removeStoredMediaBytes(existing.storageKey);
  }
}

// ============================================================================
// Site Settings & Institutional Content Admin Services (TASK-018)
// ============================================================================

export async function getAdminSiteSettings(actor: AdminActor | null): Promise<SiteSettings> {
  assertAuthorized(actor, 'settings:read');
  const row = await fetchSiteSettingsRow();
  if (!row) {
    throw new NotFoundError('Site settings not initialized.');
  }
  return mapAdminSiteSettings(row);
}

export async function updateAdminSiteSettings(
  actor: AdminActor | null,
  rawPayload: unknown
): Promise<SiteSettings> {
  assertAuthorized(actor, 'settings:update');
  const input = validateSiteSettingsUpdate(rawPayload);
  const current = await getAdminSiteSettings(actor);

  const nextOfficialName = input.officialName ?? current.officialName;
  const nextMotto = input.motto ?? current.motto;
  const nextBrandColors: BrandColors = input.brandColors ?? current.brandColors;
  const nextTelephone = input.telephone !== undefined ? input.telephone : current.telephone;
  const nextEmail = input.email !== undefined ? input.email : current.email;
  const nextWhatsapp =
    input.whatsappNumber !== undefined ? input.whatsappNumber : current.whatsappNumber;
  const nextAddress = input.address !== undefined ? input.address : current.address;
  const nextOfficeHours =
    input.officeHours !== undefined ? input.officeHours : current.officeHours;
  const nextDirectionsUrl =
    input.directionsUrl !== undefined ? input.directionsUrl : current.directionsUrl;
  const nextSocialLinks = input.socialLinks ?? current.socialLinks;
  const nextSeoTitle = input.defaultSeoTitle ?? current.defaultSeoTitle;
  const nextSeoDescription = input.defaultSeoDescription ?? current.defaultSeoDescription;
  const now = new Date().toISOString();

  const updatedRow = await updateSiteSettingsRow({
    officialName: nextOfficialName,
    motto: nextMotto,
    brandColors: nextBrandColors,
    telephone: nextTelephone,
    email: nextEmail,
    whatsappNumber: nextWhatsapp,
    address: nextAddress,
    officeHours: nextOfficeHours,
    directionsUrl: nextDirectionsUrl,
    socialLinks: nextSocialLinks,
    defaultSeoTitle: nextSeoTitle,
    defaultSeoDescription: nextSeoDescription,
    nowIso: now,
  });

  return mapAdminSiteSettings(updatedRow);
}

export async function getAdminInstitutionalContent(
  actor: AdminActor | null
): Promise<InstitutionalContent> {
  assertAuthorized(actor, 'content:read');
  return getPublicInstitutionalContent();
}

export async function updateAdminInstitutionalContent(
  actor: AdminActor | null,
  rawPayload: unknown
): Promise<InstitutionalContent> {
  assertAuthorized(actor, 'content:update');
  const current = await getPublicInstitutionalContent();
  const updated = validateInstitutionalContentUpdate(rawPayload, current);
  const now = new Date().toISOString();

  await updateInstitutionalContentRow(updated, now);
  return getPublicInstitutionalContent();
}

// ============================================================================
// Admin Staff Account & Password Management Services
// ============================================================================

export async function listAdminUsers(actor: AdminActor | null): Promise<AdminUser[]> {
  assertAuthorized(actor, 'users:read');
  return listAllAdminUsers();
}

export async function createAdminUser(
  actor: AdminActor | null,
  rawPayload: unknown
): Promise<AdminUser> {
  assertAuthorized(actor, 'users:create');
  const input = validateCreateAdminAccountInput(rawPayload);

  const existing = await findAdminByEmail(input.email);
  if (existing) {
    throw new ConflictError('An administrator account with this email already exists.');
  }

  const id = crypto.randomUUID();
  const identitySubject = `local:${input.email}`;
  const passwordHash = hashPassword(input.password);
  const now = new Date().toISOString();

  return insertAdminUser({
    id,
    identitySubject,
    displayName: input.displayName,
    email: input.email,
    passwordHash,
    nowIso: now,
  });
}

export async function changeOwnAdminPassword(
  actor: AdminActor | null,
  rawPayload: unknown
): Promise<void> {
  if (!actor || !actor.id || !actor.isActive) {
    throw new AuthorizationError('Active authenticated administrator context is required.');
  }
  const input = validateChangePasswordInput(rawPayload);
  const row = await findAdminPasswordHashById(actor.id);

  if (!row || !row.isActive) {
    throw new AuthorizationError('This administrator account is unavailable.');
  }

  if (!verifyPassword(input.currentPassword, row.passwordHash)) {
    throw new AuthenticationError('Current password is incorrect.');
  }

  const nextHash = hashPassword(input.newPassword);
  const now = new Date().toISOString();
  await updateAdminPasswordHash(actor.id, nextHash, now);
}

export async function updateAdminUserAccount(
  actor: AdminActor | null,
  targetUserId: string,
  rawPayload: unknown
): Promise<AdminUser> {
  assertAuthorized(actor, 'users:update');
  const input = validateAdminAccountUpdateInput(rawPayload);

  const existing = await findAdminById(targetUserId);
  if (!existing) {
    throw new NotFoundError('Administrator account not found.');
  }

  if (input.isActive === false) {
    if (actor && actor.id === existing.id) {
      throw new ConflictError('You cannot deactivate your own currently signed-in account.');
    }
    const activeCount = await countActiveAdminUsers();
    if (activeCount <= 1 && existing.isActive) {
      throw new ConflictError('At least one active administrator account must remain.');
    }
  }

  const nextDisplayName = input.displayName ?? existing.displayName;
  const nextIsActive = input.isActive !== undefined ? input.isActive : existing.isActive;
  const nextHash = input.newPassword ? hashPassword(input.newPassword) : undefined;
  const now = new Date().toISOString();

  const updated = await updateAdminUserRecord({
    id: targetUserId,
    displayName: nextDisplayName,
    isActive: nextIsActive,
    passwordHash: nextHash,
    nowIso: now,
  });

  if (!updated) {
    throw new NotFoundError('Administrator account not found after update.');
  }
  return updated;
}
