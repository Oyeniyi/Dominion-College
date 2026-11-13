import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import {
  deleteAdminNews,
  getAdminNewsById,
  updateAdminNews,
} from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse, RouteContext } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: RouteContext<{ id: string }>) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req);
    const post = getAdminNewsById(user, context.params.id);
    return jsonResponse({ data: post, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext<{ id: string }>) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const updated = updateAdminNews(user, context.params.id, body);
    logSecurityEvent({
      category: updated.status === 'published' ? 'CONTENT_PUBLISHED' : 'CONTENT_UPDATED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'news_article',
      targetId: updated.id,
    });

    return jsonResponse({ data: updated, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext<{ id: string }>) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    deleteAdminNews(user, context.params.id);
    logSecurityEvent({
      category: 'CONTENT_DELETED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'news_article',
      targetId: context.params.id,
    });

    return jsonResponse(
      { data: { deleted: true, id: context.params.id }, meta: { requestId } },
      { status: 200, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
