/**
 * Established Node.js Cryptographic Password Hashing & Signed Session Tokens
 * Adheres to ADR-003, SEC-01, SEC-03, SEC-04, and AE-04.
 * Uses Node.js built-in `node:crypto` (scrypt + HMAC-SHA256 + timingSafeEqual).
 */

import crypto from 'node:crypto';
import { getServerConfig } from '../config';

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export function hashPassword(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plainPassword, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith('scrypt$')) {
    return false;
  }
  const parts = storedHash.split('$');
  if (parts.length !== 3) {
    return false;
  }
  const [, salt, hexHash] = parts;
  if (!salt || !hexHash) {
    return false;
  }
  const expectedBuffer = Buffer.from(hexHash, 'hex');
  const actualBuffer = crypto.scryptSync(plainPassword, salt, expectedBuffer.length);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export interface SignedSessionPayload {
  sub: string; // AdminUser.id
  jti: string; // Unique session ID
  csrf: string; // CSRF token bound to session
  iat: number;
  exp: number;
}

const revokedSessionIds = new Set<string>();

export function createSignedSessionToken(
  adminUserId: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): {
  token: string;
  csrfToken: string;
  expiresAt: number;
  sessionId: string;
} {
  const { sessionSecret } = getServerConfig();
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const sessionId = crypto.randomUUID();
  const payload: SignedSessionPayload = {
    sub: adminUserId,
    jti: sessionId,
    csrf: csrfToken,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_TTL_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  return {
    token: `${encodedPayload}.${signature}`,
    csrfToken,
    expiresAt: payload.exp,
    sessionId,
  };
}

export function verifySignedSessionToken(
  token: string | undefined | null,
  nowSeconds = Math.floor(Date.now() / 1000)
): SignedSessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) {
    return null;
  }

  const { sessionSecret } = getServerConfig();
  const expectedSig = crypto
    .createHmac('sha256', sessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  const a = Buffer.from(providedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as SignedSessionPayload;
    if (!parsed.sub || !parsed.jti || !parsed.csrf || typeof parsed.exp !== 'number') {
      return null;
    }
    if (nowSeconds >= parsed.exp) {
      return null;
    }
    if (revokedSessionIds.has(parsed.jti)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function revokeSessionToken(token: string | undefined | null): void {
  const payload = verifySignedSessionToken(token);
  if (payload?.jti) {
    revokedSessionIds.add(payload.jti);
  }
}

export function clearRevokedSessionsForTests(): void {
  revokedSessionIds.clear();
}

