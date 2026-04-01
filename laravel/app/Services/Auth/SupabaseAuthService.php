<?php

namespace App\Services\Auth;

use Illuminate\Http\Request;

class SupabaseAuthService
{
    public function getSessionUserId(Request $request): ?string
    {
        // Placeholder for Supabase session/token verification.
        // In Phase 2, verify JWT/session cookie and return authenticated user id.
        $userId = $request->header('X-User-Id');

        return is_string($userId) && $userId !== '' ? $userId : null;
    }

    public function buildMagicLinkRedirect(string $email): array
    {
        // Placeholder for Supabase magic-link initiation.
        return [
            'success' => true,
            'message' => 'Magic link initiation placeholder',
            'email' => $email,
        ];
    }
}
