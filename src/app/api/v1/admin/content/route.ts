import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import {
  getAdminInstitutionalContent,
  updateAdminInstitutionalContent,
} from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req);
    const content = getAdminInstitutionalContent(user);
    return jsonResponse({ data: content, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const updated = updateAdminInstitutionalContent(user, body);
    logSecurityEvent({
      category: 'SETTINGS_UPDATED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'institutional_content',
      targetId: '1',
    });

    return jsonResponse({ data: updated, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
