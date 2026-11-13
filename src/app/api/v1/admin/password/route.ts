import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { changeOwnAdminPassword } from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

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

    changeOwnAdminPassword(user, body);
    logSecurityEvent({
      category: 'ADMIN_PASSWORD_CHANGED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'admin_user',
      targetId: user.id,
    });

    return jsonResponse(
      { data: { message: 'Password updated successfully.' }, meta: { requestId } },
      { status: 200, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

