<?php

namespace Tests\Feature;

use App\Models\Entitlement;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class UserProductActionQueueTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_product_action_is_processed_and_status_endpoint_returns_result(): void
    {
        $user = User::query()->create([
            'id' => '11111111-1111-1111-1111-111111111111',
            'email' => 'user@example.com',
            'role' => 'user',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create([
            'name' => 'Templates',
            'slug' => 'templates',
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'product_type' => 'digital',
            'short_description' => 'Test',
            'status' => 'available',
            'is_visible' => true,
        ]);

        Entitlement::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($user->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $response = $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/user/products/' . $product->id . '/actions', [
                'action' => 'renew',
            ])
            ->assertStatus(202)
            ->assertJsonPath('success', true)
            ->assertJsonPath('status', 'queued');

        $actionId = (int) $response->json('action_id');

        $this
            ->getJson('/api/user/products/' . $product->id . '/actions/' . $actionId)
            ->assertOk()
            ->assertJsonPath('action.id', $actionId)
            ->assertJsonPath('action.status', 'completed');
    }
}
