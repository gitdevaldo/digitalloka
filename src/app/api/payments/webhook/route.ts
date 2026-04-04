import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, processWebhook } from '@/lib/services/payment-verification';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    if (!verifySignature(rawBody, signature)) {
      return apiError('Invalid signature', 401);
    }

    const payload = JSON.parse(rawBody);
    const result = await processWebhook(payload);
    return NextResponse.json(result);
  } catch {
    return apiError('Webhook processing failed', 422);
  }
});
