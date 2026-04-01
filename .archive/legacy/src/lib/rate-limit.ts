// Rate limiter using sliding window algorithm
// In-memory store - for production, use Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
  // Per user limits
  user: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,     // 30 requests per minute per user
  },
  // Global DO API limits (be conservative)
  global: {
    windowMs: 60 * 1000,
    maxRequests: 200,    // Stay well under DO's 250/min
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, type: 'user' | 'global' = 'user'): RateLimitResult {
  const now = Date.now();
  const limit = RATE_LIMITS[type];
  const fullKey = `${type}:${key}`;
  
  let entry = rateLimitStore.get(fullKey);
  
  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + limit.windowMs,
    };
  }
  
  entry.count++;
  rateLimitStore.set(fullKey, entry);
  
  const remaining = Math.max(0, limit.maxRequests - entry.count);
  const allowed = entry.count <= limit.maxRequests;
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

export function getRateLimitConfig(type: 'user' | 'global' = 'user') {
  return RATE_LIMITS[type];
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  });
}, 60 * 1000);
