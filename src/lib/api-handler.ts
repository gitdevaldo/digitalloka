import { NextRequest, NextResponse } from 'next/server';
import { sanitizeDbError } from './error-sanitizer';

type AnyRouteHandler = (...args: any[]) => Promise<NextResponse> | NextResponse;

export function withErrorHandler(handler: AnyRouteHandler): AnyRouteHandler {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      const req = args[0] as NextRequest | undefined;
      const path = req?.nextUrl?.pathname ?? 'unknown';
      const method = req?.method ?? 'UNKNOWN';
      console.error(`[API Error] ${method} ${path}:`, err);
      const message = err instanceof Error ? sanitizeDbError(err.message) : 'An unexpected error occurred';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
