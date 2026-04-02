<?php

namespace Tests\Feature;

use App\Models\Entitlement;
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

class PaymentWebhookAndEntitlementExpiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_mark_order_paid_without_verified_payment(): void
    {
        $admin = User::query()->create([
            'id' => '10101010-1111-1111-1111-111111111111',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $buyer = User::query()->create([
            'id' => '20202020-2222-2222-2222-222222222222',
            'email' => 'buyer@example.com',
            'role' => 'user',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create(['name' => 'Templates', 'slug' => 'templates']);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Starter',
            'slug' => 'starter',
            'product_type' => 'digital',
            'short_description' => 'Starter product',
            'status' => 'available',
            'is_visible' => true,
        ]);
        $price = ProductPrice::query()->create([
            'product_id' => $product->id,
            'name' => 'Default',
            'amount' => 15,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $order = Order::query()->create([
            'user_id' => $buyer->id,
            'order_number' => 'ORD-NOVERIFY-1',
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal_amount' => 15,
            'total_amount' => 15,
            'currency' => 'USD',
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_price_id' => $price->id,
            'item_name' => 'Starter',
            'quantity' => 1,
            'unit_price' => 15,
            'line_total' => 15,
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->putJson('/api/admin/orders/' . $order->id . '/status', ['status' => 'paid'])
            ->assertStatus(422);
    }

    public function test_webhook_marks_order_paid_and_is_idempotent(): void
    {
        config()->set('services.payment.webhook_secret', 'test-secret');

        $buyer = User::query()->create([
            'id' => '30303030-3333-3333-3333-333333333333',
            'email' => 'buyer2@example.com',
            'role' => 'user',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create(['name' => 'Plugins', 'slug' => 'plugins']);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Plugin A',
            'slug' => 'plugin-a',
            'product_type' => 'digital',
            'short_description' => 'Plugin',
            'status' => 'available',
            'is_visible' => true,
        ]);
        $price = ProductPrice::query()->create([
            'product_id' => $product->id,
            'name' => 'Default',
            'amount' => 20,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $order = Order::query()->create([
            'user_id' => $buyer->id,
            'order_number' => 'ORD-WEBHOOK-1',
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal_amount' => 20,
            'total_amount' => 20,
            'currency' => 'USD',
        ]);

        $item = OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_price_id' => $price->id,
            'item_name' => 'Plugin A',
            'quantity' => 1,
            'unit_price' => 20,
            'line_total' => 20,
        ]);

        Transaction::query()->create([
            'order_id' => $order->id,
            'provider' => 'manual',
            'provider_ref' => 'TXN-123',
            'status' => 'pending',
            'amount' => 20,
            'currency' => 'USD',
        ]);

        $payload = [
            'provider' => 'manual',
            'event_id' => 'evt-1',
            'idempotency_key' => 'idem-1',
            'order_id' => $order->id,
            'provider_ref' => 'TXN-123',
            'status' => 'paid',
            'amount' => 20,
            'currency' => 'USD',
        ];
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $json, 'test-secret');

        $this
            ->withHeader('X-Payment-Signature', $signature)
            ->postJson('/api/payments/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('processed', true)
            ->assertJsonPath('status', 'paid');

        $order->refresh();
        $this->assertSame('paid', $order->status);
        $this->assertDatabaseHas('transactions', [
            'order_id' => $order->id,
            'status' => 'paid',
            'idempotency_key' => 'idem-1',
        ]);
        $this->assertDatabaseHas('entitlements', [
            'order_item_id' => $item->id,
            'user_id' => $buyer->id,
            'status' => 'active',
        ]);

        $this
            ->withHeader('X-Payment-Signature', $signature)
            ->postJson('/api/payments/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('processed', false)
            ->assertJsonPath('duplicate', true);
    }

    public function test_entitlement_expire_command_marks_expired_status(): void
    {
        $user = User::query()->create([
            'id' => '40404040-4444-4444-4444-444444444444',
            'email' => 'u@example.com',
            'role' => 'user',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create(['name' => 'Cat', 'slug' => 'cat']);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'P',
            'slug' => 'p',
            'product_type' => 'digital',
            'short_description' => 'x',
            'status' => 'available',
            'is_visible' => true,
        ]);

        $entitlement = Entitlement::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'status' => 'active',
            'starts_at' => now()->subDays(10),
            'expires_at' => now()->subMinute(),
        ]);

        $this->artisan('entitlements:expire')->assertExitCode(0);

        $entitlement->refresh();
        $this->assertSame('expired', $entitlement->status);
    }
}
