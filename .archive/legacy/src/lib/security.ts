export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }

  const requestUrl = new URL(request.url);
  if (origin === requestUrl.origin) {
    return true;
  }

  // Allow host-equivalent origins when app sits behind reverse proxy/CDN.
  const hostHeader = request.headers.get('host');
  if (hostHeader) {
    const proto = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '');
    const normalizedOrigin = `${proto}://${hostHeader}`;
    if (origin === normalizedOrigin) {
      return true;
    }
  }

  return false;
}

export function getPublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const url = new URL(request.url);
  const proto = forwardedProto || url.protocol.replace(':', '');

  if (host) {
    return `${proto}://${host}`;
  }

  return url.origin;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export function getSafeRedirectPath(
  rawPath: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  if (!rawPath) {
    return fallback;
  }

  if (!rawPath.startsWith('/')) {
    return fallback;
  }

  if (rawPath.startsWith('//')) {
    return fallback;
  }

  return rawPath;
}
