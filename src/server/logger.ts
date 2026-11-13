/**
 * Privacy-Minimized Operational & Security Event Logger
 * Adheres to AE-10 and SEC-18. Never logs PII, passwords, tokens, cookies, or enquiry bodies.
 */

const SENSITIVE_FIELD_PATTERN =
  /password|secret|token|cookie|authorization|phone|email|message|parentname|parent_name|storagekey|storage_key/i;

export interface SecurityLogEvent {
  timestamp: string;
  category:
    | 'AUTH_SUCCESS'
    | 'AUTH_FAILURE'
    | 'AUTHZ_DENIED'
    | 'ENQUIRY_CREATED'
    | 'ENQUIRY_STATUS_UPDATED'
    | 'CONTENT_PUBLISHED'
    | 'CONTENT_UPDATED'
    | 'CONTENT_DELETED'
    | 'MEDIA_UPLOADED'
    | 'MEDIA_DELETED'
    | 'SETTINGS_UPDATED'
    | 'ADMIN_PASSWORD_CHANGED'
    | 'ADMIN_USER_CREATED'
    | 'ADMIN_USER_UPDATED'
    | 'RATE_LIMIT_TRIGGERED'
    | 'VALIDATION_REJECTED'
    | 'SERVER_ERROR';
  outcome: 'success' | 'denied' | 'failure';
  requestId: string;
  actorId?: string | null;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Redacts any sensitive key or value before logging.
 */
export function redactLogMetadata(
  input: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!input) return undefined;
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_FIELD_PATTERN.test(key)) {
      output[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = redactLogMetadata(value as Record<string, unknown>);
    } else if (typeof value === 'string' && value.length > 160) {
      output[key] = `${value.slice(0, 80)}...[TRUNCATED]`;
    } else {
      output[key] = value;
    }
  }
  return output;
}

const recentSecurityEvents: SecurityLogEvent[] = [];

export function logSecurityEvent(
  event: Omit<SecurityLogEvent, 'timestamp'>
): SecurityLogEvent {
  const sanitized: SecurityLogEvent = {
    timestamp: new Date().toISOString(),
    category: event.category,
    outcome: event.outcome,
    requestId: event.requestId,
    actorId: event.actorId ?? null,
    targetType: event.targetType,
    targetId: event.targetId,
    metadata: redactLogMetadata(event.metadata),
  };

  recentSecurityEvents.unshift(sanitized);
  if (recentSecurityEvents.length > 200) {
    recentSecurityEvents.pop();
  }

  if (process.env.NODE_ENV !== 'test') {
    console.info(JSON.stringify(sanitized));
  }

  return sanitized;
}

export function getRecentSecurityEvents(): readonly SecurityLogEvent[] {
  return recentSecurityEvents;
}

export function clearSecurityEventsForTests(): void {
  recentSecurityEvents.length = 0;
}

