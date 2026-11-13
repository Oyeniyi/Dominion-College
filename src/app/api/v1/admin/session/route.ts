import { NextRequest, NextResponse } from 'next/server';
import { BadRequestError, createRequestId, ValidationError } from '@/domain/errors';
import { getPermissionsForRole } from '@/domain/permissions';
import {
  clearSessionCookiesOnResponse,
  getRequestClientIp,
  requireAuthenticatedAdminFromRequest,
  SESSION_COOKIE_NAME,
  setSessionCookiesOnResponse,
} from '@/server/auth/session';
import { authenticateAdminCredentials } from '@/server/services/cms-service';
import { enforceRateLimit } from '@/server/rate-limit';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user, csrfToken } = requireAuthenticatedAdminFromRequest(req);
    return jsonResponse(
      {
        data: {
          authenticated: true,
          user: {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            roleCode: user.roleCode,
            permissions: getPermissionsForRole(user.roleCode),
          },
          csrfToken,
        },
        meta: { requestId },
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
    const ip = getRequestClientIp();
    enforceRateLimit({
      key: `admin-login:${ip}`,
      windowMs: 15 * 60 * 1000,
      limit: 10,
    });

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const email = typeof body?.email === 'string' ? body.email : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      throw new ValidationError('Both email and password are required.', [
        ...(!email
          ? [{ field: 'email', code: 'REQUIRED', message: 'Email is required.' }]
          : []),
        ...(!password
          ? [{ field: 'password', code: 'REQUIRED', message: 'Password is required.' }]
          : []),
      ]);
    }

    const user = authenticateAdminCredentials(email, password);
    const response = NextResponse.json(
      {
        data: {
          authenticated: true,
          user: {
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            roleCode: user.roleCode,
            permissions: getPermissionsForRole(user.roleCode),
          },
        },
        meta: { requestId },
      },
      {
        status: 200,
        headers: {
          'X-Request-Id': requestId,
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );

    setSessionCookiesOnResponse(response, user.id);

    logSecurityEvent({
      category: 'AUTH_SUCCESS',
      outcome: 'success',
      requestId,
      actorId: user.id,
    });

    return response;
  } catch (error) {
    logSecurityEvent({
      category: 'AUTH_FAILURE',
      outcome: 'failure',
      requestId,
    });
    return handleRouteError(error, req, requestId);
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const { user } = requireAuthenticatedAdminFromRequest(req, { requireCsrf: true });
    const existingToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    const response = NextResponse.json(
      {
        data: { authenticated: false, message: 'Signed out successfully.' },
        meta: { requestId },
      },
      {
        status: 200,
        headers: {
          'X-Request-Id': requestId,
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );

    clearSessionCookiesOnResponse(response, existingToken);

    logSecurityEvent({
      category: 'AUTH_SUCCESS',
      outcome: 'success',
      requestId,
      actorId: user.id,
      metadata: { action: 'logout' },
    });

    return response;
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
