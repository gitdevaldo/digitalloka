<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductStockItem;
use App\Models\User;
use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AdminProductStockManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_appends_and_skips_duplicate_credentials(): void
    {
        $admin = User::query()->create([
            'id' => 'a1111111-1111-1111-1111-111111111111',
            'email' => 'admin-stock@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create([
            'name' => 'Account',
            'slug' => 'account',
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Github Account',
            'slug' => 'github-account',
            'product_type' => 'digital',
            'short_description' => 'Github account stock',
            'status' => 'available',
            'is_visible' => true,
            'meta' => [
                'stock_headers' => ['Email', 'Password', 'RecoveryCode'],
            ],
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/product-stocks/import', [
                'product_id' => $product->id,
                'headers' => ['Email', 'Password', 'RecoveryCode'],
                'rows' => "one@mail.com|pass1|rec1\ntwo@mail.com|pass2|rec2",
            ])
            ->assertCreated()
            ->assertJsonPath('inserted', 2)
            ->assertJsonPath('skipped_duplicates', 0);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/product-stocks/import', [
                'product_id' => $product->id,
                'headers' => ['Email', 'Password', 'RecoveryCode'],
                'rows' => "two@mail.com|pass2|rec2\nthree@mail.com|pass3|rec3",
            ])
            ->assertCreated()
            ->assertJsonPath('inserted', 1)
            ->assertJsonPath('skipped_duplicates', 0)
            ->assertJsonPath('invalid_count', 1);

        $this->assertSame(3, ProductStockItem::query()->where('product_id', $product->id)->count());
    }

    public function test_import_rejects_mismatched_headers_against_configured_product_headers(): void
    {
        $admin = User::query()->create([
            'id' => 'a3333333-3333-3333-3333-333333333333',
            'email' => 'admin-stock3@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create([
            'name' => 'Account',
            'slug' => 'account',
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Discord Account',
            'slug' => 'discord-account',
            'product_type' => 'digital',
            'short_description' => 'Discord account stock',
            'status' => 'available',
            'is_visible' => true,
            'meta' => [
                'stock_headers' => ['Email', 'Password', 'RecoveryCode'],
            ],
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/product-stocks/import', [
                'product_id' => $product->id,
                'headers' => ['Username', 'Password', 'RecoveryCode'],
                'rows' => "aldo_user|pass1|rec1",
            ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'Imported headers must match configured product stock headers exactly.');
    }

    public function test_import_marks_duplicate_email_rows_in_uploaded_payload_as_invalid(): void
    {
        $admin = User::query()->create([
            'id' => 'a4444444-4444-4444-4444-444444444444',
            'email' => 'admin-stock4@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create([
            'name' => 'Account',
            'slug' => 'account',
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Canva Account',
            'slug' => 'canva-account',
            'product_type' => 'digital',
            'short_description' => 'Canva account stock',
            'status' => 'available',
            'is_visible' => true,
            'meta' => [
                'stock_headers' => ['Email', 'Password', 'RecoveryCode'],
            ],
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/product-stocks/import', [
                'product_id' => $product->id,
                'headers' => ['Email', 'Password', 'RecoveryCode'],
                'rows' => "same@mail.com|pass1|rec1\nsame@mail.com|pass2|rec2",
            ])
            ->assertCreated()
            ->assertJsonPath('inserted', 1)
            ->assertJsonPath('invalid_count', 1);

        $this->assertSame(1, ProductStockItem::query()->where('product_id', $product->id)->count());
    }

    public function test_can_create_update_delete_single_stock_item(): void
    {
        $admin = User::query()->create([
            'id' => 'a2222222-2222-2222-2222-222222222222',
            'email' => 'admin-stock2@example.com',
            'role' => 'admin',
            'is_active' => true,
            'droplet_ids' => [],
        ]);

        $category = ProductCategory::query()->create([
            'name' => 'Account',
            'slug' => 'account',
        ]);

        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Github Account Pro',
            'slug' => 'github-account-pro',
            'product_type' => 'digital',
            'short_description' => 'Github account stock',
            'status' => 'available',
            'is_visible' => true,
        ]);

        $authService = Mockery::mock(SupabaseAuthService::class);
        $authService->shouldReceive('getSessionUserId')->andReturn($admin->id);
        $this->app->instance(SupabaseAuthService::class, $authService);

        $adminAccessService = Mockery::mock(AdminAccessService::class);
        $adminAccessService->shouldReceive('isAdmin')->andReturn(true);
        $this->app->instance(AdminAccessService::class, $adminAccessService);

        $create = $this
            ->withHeader('Origin', 'http://localhost')
            ->postJson('/api/admin/product-stocks', [
                'product_id' => $product->id,
                'credential_data' => [
                    'Email' => 'new@mail.com',
                    'Password' => 'newpass',
                ],
            ])
            ->assertCreated();

        $stockId = (int) $create->json('item.id');

        $this
            ->withHeader('Origin', 'http://localhost')
            ->putJson('/api/admin/product-stocks/' . $stockId, [
                'credential_data' => [
                    'Email' => 'edited@mail.com',
                    'Password' => 'edited-pass',
                ],
                'status' => 'unsold',
            ])
            ->assertOk()
            ->assertJsonPath('item.credential_data.Email', 'edited@mail.com');

        $this
            ->withHeader('Origin', 'http://localhost')
            ->deleteJson('/api/admin/product-stocks/' . $stockId)
            ->assertOk()
            ->assertJsonPath('deleted', true);

        $this->assertDatabaseMissing('product_stock_items', ['id' => $stockId]);
    }
}
