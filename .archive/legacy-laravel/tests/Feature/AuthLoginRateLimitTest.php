<?php

namespace Tests\Feature;

use App\Services\Auth\SupabaseAuthService;
use Illuminate\Support\Facades\RateLimiter;
use Mockery;
use Tests\TestCase;

class AuthLoginRateLimitTest extends TestCase
{
    protected function tearDown(): void
    {
        RateLimiter::clear('auth:magic-link:user@example.com|127.0.0.1');
        parent::tearDown();
    }

    public function test_login_endpoint_is_rate_limited_after_too_many_attempts(): void
    {
        $service = Mockery::mock(SupabaseAuthService::class);
        $service
            ->shouldReceive('startMagicLinkLogin')
            ->andThrow(new \RuntimeException('upstream unavailable'));
        $this->app->instance(SupabaseAuthService::class, $service);

        for ($i = 0; $i < 5; $i++) {
            $this
                ->withHeader('Origin', 'http://localhost')
                ->postJson('/api/auth/login', [
                    'email' => 'user@example.com',
                    'mode' => 'user',
                ])
                ->assertStatus(503)
                ->assertJsonPath('kind', 'service');
        }

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/auth/login', [
                'email' => 'user@example.com',
                'mode' => 'user',
            ])
            ->assertStatus(429)
            ->assertJsonPath('kind', 'rate_limited');
    }
}
