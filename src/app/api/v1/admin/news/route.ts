import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { createAdminNews, listAdminNews } from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req);
    const status = req.nextUrl.searchParams.get('status');
    const cursor = req.nextUrl.searchParams.get('cursor');
    const limit = req.nextUrl.searchParams.get('limit');
    const result = listAdminNews(user, { status, cursor, limit });
    return jsonResponse(
      { data: result.items, meta: { nextCursor: result.nextCursor, requestId } },
      { status: 200, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const created = createAdminNews(user, body);
    logSecurityEvent({
      category: created.status === 'published' ? 'CONTENT_PUBLISHED' : 'CONTENT_UPDATED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'news_article',
      targetId: created.id,
    });

    return jsonResponse({ data: created, meta: { requestId } }, { status: 201, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
