import { NextRequest } from 'next/server';
import { createRequestId } from '@/domain/errors';
import { getPublishedNewsBySlug } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse, RouteContext } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: RouteContext<{ slug: string }>) {
  const requestId = createRequestId();
  try {
    const post = getPublishedNewsBySlug(context.params.slug);
    return jsonResponse(
      { data: post, meta: { requestId } },
      { status: 200, requestId, cacheControl: 'public, max-age=0, s-maxage=60' },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
