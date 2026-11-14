import { NextRequest } from 'next/server';
import { createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { getAdminDashboardOverview } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = await requireAuthenticatedAdminFromRequest(req);
    const summary = await getAdminDashboardOverview(user);
    return jsonResponse({ data: summary, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
