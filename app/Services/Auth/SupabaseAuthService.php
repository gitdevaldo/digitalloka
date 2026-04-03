<?php

namespace App\Services\Auth;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabaseAuthService
{
    public function getSessionUserId(Request $request): ?string
    {
        $token = $this->extractAccessToken($request);
        if ($token === null) {
            return null;
        }

        $cacheKey = 'supabase:session-user:' . hash('sha256', $token);
        $positiveCacheSeconds = max(5, (int) config('services.supabase.session_user_cache_seconds', 120));
        $negativeCacheSeconds = max(5, (int) config('services.supabase.session_negative_cache_seconds', 30));
        $cached = Cache::get($cacheKey);
        if (is_string($cached)) {
            return $cached !== '' ? $cached : null;
        }

        if ($cached === false) {
            return null;
        }

        $response = $this->supabaseClient([
            'apikey' => (string) config('services.supabase.anon_key'),
            'Authorization' => 'Bearer ' . $token,
        ])->get(rtrim((string) config('services.supabase.url'), '/') . '/auth/v1/user');

        if ($response->successful()) {
            $data = $response->json();
            $userId = $data['id'] ?? null;

            if (is_string($userId) && $userId !== '') {
                Cache::put($cacheKey, $userId, now()->addSeconds($positiveCacheSeconds));
                return $userId;
            }

            Cache::put($cacheKey, false, now()->addSeconds($negativeCacheSeconds));
            return null;
        }

        Log::warning('supabase_auth_user_lookup_failed', [
            'status' => $response->status(),
            'path' => '/auth/v1/user',
            'has_cookie_token' => is_string($request->cookie('sb-access-token')),
            'has_bearer_token' => is_string($request->bearerToken()),
        ]);

        Cache::put($cacheKey, false, now()->addSeconds($negativeCacheSeconds));

        if ((bool) config('services.supabase.local_jwt_fallback', false)) {
            return $this->extractUserIdFromJwt($token);
        }

        return null;
    }

    public function startMagicLinkLogin(string $email, ?string $nextPath = null, string $mode = 'user'): array
    {
        $redirectUrl = (string) config('services.supabase.redirect_url');
        $safeMode = in_array($mode, ['user', 'admin'], true) ? $mode : 'user';
        $safeNextPath = $this->sanitizeNextPath($nextPath);
        $query = ['mode' => $safeMode];
        if ($safeNextPath !== null) {
            $query['next'] = $safeNextPath;
        }

        $separator = str_contains($redirectUrl, '?') ? '&' : '?';
        $redirectUrl .= $separator . http_build_query($query);

        $payload = [
            'email' => $email,
            'create_user' => false,
            'options' => [
                'email_redirect_to' => $redirectUrl,
            ],
        ];

        $response = $this->supabaseClient([
            'apikey' => (string) config('services.supabase.anon_key'),
            'Content-Type' => 'application/json',
        ])->post(rtrim((string) config('services.supabase.url'), '/') . '/auth/v1/otp', $payload);

        if (!$response->successful()) {
            $body = $response->json();
            $message = is_array($body) ? ($body['msg'] ?? $body['message'] ?? 'Unable to send magic link') : 'Unable to send magic link';
            throw new RuntimeException((string) $message);
        }

        return ['success' => true];
    }

    private function sanitizeNextPath(?string $nextPath): ?string
    {
        if (!is_string($nextPath) || $nextPath === '') {
            return null;
        }

        return str_starts_with($nextPath, '/') ? $nextPath : null;
    }

    private function extractUserIdFromJwt(string $jwt): ?string
    {
        $parts = explode('.', $jwt);
        if (count($parts) < 2 || $parts[1] === '') {
            return null;
        }

        $payloadRaw = $parts[1];
        $padding = strlen($payloadRaw) % 4;
        if ($padding > 0) {
            $payloadRaw .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode(strtr($payloadRaw, '-_', '+/'), true);
        if (!is_string($decoded) || $decoded === '') {
            return null;
        }

        $payload = json_decode($decoded, true);
        if (!is_array($payload)) {
            return null;
        }

        $exp = $payload['exp'] ?? null;
        if (is_numeric($exp) && (int) $exp <= time()) {
            return null;
        }

        $sub = $payload['sub'] ?? null;
        if (!is_string($sub) || $sub === '') {
            return null;
        }

        return $sub;
    }

    private function supabaseClient(array $headers): PendingRequest
    {
        $client = Http::withHeaders($headers);

        $caBundle = config('services.supabase.http_ca_bundle');
        if (is_string($caBundle) && $caBundle !== '') {
            return $client->withOptions(['verify' => $caBundle]);
        }

        return $client->withOptions([
            'verify' => (bool) config('services.supabase.http_verify_ssl', true),
        ]);
    }

    private function extractAccessToken(Request $request): ?string
    {
        $bearer = $request->bearerToken();
        if (is_string($bearer) && $bearer !== '') {
            return $bearer;
        }

        $cookieToken = $request->cookie('sb-access-token');
        if (is_string($cookieToken) && $cookieToken !== '') {
            return $this->normalizeToken($cookieToken);
        }

        $rawCookieHeader = $request->headers->get('cookie');
        if (is_string($rawCookieHeader) && $rawCookieHeader !== '') {
            foreach (explode(';', $rawCookieHeader) as $pair) {
                $segment = trim($pair);
                if (!str_starts_with($segment, 'sb-access-token=')) {
                    continue;
                }

                $rawValue = substr($segment, strlen('sb-access-token='));
                if ($rawValue === false || $rawValue === '') {
                    continue;
                }

                return $this->normalizeToken($rawValue);
            }
        }

        return null;
    }

    private function normalizeToken(string $rawToken): ?string
    {
        $token = trim(urldecode($rawToken), "\"' ");
        return $token !== '' ? $token : null;
    }
}
