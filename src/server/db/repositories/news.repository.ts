import {
  ContentVerificationStatus,
  NewsArticle,
  PublicationStatus,
  PublicNewsArticleProjection,
} from '@/domain/types';
import { getDatabase } from '../client';
import { toIsoString, toNullableIsoString } from '../types';

export function mapNewsArticleRow(row: Record<string, unknown>): NewsArticle {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    body: String(row.body),
    featuredImageId: row.featured_image_id ? String(row.featured_image_id) : null,
    status: String(row.status) as PublicationStatus,
    publishedAt: toNullableIsoString(row.published_at),
    authorId: String(row.author_id),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapPublicNewsProjectionRow(row: Record<string, unknown>): PublicNewsArticleProjection {
  return {
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    body: String(row.body),
    publishedAt: toIsoString(row.published_at),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    featuredImage:
      row.img_public_url && row.img_status === 'published' && row.img_school_approved
        ? {
            imageUrl: String(row.img_public_url),
            altText: String(row.img_alt_text || ''),
            caption: row.img_caption ? String(row.img_caption) : null,
            contentStatus: String(
              row.img_content_status || 'placeholder'
            ) as ContentVerificationStatus,
          }
        : null,
  };
}

export async function queryPublishedNews(
  limit: number,
  offset: number
): Promise<PublicNewsArticleProjection[]> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT
      na.title, na.slug, na.excerpt, na.body, na.published_at, na.seo_title, na.seo_description,
      gi.public_url AS img_public_url, gi.alt_text AS img_alt_text, gi.caption AS img_caption,
      gi.status AS img_status, gi.school_approved AS img_school_approved,
      gi.content_status AS img_content_status
    FROM news_article na
    LEFT JOIN gallery_image gi ON gi.id = na.featured_image_id
    WHERE na.status = 'published' AND na.published_at IS NOT NULL
    ORDER BY na.published_at DESC, na.created_at DESC
    LIMIT ${limit + 1} OFFSET ${offset}
  `;
  return rows.map(mapPublicNewsProjectionRow);
}

export async function findPublishedNewsBySlug(
  slug: string
): Promise<PublicNewsArticleProjection | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT
      na.title, na.slug, na.excerpt, na.body, na.published_at, na.seo_title, na.seo_description,
      gi.public_url AS img_public_url, gi.alt_text AS img_alt_text, gi.caption AS img_caption,
      gi.status AS img_status, gi.school_approved AS img_school_approved,
      gi.content_status AS img_content_status
    FROM news_article na
    LEFT JOIN gallery_image gi ON gi.id = na.featured_image_id
    WHERE na.slug = ${slug} AND na.status = 'published' AND na.published_at IS NOT NULL
    LIMIT 1
  `;
  return rows[0] ? mapPublicNewsProjectionRow(rows[0]) : null;
}

export async function queryAdminNews(params: {
  status?: PublicationStatus | null;
  limit: number;
  offset: number;
}): Promise<NewsArticle[]> {
  const sql = await getDatabase();
  const rows = params.status
    ? await sql<Record<string, unknown>[]>`
        SELECT * FROM news_article
        WHERE status = ${params.status}
        ORDER BY updated_at DESC
        LIMIT ${params.limit + 1} OFFSET ${params.offset}
      `
    : await sql<Record<string, unknown>[]>`
        SELECT * FROM news_article
        ORDER BY updated_at DESC
        LIMIT ${params.limit + 1} OFFSET ${params.offset}
      `;
  return rows.map(mapNewsArticleRow);
}

export async function findNewsById(id: string): Promise<NewsArticle | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM news_article WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapNewsArticleRow(rows[0]) : null;
}

export async function findNewsIdBySlug(
  slug: string,
  excludeId?: string
): Promise<string | null> {
  const sql = await getDatabase();
  const rows = excludeId
    ? await sql<{ id: string }[]>`
        SELECT id FROM news_article WHERE slug = ${slug} AND id <> ${excludeId} LIMIT 1
      `
    : await sql<{ id: string }[]>`
        SELECT id FROM news_article WHERE slug = ${slug} LIMIT 1
      `;
  return rows[0]?.id ?? null;
}

export async function insertNewsArticle(params: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImageId: string | null;
  status: PublicationStatus;
  publishedAt: string | null;
  authorId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  nowIso: string;
}): Promise<NewsArticle> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    INSERT INTO news_article (
      id, title, slug, excerpt, body, featured_image_id, status, published_at,
      author_id, seo_title, seo_description, created_at, updated_at
    ) VALUES (
      ${params.id},
      ${params.title},
      ${params.slug},
      ${params.excerpt},
      ${params.body},
      ${params.featuredImageId},
      ${params.status},
      ${params.publishedAt},
      ${params.authorId},
      ${params.seoTitle},
      ${params.seoDescription},
      ${params.nowIso},
      ${params.nowIso}
    )
    RETURNING *
  `;
  return mapNewsArticleRow(rows[0]);
}

export async function updateNewsArticleRecord(params: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImageId: string | null;
  status: PublicationStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  nowIso: string;
}): Promise<NewsArticle> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    UPDATE news_article
    SET title = ${params.title},
        slug = ${params.slug},
        excerpt = ${params.excerpt},
        body = ${params.body},
        featured_image_id = ${params.featuredImageId},
        status = ${params.status},
        published_at = ${params.publishedAt},
        seo_title = ${params.seoTitle},
        seo_description = ${params.seoDescription},
        updated_at = ${params.nowIso}
    WHERE id = ${params.id}
    RETURNING *
  `;
  return mapNewsArticleRow(rows[0]);
}

export async function deleteNewsArticleById(id: string): Promise<void> {
  const sql = await getDatabase();
  await sql`DELETE FROM news_article WHERE id = ${id}`;
}

export async function countNewsSummary(): Promise<{
  total: number;
  publishedCount: number;
  draftCount: number;
}> {
  const sql = await getDatabase();
  const rows = await sql<{ total: string; published_count: string; draft_count: string }[]>`
    SELECT
      COUNT(*)::text as total,
      COUNT(*) FILTER (WHERE status = 'published')::text as published_count,
      COUNT(*) FILTER (WHERE status = 'draft')::text as draft_count
    FROM news_article
  `;
  return {
    total: Number(rows[0]?.total ?? 0),
    publishedCount: Number(rows[0]?.published_count ?? 0),
    draftCount: Number(rows[0]?.draft_count ?? 0),
  };
}
