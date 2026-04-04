import { NextResponse } from 'next/server';

export function apiSuccess(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiJson(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}
