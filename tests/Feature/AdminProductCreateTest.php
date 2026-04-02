<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AdminProductCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_product(): void
    {
        $admin = User::query()->create([
            'id' => 'abababab-abab-abab-abab-abababababab',
            'email' => 'admin-create@example.com',
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

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/products', [
                'name' => 'New Product',
                'slug' => 'new-product',
                'product_type' => 'digital',
                'status' => 'available',
                'is_visible' => true,
            ])
            ->assertStatus(201)
            ->assertJsonPath('product.slug', 'new-product');
    }

    public function test_product_create_rejects_duplicate_slug_with_422(): void
    {
        $admin = User::query()->create([
            'id' => 'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd',
            'email' => 'admin-dup@example.com',
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

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/products', [
                'name' => 'Product A',
                'slug' => 'dupe-product',
                'product_type' => 'digital',
                'status' => 'available',
                'is_visible' => true,
            ])
            ->assertStatus(201);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/products', [
                'name' => 'Product B',
                'slug' => 'dupe-product',
                'product_type' => 'digital',
                'status' => 'available',
                'is_visible' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }
}
