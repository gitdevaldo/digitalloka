'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchOptions<T> {
  url: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  enabled?: boolean;
  transform?: (raw: unknown) => T;
  onError?: (error: string) => void;
}

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => void;
}

export function useDataFetch<T>({
  url,
  method = 'GET',
  body,
  enabled = true,
  transform,
  onError,
}: UseDataFetchOptions<T>): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const fetchId = ++fetchCountRef.current;
    setLoading(true);
    setError(null);

    try {
      const options: RequestInit = { method };
      if (body && method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      if (!mountedRef.current || fetchId !== fetchCountRef.current) return;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const raw = await res.json();
      const result = transform ? transform(raw) : raw as T;
      setData(result);
    } catch (err) {
      if (!mountedRef.current || fetchId !== fetchCountRef.current) return;
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      onError?.(message);
    } finally {
      if (mountedRef.current && fetchId === fetchCountRef.current) {
        setLoading(false);
      }
    }
  }, [url, method, body, enabled, transform, onError]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const isEmpty = !loading && !error && (
    data === null ||
    data === undefined ||
    (Array.isArray(data) && data.length === 0)
  );

  return { data, loading, error, isEmpty, refetch: fetchData };
}
