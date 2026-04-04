import { createClient } from '@supabase/supabase-js';

const DO_BASE_URL = process.env.DIGITALOCEAN_BASE_URL || 'https://api.digitalocean.com/v2';
const DO_TOKEN = () => process.env.DIGITALOCEAN_TOKEN || '';
const CONNECT_TIMEOUT = Number(process.env.DIGITALOCEAN_CONNECT_TIMEOUT_SECONDS || 3) * 1000;
const REQUEST_TIMEOUT = Number(process.env.DIGITALOCEAN_REQUEST_TIMEOUT_SECONDS || 10) * 1000;

const memoryCache = new Map<string, { data: unknown; expires: number }>();

function useDatabaseCache(): boolean {
  return process.env.CACHE_STORE === 'database';
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getCachedMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry || Date.now() > entry.expires) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCacheMemory(key: string, data: unknown, ttlSeconds: number) {
  memoryCache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

function deleteCacheMemory(key: string) {
  memoryCache.delete(key);
}

async function getCachedDatabase<T>(key: string): Promise<T | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('cache_entries')
    .select('data, expires_at')
    .eq('key', key)
    .single();

  if (error || !data) return null;

  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabase.from('cache_entries').delete().eq('key', key);
    return null;
  }

  return data.data as T;
}

async function setCacheDatabase(key: string, data: unknown, ttlSeconds: number) {
  const supabase = getAdminClient();
  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const { error } = await supabase
    .from('cache_entries')
    .upsert({ key, data, expires_at }, { onConflict: 'key' });

  if (error) {
    console.error('Cache DB upsert error:', error.message);
  }
}

async function deleteCacheDatabase(key: string) {
  const supabase = getAdminClient();
  await supabase.from('cache_entries').delete().eq('key', key);
}

async function getCached<T>(key: string): Promise<T | null> {
  if (useDatabaseCache()) {
    try {
      return await getCachedDatabase<T>(key);
    } catch (err) {
      console.error('Cache DB get error, falling back to memory:', err);
      return getCachedMemory<T>(key);
    }
  }
  return getCachedMemory<T>(key);
}

async function setCache(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  if (useDatabaseCache()) {
    try {
      await setCacheDatabase(key, data, ttlSeconds);
    } catch (err) {
      console.error('Cache DB set error, falling back to memory:', err);
      setCacheMemory(key, data, ttlSeconds);
    }
  } else {
    setCacheMemory(key, data, ttlSeconds);
  }
}

async function deleteCache(key: string): Promise<void> {
  if (useDatabaseCache()) {
    try {
      await deleteCacheDatabase(key);
    } catch (err) {
      console.error('Cache DB delete error, falling back to memory:', err);
      deleteCacheMemory(key);
    }
  } else {
    deleteCacheMemory(key);
  }
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
  const cached = await getCached<unknown[]>(cacheKey);
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
  await setCache(cacheKey, droplets, ttl);
  return droplets;
}

export async function getDroplet(dropletId: number): Promise<unknown> {
  const cacheKey = `droplet:${dropletId}`;
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  const data = await doRequest('GET', `/droplets/${dropletId}`);
  const droplet = data.droplet;
  const ttl = Number(process.env.DIGITALOCEAN_DROPLET_CACHE_SECONDS || 20);
  await setCache(cacheKey, droplet, ttl);
  return droplet;
}

export async function performAction(dropletId: number, actionType: string): Promise<unknown> {
  const data = await doRequest('POST', `/droplets/${dropletId}/actions`, { type: actionType });
  await deleteCache(`droplet:${dropletId}`);
  await deleteCache(`droplet-actions:${dropletId}`);
  return data.action;
}

export async function listActions(dropletId: number): Promise<unknown[]> {
  const cacheKey = `droplet-actions:${dropletId}`;
  const cached = await getCached<unknown[]>(cacheKey);
  if (cached) return cached;

  const data = await doRequest('GET', `/droplets/${dropletId}/actions?per_page=20`);
  const actions = (data.actions as unknown[]) || [];
  const ttl = Number(process.env.DIGITALOCEAN_ACTIONS_CACHE_SECONDS || 10);
  await setCache(cacheKey, actions, ttl);
  return actions;
}
