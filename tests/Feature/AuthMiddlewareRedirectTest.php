<?php

namespace Tests\Feature;

use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Mockery;
use Tests\TestCase;

class AuthMiddlewareRedirectTest extends TestCase
{
    public function test_dashboard_redirects_to_login_when_not_authenticated(): void
    {
        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn(null);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $this->get('/dashboard')
            ->assertRedirect('/login?next=%2Fdashboard');
    }

    public function test_admin_redirects_to_admin_login_when_not_authenticated(): void
    {
        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn(null);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $this->get('/admin')
            ->assertRedirect('/admin/login?next=%2Fadmin');
    }

    public function test_admin_redirects_with_forbidden_when_user_is_not_admin(): void
    {
        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn('user-id-1');
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->with('user-id-1')->andReturn(false);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this->get('/admin')
            ->assertRedirect('/admin/login?next=%2Fadmin&error=forbidden');
    }
}
