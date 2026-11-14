import { NextRequest } from 'next/server';
import { BadRequestError, createRequestId } from '@/domain/errors';
import { createAdmissionsEnquiry } from '@/server/services/cms-service';
import { enforceRateLimit } from '@/server/rate-limit';
import { getRequestClientIp } from '@/server/auth/session';
import { logSecurityEvent } from '@/server/logger';
import { handleRouteError, jsonResponse } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const requestId = createRequestId();
  try {
    const ip = getRequestClientIp();
    enforceRateLimit({
      key: `enquiry:${ip}`,
      windowMs: 10 * 60 * 1000,
      limit: 8,
    });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError('Invalid JSON request payload.');
    }

    const result = await createAdmissionsEnquiry(body);
    logSecurityEvent({
      category: 'ENQUIRY_CREATED',
      outcome: 'success',
      requestId,
      targetType: 'admissions_enquiry',
      targetId: result.createdId,
      metadata: { deduplicated: result.deduplicated },
    });

    return jsonResponse(
      {
        data: result,
        meta: { requestId },
      },
      { status: 201, requestId },
    );
  } catch (error) {
    return handleRouteError(error, req, requestId);
  }
}
