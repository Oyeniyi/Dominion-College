import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { previewAdminNews } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = await requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const preview = previewAdminNews(user, body);
    return jsonResponse({ data: preview, meta: { requestId } }, { status: 200, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
