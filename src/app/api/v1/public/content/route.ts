import { NextRequest } from 'next/server';
import { createRequestId } from '@/domain/errors';
import { getPublicInstitutionalContent } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const content = getPublicInstitutionalContent();
    return jsonResponse(
      { data: content, meta: { requestId } },
      { status: 200, requestId, cacheControl: 'public, max-age=0, s-maxage=60' },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
