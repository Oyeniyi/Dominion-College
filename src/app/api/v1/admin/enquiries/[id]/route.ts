import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import {
  getAdminEnquiryById,
  updateAdminEnquiryStatus,
} from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse, RouteContext } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: RouteContext<{ id: string }>) {
  const requestId = createRequestId();
  try {
    const { user } = await requireAuthenticatedAdminFromRequest(req);
    const enquiry = await getAdminEnquiryById(user, context.params.id);
    return jsonResponse({ data: enquiry, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext<{ id: string }>) {
  const requestId = createRequestId();
  try {
    const { user } = await requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const updated = await updateAdminEnquiryStatus(user, context.params.id, body);
    logSecurityEvent({
      category: 'ENQUIRY_STATUS_UPDATED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'admissions_enquiry',
      targetId: updated.id,
      metadata: { status: updated.status },
    });

    return jsonResponse({ data: updated, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
