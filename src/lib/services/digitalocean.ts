const DO_BASE_URL = process.env.DIGITALOCEAN_BASE_URL || 'https://api.digitalocean.com/v2';
const DO_TOKEN = () => process.env.DIGITALOCEAN_TOKEN || '';
const CONNECT_TIMEOUT = Number(process.env.DIGITALOCEAN_CONNECT_TIMEOUT_SECONDS || 3) * 1000;
const REQUEST_TIMEOUT = Number(process.env.DIGITALOCEAN_REQUEST_TIMEOUT_SECONDS || 10) * 1000;

const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlSeconds: number) {
  cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

async function doRequest(method: string, endpoint: string, payload?: unknown): Promise<Record<string, unknown>> {
  const token = DO_TOKEN();
  if (!token) throw new Error('DigitalOcean service is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${DO_BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as Record<string, string>).message || 'DigitalOcean API error');
    }

    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function listDroplets(dropletIds: number[]): Promise<unknown[]> {
  if (!dropletIds.length) return [];
  const sorted = [...dropletIds].sort();
  const cacheKey = `droplets:${sorted.join(',')}`;
  const cached = getCached<unknown[]>(cacheKey);
  if (cached) return cached;

  let droplets: unknown[] = [];
  try {
    const idSet = new Set(dropletIds);
    const found = new Map<number, unknown>();
    let page = 1;
    let hasMore = true;

    while (hasMore && found.size < idSet.size) {
      const data = await doRequest('GET', `/droplets?per_page=200&page=${page}`);
      const pageDroplets = (data.droplets as { id: number }[]) || [];
      for (const d of pageDroplets) {
        if (idSet.has(d.id)) found.set(d.id, d);
      }
      const meta = data.meta as { total?: number } | undefined;
      hasMore = pageDroplets.length === 200 && (meta?.total ? found.size < Math.min(idSet.size, meta.total) : true);
      page++;
    }

    droplets = Array.from(found.values());
  } catch {
    droplets = [];
  }

  const ttl = Number(process.env.DIGITALOCEAN_DROPLETS_CACHE_SECONDS || 20);
  setCache(cacheKey, droplets, ttl);
  return droplets;
}

export async function getDroplet(dropletId: number): Promise<unknown> {
  const cacheKey = `droplet:${dropletId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await doRequest('GET', `/droplets/${dropletId}`);
  const droplet = data.droplet;
  const ttl = Number(process.env.DIGITALOCEAN_DROPLET_CACHE_SECONDS || 20);
  setCache(cacheKey, droplet, ttl);
  return droplet;
}

export async function performAction(dropletId: number, actionType: string): Promise<unknown> {
  const data = await doRequest('POST', `/droplets/${dropletId}/actions`, { type: actionType });
  cache.delete(`droplet:${dropletId}`);
  cache.delete(`droplet-actions:${dropletId}`);
  return data.action;
}

export async function listActions(dropletId: number): Promise<unknown[]> {
  const cacheKey = `droplet-actions:${dropletId}`;
  const cached = getCached<unknown[]>(cacheKey);
  if (cached) return cached;

  const data = await doRequest('GET', `/droplets/${dropletId}/actions?per_page=20`);
  const actions = (data.actions as unknown[]) || [];
  const ttl = Number(process.env.DIGITALOCEAN_ACTIONS_CACHE_SECONDS || 10);
  setCache(cacheKey, actions, ttl);
  return actions;
}
