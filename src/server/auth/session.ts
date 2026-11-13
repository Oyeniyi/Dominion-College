/**
 * Server Session & CSRF Verification Adapter
 * Adheres to ADR-003, AE-04, SEC-01, SEC-02, SEC-03.
 */

import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AdminSessionUser, AdminUser } from '@/domain/types';
import { AuthenticationError, AuthorizationError } from '@/domain/errors';
import { getPermissionsForRole } from '@/domain/permissions';
import {
  createSignedSessionToken,
  revokeSessionToken,
  verifySignedSessionToken,
} from './crypto';
import { getActiveAdminUserById } from '../services/cms-service';

export const SESSION_COOKIE_NAME = 'dc_admin_session';
export const CSRF_COOKIE_NAME = 'dc_csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function setSessionCookiesOnResponse(
  response: NextResponse,
  adminUserId: string
): { csrfToken: string; expiresAt: number } {
  const { token, csrfToken, expiresAt } = createSignedSessionToken(adminUserId);
  const isProd = process.env.NODE_ENV === 'production';

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Readable by same-origin admin UI to send in X-CSRF-Token header
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return { csrfToken, expiresAt };
}

export function clearSessionCookiesOnResponse(
  response: NextResponse,
  existingToken?: string | null
): void {
  if (existingToken) {
    revokeSessionToken(existingToken);
  }
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(CSRF_COOKIE_NAME, '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
  });
}

/**
 * Verifies the incoming request's session cookie and active AdminUser status in DB.
 * If `requireCsrf` is true (for state-changing POST/PATCH/DELETE mutations), also verifies
 * that `X-CSRF-Token` matches the signed session payload's `csrf` claim (SEC-03).
 */
export function requireAuthenticatedAdminFromRequest(
  req: NextRequest,
  options?: { requireCsrf?: boolean }
): { user: AdminUser; csrfToken: string } {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySignedSessionToken(token);
  if (!payload) {
    throw new AuthenticationError('Valid administrator session is required.');
  }

  if (options?.requireCsrf) {
    const headerCsrf = req.headers.get(CSRF_HEADER_NAME);
    if (!headerCsrf || headerCsrf !== payload.csrf) {
      throw new AuthorizationError('CSRF token validation failed for state-changing request.');
    }
  }

  const user = getActiveAdminUserById(payload.sub);
  if (!user) {
    throw new AuthenticationError('Administrator account not found.');
  }
  if (!user.isActive) {
    throw new AuthorizationError('This administrator account is disabled.');
  }

  return { user, csrfToken: payload.csrf };
}

/**
 * Server Component helper to read current authenticated AdminSessionUser (or null if unauthenticated).
 */
export function getServerComponentAdminSession(): {
  user: AdminSessionUser;
  csrfToken: string;
} | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const payload = verifySignedSessionToken(token);
    if (!payload) return null;

    const dbUser = getActiveAdminUserById(payload.sub);
    if (!dbUser || !dbUser.isActive) return null;

    return {
      user: {
        id: dbUser.id,
        displayName: dbUser.displayName,
        email: dbUser.email,
        roleCode: dbUser.roleCode,
        isActive: true,
        permissions: getPermissionsForRole(dbUser.roleCode),
      },
      csrfToken: payload.csrf,
    };
  } catch {
    return null;
  }
}

export function getRequestClientIp(): string {
  try {
    const hdrs = headers();
    return hdrs.get('x-real-ip') || hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  } catch {
    return 'local';
  }
}
