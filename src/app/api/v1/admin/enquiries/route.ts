import { NextRequest } from 'next/server';
import { createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { listAdminEnquiries } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req);
    const status = req.nextUrl.searchParams.get('status');
    const cursor = req.nextUrl.searchParams.get('cursor');
    const limit = req.nextUrl.searchParams.get('limit');

    const result = listAdminEnquiries(user, { status, cursor, limit });
    return jsonResponse(
      {
        data: result.items,
        meta: {
          nextCursor: result.nextCursor,
          requestId,
        },
      },
      { status: 200, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
