<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;
use App\Models\User;
use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SmokeIntegrationFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_endpoint_smoke(): void
    {
        $category = ProductCategory::query()->create([
            'name' => 'Templates',
            'slug' => 'templates',
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Smoke Product',
            'slug' => 'smoke-product',
            'product_type' => 'digital',
            'short_description' => 'Smoke',
            'status' => 'available',
            'is_visible' => true,
        ]);

        ProductPrice::query()->create([
            'product_id' => $product->id,
            'name' => 'Default',
            'amount' => 5,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_dashboard_web_guard_smoke(): void
    {
        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn(null);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $this->get('/dashboard')->assertRedirect('/login?next=%2Fdashboard');
    }

    public function test_admin_api_guard_smoke(): void
    {
        $admin = User::query()->create([
            'id' => '55555555-5555-5555-5555-555555555555',
            'email' => 'admin-smoke@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this->getJson('/api/admin/products')->assertOk();
    }
}
