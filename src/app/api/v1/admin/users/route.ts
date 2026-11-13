import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { createAdminUser, listAdminUsers } from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req);
    const users = listAdminUsers(user);
    return jsonResponse({ data: users, meta: { requestId } }, { status: 200, requestId });
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

    const created = createAdminUser(user, body);
    logSecurityEvent({
      category: 'ADMIN_USER_CREATED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'admin_user',
      targetId: created.id,
    });

    return jsonResponse({ data: created, meta: { requestId } }, { status: 201, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

