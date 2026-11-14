import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { updateAdminUserAccount } from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const requestId = createRequestId();
  try {
    const { user } = await requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const updated = await updateAdminUserAccount(user, context.params.id, body);
    logSecurityEvent({
      category: 'ADMIN_USER_UPDATED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'admin_user',
      targetId: updated.id,
      metadata: { isActive: updated.isActive },
    });

    return jsonResponse({ data: updated, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

