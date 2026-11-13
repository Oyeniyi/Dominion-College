import { NextRequest } from 'next/server';
import { createRequestId } from '@/domain/errors';
import { listPublishedNews } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const cursor = req.nextUrl.searchParams.get('cursor');
    const limit = req.nextUrl.searchParams.get('limit');
    const result = listPublishedNews({ cursor, limit });
    return jsonResponse(
      {
        data: result.items,
        meta: {
          nextCursor: result.nextCursor,
          requestId,
        },
      },
      { status: 200, requestId, cacheControl: 'public, max-age=0, s-maxage=60' },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
