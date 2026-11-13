import { NextRequest, NextResponse } from 'next/server';
import { AppError, createRequestId, toSafeErrorEnvelope } from '@/domain/errors';
import { logSecurityEvent } from './logger';

export interface RouteContext<TParams = Record<string, string>> {
  params: TParams;
}

export function jsonResponse(
  data: unknown,
  options: {
    status?: number;
    requestId?: string;
    cacheControl?: string;
    headers?: Record<string, string>;
  } = {},
): NextResponse {
  const requestId = options.requestId ?? createRequestId();
  const status = options.status ?? 200;
  const headers: Record<string, string> = {
    'X-Request-Id': requestId,
    'Cache-Control': options.cacheControl ?? 'no-store, max-age=0',
    ...(options.headers ?? {}),
  };

  return NextResponse.json(data, { status, headers });
}

export function handleRouteError(
  error: unknown,
  req: NextRequest,
  requestId: string,
): NextResponse {
  const envelope = toSafeErrorEnvelope(error, requestId);

  if (envelope.status >= 500) {
    logSecurityEvent({
      category: 'SERVER_ERROR',
      outcome: 'failure',
      requestId,
      metadata: {
        path: req.nextUrl.pathname,
        method: req.method,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
  } else if (envelope.status === 401 || envelope.status === 403) {
    logSecurityEvent({
      category: 'AUTHZ_DENIED',
      outcome: 'denied',
      requestId,
      metadata: {
        path: req.nextUrl.pathname,
        method: req.method,
        code: envelope.code,
      },
    });
  } else if (envelope.status === 429) {
    logSecurityEvent({
      category: 'RATE_LIMIT_TRIGGERED',
      outcome: 'denied',
      requestId,
      metadata: {
        path: req.nextUrl.pathname,
        method: req.method,
      },
    });
  } else if (envelope.status === 422) {
    logSecurityEvent({
      category: 'VALIDATION_REJECTED',
      outcome: 'denied',
      requestId,
      metadata: {
        path: req.nextUrl.pathname,
        method: req.method,
      },
    });
  }

  const headers: Record<string, string> = {
    'X-Request-Id': requestId,
    'Cache-Control': 'no-store, max-age=0',
  };

  if (error instanceof AppError && error.retryAfterSeconds) {
    headers['Retry-After'] = String(error.retryAfterSeconds);
  }

  return NextResponse.json({ error: envelope }, { status: envelope.status, headers });
}
