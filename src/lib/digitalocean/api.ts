import { checkRateLimit } from '../rate-limit';
import type { Droplet, DropletAction, ActionType, DOApiError } from './types';

const DO_API_BASE = 'https://api.digitalocean.com/v2';

class DigitalOceanAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorId?: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'DigitalOceanAPIError';
  }
}

class RateLimitError extends Error {
  constructor(
    message: string,
    public resetAt: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

async function doFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  userId?: string
): Promise<T> {
  const token = process.env.DIGITALOCEAN_TOKEN;
  
  if (!token) {
    throw new Error('DIGITALOCEAN_TOKEN not configured');
  }

  // Check rate limits
  const globalLimit = checkRateLimit('global', 'global');
  if (!globalLimit.allowed) {
    throw new RateLimitError('Global rate limit exceeded', globalLimit.resetAt);
  }

  if (userId) {
    const userLimit = checkRateLimit(userId, 'user');
    if (!userLimit.allowed) {
      throw new RateLimitError('Rate limit exceeded', userLimit.resetAt);
    }
  }

  const url = `${DO_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle rate limit from DO
  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    const resetAt = Date.now() + (parseInt(retryAfter || '60') * 1000);
    throw new RateLimitError('DigitalOcean rate limit exceeded', resetAt);
  }

  if (!response.ok) {
    let error: DOApiError = { id: 'unknown', message: 'Unknown error' };
    try {
      error = await response.json();
    } catch {
      // Ignore JSON parse errors
    }
    throw new DigitalOceanAPIError(
      error.message,
      response.status,
      error.id,
      error.request_id
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const digitalOceanApi = {
  /**
   * Get a single droplet by ID
   */
  async getDroplet(dropletId: number, userId?: string): Promise<Droplet> {
    const data = await doFetch<{ droplet: Droplet }>(
      `/droplets/${dropletId}`,
      { method: 'GET' },
      userId
    );
    return data.droplet;
  },

  /**
   * Get multiple droplets by IDs
   */
  async getDroplets(dropletIds: number[], userId?: string): Promise<Droplet[]> {
    // Fetch in parallel but respect rate limits
    const results = await Promise.all(
      dropletIds.map(async (id) => {
        try {
          return await this.getDroplet(id, userId);
        } catch (error) {
          // Log but don't fail entire request if one droplet fails
          console.error(`Failed to fetch droplet ${id}:`, error);
          return null;
        }
      })
    );
    return results.filter((d): d is Droplet => d !== null);
  },

  /**
   * Perform an action on a droplet
   */
  async performAction(
    dropletId: number,
    actionType: ActionType,
    userId?: string
  ): Promise<DropletAction> {
    const data = await doFetch<{ action: DropletAction }>(
      `/droplets/${dropletId}/actions`,
      {
        method: 'POST',
        body: JSON.stringify({ type: actionType }),
      },
      userId
    );
    return data.action;
  },

  /**
   * Get action status
   */
  async getAction(
    dropletId: number,
    actionId: number,
    userId?: string
  ): Promise<DropletAction> {
    const data = await doFetch<{ action: DropletAction }>(
      `/droplets/${dropletId}/actions/${actionId}`,
      { method: 'GET' },
      userId
    );
    return data.action;
  },

  /**
   * List recent actions for a droplet
   */
  async listActions(
    dropletId: number,
    userId?: string,
    perPage: number = 20
  ): Promise<DropletAction[]> {
    const data = await doFetch<{ actions: DropletAction[] }>(
      `/droplets/${dropletId}/actions?per_page=${perPage}`,
      { method: 'GET' },
      userId
    );
    return data.actions;
  },
};

export { DigitalOceanAPIError, RateLimitError };
export type { Droplet, DropletAction, ActionType };
