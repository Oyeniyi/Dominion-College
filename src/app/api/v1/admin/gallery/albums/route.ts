import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import { createAdminAlbum, listAdminAlbums } from '@/server/services/cms-service';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = await requireAuthenticatedAdminFromRequest(req);
    const albums = await listAdminAlbums(user);
    return jsonResponse(
      { data: albums, meta: { total: albums.length, requestId } },
      { status: 200, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

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

    const album = await createAdminAlbum(user, body);
    return jsonResponse({ data: album, meta: { requestId } }, { status: 201, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
