<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Contracts\Cookie\Factory as CookieFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use RuntimeException;

class LoginController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly CookieFactory $cookieFactory
    ) {
    }

    public function store(Request $request): JsonResponse
    {
        $rateLimitKey = $this->rateLimitKey($request);
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $retryAfter = RateLimiter::availableIn($rateLimitKey);

            return response()->json([
                'error' => 'Too many login attempts. Please try again later.',
                'kind' => 'rate_limited',
                'retry_after' => $retryAfter,
            ], 429);
        }

        $payload = $request->validate([
            'email' => ['required', 'email'],
            'next' => ['nullable', 'string'],
            'mode' => ['nullable', 'in:user,admin'],
        ]);

        $next = isset($payload['next']) && is_string($payload['next']) && str_starts_with($payload['next'], '/')
            ? $payload['next']
            : null;

        $mode = isset($payload['mode']) && in_array($payload['mode'], ['user', 'admin'], true)
            ? $payload['mode']
            : 'user';

        try {
            $result = $this->authService->startMagicLinkLogin($payload['email'], $next, $mode);
        } catch (RuntimeException $exception) {
            RateLimiter::hit($rateLimitKey, 60);

            return response()->json([
                'error' => $exception->getMessage(),
                'kind' => 'service',
            ], 503);
        }

        RateLimiter::clear($rateLimitKey);

        return response()->json($result, 200);
    }

    public function storeSession(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'access_token' => ['required', 'string'],
            'refresh_token' => ['nullable', 'string'],
            'expires_in' => ['nullable', 'integer', 'min:60', 'max:86400'],
        ]);

        $expiresIn = (int) ($payload['expires_in'] ?? 3600);
        $accessCookieMinutes = max(1, (int) ceil($expiresIn / 60));

        $response = response()->json(['success' => true], 200);
        $response->headers->setCookie(
            $this->cookieFactory->make(
                'sb-access-token',
                (string) $payload['access_token'],
                $accessCookieMinutes,
                '/',
                null,
                request()->isSecure(),
                true,
                false,
                'lax'
            )
        );

        if (isset($payload['refresh_token']) && is_string($payload['refresh_token']) && $payload['refresh_token'] !== '') {
            $response->headers->setCookie(
                $this->cookieFactory->make(
                    'sb-refresh-token',
                    $payload['refresh_token'],
                    60 * 24 * 30,
                    '/',
                    null,
                    request()->isSecure(),
                    true,
                    false,
                    'lax'
                )
            );
        }

        return $response;
    }

    private function rateLimitKey(Request $request): string
    {
        $email = (string) $request->input('email', 'unknown');

        return 'auth:magic-link:' . strtolower($email) . '|' . (string) $request->ip();
    }
}
