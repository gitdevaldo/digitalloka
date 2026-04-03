<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthSessionCookiesTest extends TestCase
{
    public function test_session_endpoint_sets_auth_cookies(): void
    {
        $response = $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/auth/session', [
                'access_token' => 'token-access-123',
                'refresh_token' => 'token-refresh-123',
                'expires_in' => 3600,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $response->assertCookie('sb-access-token');
        $response->assertCookie('sb-refresh-token');
    }
}
