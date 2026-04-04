import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
  windowMs: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanupMemory() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of memoryStore) {
    const cutoff = now - entry.windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) memoryStore.delete(key);
  }
}

function useDatabase(): boolean {
  return process.env.RATE_LIMIT_STORE === 'database';
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimitMemory(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfterMs: number } {
  cleanupMemory();

  const now = Date.now();
  const cutoff = now - config.windowMs;
  let entry = memoryStore.get(key);

  if (!entry) {
    entry = { timestamps: [], windowMs: config.windowMs };
    memoryStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + config.windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

async function checkRateLimitDatabase(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase.rpc('check_rate_limit_atomic', {
      p_key: key,
      p_window_ms: config.windowMs,
      p_max_requests: config.maxRequests,
    });

    if (error) {
      console.error('Rate limit DB error, falling back to in-memory:', error.message);
      return checkRateLimitMemory(key, config);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row || row.allowed) {
      return { allowed: true, retryAfterMs: 0 };
    }

    const oldestTs = row.oldest_ts ? new Date(row.oldest_ts).getTime() : Date.now();
    const retryAfterMs = oldestTs + config.windowMs - Date.now();
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  } catch (err) {
    console.error('Rate limit DB exception, falling back to in-memory:', err);
    return checkRateLimitMemory(key, config);
  }
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  if (useDatabase()) {
    return checkRateLimitDatabase(key, config);
  }
  return checkRateLimitMemory(key, config);
}

export function rateLimitResponse(retryAfterMs: number): NextResponse {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}

export async function applyRateLimit(
  request: NextRequest,
  prefix: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const { allowed, retryAfterMs } = await checkRateLimit(key, config);

  if (!allowed) {
    return rateLimitResponse(retryAfterMs);
  }

  return null;
}
