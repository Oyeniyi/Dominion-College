import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { requireAuthenticatedAdminFromRequest } from '@/server/auth/session';
import {
  listAdminAlbums,
  listAdminGalleryImages,
  uploadAdminGalleryImage,
} from '@/server/services/cms-service';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req);
    const albumId = req.nextUrl.searchParams.get('albumId');
    const status = req.nextUrl.searchParams.get('status');
    const cursor = req.nextUrl.searchParams.get('cursor');
    const limit = req.nextUrl.searchParams.get('limit');

    const imagesResult = listAdminGalleryImages(user, { albumId, status, cursor, limit });
    const albums = listAdminAlbums(user);
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
      { status: 200, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const fileEntry = formData.get('file');
      let fileBuffer: Buffer | undefined;
      if (fileEntry && typeof fileEntry === 'object' && 'arrayBuffer' in fileEntry) {
        const arrayBuf = await (fileEntry as File).arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
      }

      const placeholderUrl = formData.get('placeholderUrl')?.toString() || undefined;
      const metadata = {
        albumId: formData.get('albumId')?.toString() || null,
        altText: formData.get('altText')?.toString() || '',
        caption: formData.get('caption')?.toString() || null,
        contentStatus: formData.get('contentStatus')?.toString() || 'verified',
        status: formData.get('status')?.toString() || 'draft',
        schoolApproved: formData.get('schoolApproved') === 'true',
        identifiableStudents: formData.get('identifiableStudents') === 'true',
        approvalReference: formData.get('approvalReference')?.toString() || null,
        displayOrder: Number(formData.get('displayOrder') ?? '0'),
      };

      const created = uploadAdminGalleryImage(user, {
        metadata,
        fileBuffer,
        placeholderUrl,
      });

      logSecurityEvent({
        category: 'MEDIA_UPLOADED',
        outcome: 'success',
        requestId,
        actorId: user.id,
        targetType: 'gallery_image',
        targetId: created.id,
      });

      return jsonResponse({ data: created, meta: { requestId } }, { status: 201, requestId });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    let fileBuffer: Buffer | undefined;
    if (typeof body.fileBase64 === 'string' && body.fileBase64.length > 0) {
      fileBuffer = Buffer.from(body.fileBase64, 'base64');
    }

    const created = uploadAdminGalleryImage(user, {
      metadata: body,
      fileBuffer,
      placeholderUrl: typeof body.placeholderUrl === 'string' ? body.placeholderUrl : undefined,
    });

    logSecurityEvent({
      category: 'MEDIA_UPLOADED',
      outcome: 'success',
      requestId,
      actorId: user.id,
      targetType: 'gallery_image',
      targetId: created.id,
    });

    return jsonResponse({ data: created, meta: { requestId } }, { status: 201, requestId });
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
