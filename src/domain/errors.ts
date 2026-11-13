/**
 * Domain & Boundary Error Contracts
 * Adheres to API Specification §3, AE-05, AE-08, AE-10, and SEC-18.
 */

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'DEPENDENCY_UNAVAILABLE';

export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export interface SafeErrorEnvelope {
  type: string;
  title: string;
  status: number;
  code: ErrorCode;
  detail: string;
  fieldErrors?: FieldError[];
  requestId: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly title: string;
  public readonly detail: string;
  public readonly fieldErrors?: FieldError[];
  public readonly retryAfterSeconds?: number;

  constructor(options: {
    status: number;
    code: ErrorCode;
    title: string;
    detail: string;
    fieldErrors?: FieldError[];
    retryAfterSeconds?: number;
  }) {
    super(options.detail);
    this.name = 'AppError';
    this.status = options.status;
    this.code = options.code;
    this.title = options.title;
    this.detail = options.detail;
    this.fieldErrors = options.fieldErrors;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export function createRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export class ValidationError extends AppError {
  constructor(detail: string, fieldErrors: FieldError[] = []) {
    super({
      status: 422,
      code: 'VALIDATION_FAILED',
      title: 'Validation failed',
      detail,
      fieldErrors,
    });
  }
}

export class BadRequestError extends AppError {
  constructor(detail = 'The request could not be understood or had invalid parameters.') {
    super({
      status: 400,
      code: 'INVALID_REQUEST',
      title: 'Invalid request',
      detail,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(detail = 'Authentication is required to perform this operation.') {
    super({
      status: 401,
      code: 'UNAUTHENTICATED',
      title: 'Authentication required',
      detail,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(detail = 'You do not have permission to perform this operation.') {
    super({
      status: 403,
      code: 'FORBIDDEN',
      title: 'Access denied',
      detail,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(detail = 'The requested resource was not found.') {
    super({
      status: 404,
      code: 'NOT_FOUND',
      title: 'Resource not found',
      detail,
    });
  }
}

export class ConflictError extends AppError {
  constructor(detail: string, fieldErrors?: FieldError[]) {
    super({
      status: 409,
      code: 'CONFLICT',
      title: 'Conflict detected',
      detail,
      fieldErrors,
    });
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(detail = 'The submitted payload or file exceeds the allowed size limit.') {
    super({
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
      title: 'Payload too large',
      detail,
    });
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(detail = 'The submitted media format is not supported.') {
    super({
      status: 415,
      code: 'UNSUPPORTED_MEDIA_TYPE',
      title: 'Unsupported media type',
      detail,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds = 60, detail = 'Too many requests. Please wait before trying again.') {
    super({
      status: 429,
      code: 'RATE_LIMITED',
      title: 'Rate limit exceeded',
      detail,
      retryAfterSeconds,
    });
  }
}

export class DependencyUnavailableError extends AppError {
  constructor(detail = 'A required system service is temporarily unavailable. Your action was not confirmed.') {
    super({
      status: 503,
      code: 'DEPENDENCY_UNAVAILABLE',
      title: 'Service temporarily unavailable',
      detail,
    });
  }
}

/**
 * Maps any error to a safe, non-leaking error envelope.
 * Never exposes stack traces, SQL queries, filesystem paths, or PII.
 */
export function toSafeErrorEnvelope(error: unknown, requestId: string): SafeErrorEnvelope {
  if (error instanceof AppError) {
    const envelope: SafeErrorEnvelope = {
      type: 'about:blank',
      title: error.title,
      status: error.status,
      code: error.code,
      detail: error.detail,
      requestId,
    };
    if (error.fieldErrors && error.fieldErrors.length > 0) {
      envelope.fieldErrors = error.fieldErrors;
    }
    return envelope;
  }

  return {
    type: 'about:blank',
    title: 'Internal server error',
    status: 500,
    code: 'INTERNAL_ERROR',
    detail: 'An unexpected error occurred while processing the request. No changes were confirmed.',
    requestId,
  };
}
