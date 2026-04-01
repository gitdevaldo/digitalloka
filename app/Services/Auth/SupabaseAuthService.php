<?php

namespace App\Services\Auth;

use Illuminate\Http\Request;
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

        $response = Http::withHeaders([
            'apikey' => (string) config('services.supabase.anon_key'),
            'Authorization' => 'Bearer ' . $token,
        ])->get(rtrim((string) config('services.supabase.url'), '/') . '/auth/v1/user');

        if (!$response->successful()) {
            return null;
        }

        $data = $response->json();
        $userId = $data['id'] ?? null;

        return is_string($userId) && $userId !== '' ? $userId : null;
    }

    public function startMagicLinkLogin(string $email): array
    {
        $payload = [
            'email' => $email,
            'create_user' => false,
            'options' => [
                'email_redirect_to' => (string) config('services.supabase.redirect_url'),
            ],
        ];

        $response = Http::withHeaders([
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

    private function extractAccessToken(Request $request): ?string
    {
        $bearer = $request->bearerToken();
        if (is_string($bearer) && $bearer !== '') {
            return $bearer;
        }

        $cookieToken = $request->cookie('sb-access-token');

        return is_string($cookieToken) && $cookieToken !== '' ? $cookieToken : null;
    }
}
