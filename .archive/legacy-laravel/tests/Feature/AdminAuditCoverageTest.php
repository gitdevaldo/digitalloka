<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AdminAuditCoverageTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_order_status_update_writes_audit_log(): void
    {
        $admin = User::query()->create([
            'id' => 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $buyer = User::query()->create([
            'id' => 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            'email' => 'buyer@example.com',
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
            'name' => 'Starter Pack',
            'slug' => 'starter-pack',
            'product_type' => 'digital',
            'short_description' => 'Starter',
            'status' => 'available',
            'is_visible' => true,
        ]);

        $price = ProductPrice::query()->create([
            'product_id' => $product->id,
            'name' => 'Default',
            'amount' => 10,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $order = Order::query()->create([
            'user_id' => $buyer->id,
            'order_number' => 'ORD-ADMINTEST-1',
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal_amount' => 10,
            'total_amount' => 10,
            'currency' => 'USD',
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_price_id' => $price->id,
            'item_name' => $product->name,
            'quantity' => 1,
            'unit_price' => 10,
            'line_total' => 10,
        ]);

        Transaction::query()->create([
            'order_id' => $order->id,
            'provider' => 'manual',
            'provider_ref' => 'TXN-AUDIT-1',
            'status' => 'paid',
            'amount' => 10,
            'currency' => 'USD',
            'paid_at' => now(),
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->putJson('/api/admin/orders/' . $order->id . '/status', [
                'status' => 'paid',
            ])
            ->assertOk()
            ->assertJsonPath('order.status', 'paid');

        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $admin->id,
            'action' => 'admin.order.status.updated',
            'target_type' => 'order',
            'target_id' => (string) $order->id,
        ]);
    }

    public function test_admin_site_setting_upsert_rejects_invalid_key_shape(): void
    {
        $admin = User::query()->create([
            'id' => 'cccccccc-cccc-cccc-cccc-cccccccccccc',
            'email' => 'admin2@example.com',
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
            ->putJson('/api/admin/settings', [
                'setting_group' => 'homepage',
                'setting_key' => 'hero title',
                'setting_value' => ['x' => 1],
            ])
            ->assertStatus(422);
    }
}
