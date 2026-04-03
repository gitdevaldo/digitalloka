export interface CursorPaginationOptions {
  cursor?: string | null;
  limit: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
const SAFE_ID_RE = /^[\w-]+$/;

export function encodeCursor(createdAt: string, id: string | number): string {
  return Buffer.from(`${createdAt}|${id}`).toString('base64url');
}

export function decodeCursor(cursor: string): { created_at: string; id: string } {
  let decoded: string;
  try {
    decoded = Buffer.from(cursor, 'base64url').toString('utf8');
  } catch {
    throw new Error('Invalid cursor format');
  }
  const separatorIndex = decoded.lastIndexOf('|');
  if (separatorIndex === -1) throw new Error('Invalid cursor format');

  const created_at = decoded.slice(0, separatorIndex);
  const id = decoded.slice(separatorIndex + 1);

  if (!ISO_DATE_RE.test(created_at)) throw new Error('Invalid cursor format');
  if (!SAFE_ID_RE.test(id)) throw new Error('Invalid cursor format');

  return { created_at, id };
}

export function applyCursorFilter<Q extends { or: (filter: string) => Q }>(
  query: Q,
  cursor: string,
): Q {
  const decoded = decodeCursor(cursor);
  return query.or(
    `created_at.lt.${decoded.created_at},and(created_at.eq.${decoded.created_at},id.lt.${decoded.id})`,
  );
}

export function applyCursorPagination<T>(
  rows: T[],
  limit: number,
): CursorPaginatedResult<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  let nextCursor: string | null = null;

  if (hasMore && data.length > 0) {
    const last = data[data.length - 1] as Record<string, unknown>;
    const createdAt = last.created_at as string | undefined;
    const id = last.id as string | number | undefined;
    if (createdAt && id !== undefined) {
      nextCursor = encodeCursor(createdAt, id);
    }
  }

  return { data, next_cursor: nextCursor, has_more: hasMore };
}
