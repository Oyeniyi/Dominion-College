import { NextRequest } from 'next/server';
import { createRequestId } from '@/domain/errors';
import { listPublishedAlbums, listPublishedGalleryImages } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const album = req.nextUrl.searchParams.get('album');
    const cursor = req.nextUrl.searchParams.get('cursor');
    const limit = req.nextUrl.searchParams.get('limit');
    const imagesResult = listPublishedGalleryImages({ albumSlugOrId: album, cursor, limit });
    const albums = listPublishedAlbums();
    return jsonResponse(
      {
        data: {
          albums,
          images: imagesResult.items,
        },
        meta: {
          nextCursor: imagesResult.nextCursor,
          requestId,
        },
      },
      { status: 200, requestId, cacheControl: 'public, max-age=0, s-maxage=60' },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
