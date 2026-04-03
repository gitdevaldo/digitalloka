<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogProductsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_api_applies_reference_filters(): void
    {
        $templateCategory = ProductCategory::create([
            'name' => 'Templates',
            'slug' => 'template',
        ]);

        $uiKitCategory = ProductCategory::create([
            'name' => 'UI Kits',
            'slug' => 'ui-kit',
        ]);

        $matching = Product::create([
            'category_id' => $templateCategory->id,
            'name' => 'NovaDash UI Kit',
            'slug' => 'novadash-ui-kit',
            'product_type' => 'template',
            'short_description' => 'Premium template with React blocks.',
            'status' => 'available',
            'is_visible' => true,
            'rating' => 4.9,
            'reviews_count' => 120,
            'tags' => ['figma', 'react'],
            'badges' => ['sale', 'bestseller'],
        ]);

        ProductPrice::create([
            'product_id' => $matching->id,
            'name' => 'Default',
            'amount' => 49,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $excludedByPrice = Product::create([
            'category_id' => $templateCategory->id,
            'name' => 'Expensive Template',
            'slug' => 'expensive-template',
            'product_type' => 'template',
            'short_description' => 'Higher priced product.',
            'status' => 'available',
            'is_visible' => true,
            'rating' => 4.8,
            'reviews_count' => 75,
            'tags' => ['figma'],
            'badges' => ['sale'],
        ]);

        ProductPrice::create([
            'product_id' => $excludedByPrice->id,
            'name' => 'Default',
            'amount' => 150,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $excludedByCategory = Product::create([
            'category_id' => $uiKitCategory->id,
            'name' => 'UI Kit Starter',
            'slug' => 'ui-kit-starter',
            'product_type' => 'ui-kit',
            'short_description' => 'Starter component set.',
            'status' => 'available',
            'is_visible' => true,
            'rating' => 4.7,
            'reviews_count' => 35,
            'tags' => ['figma'],
            'badges' => ['sale'],
        ]);

        ProductPrice::create([
            'product_id' => $excludedByCategory->id,
            'name' => 'Default',
            'amount' => 30,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $response = $this->getJson('/api/products?category=template&max_price=100&rating_min=4&tags=figma&badges=sale&sort=price_desc');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'novadash-ui-kit');
    }

    public function test_products_api_supports_search_and_rating_sort(): void
    {
        $category = ProductCategory::create([
            'name' => 'Plugins',
            'slug' => 'plugin',
        ]);

        $highRated = Product::create([
            'category_id' => $category->id,
            'name' => 'WordPress Velocity Plugin',
            'slug' => 'wordpress-velocity-plugin',
            'product_type' => 'plugin',
            'short_description' => 'Performance toolkit for WordPress.',
            'status' => 'available',
            'is_visible' => true,
            'rating' => 4.9,
            'reviews_count' => 90,
            'tags' => ['wordpress'],
            'badges' => ['new'],
        ]);

        ProductPrice::create([
            'product_id' => $highRated->id,
            'name' => 'Default',
            'amount' => 19,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $lowerRated = Product::create([
            'category_id' => $category->id,
            'name' => 'WordPress Cache Plugin',
            'slug' => 'wordpress-cache-plugin',
            'product_type' => 'plugin',
            'short_description' => 'Caching helper for blogs.',
            'status' => 'available',
            'is_visible' => true,
            'rating' => 4.2,
            'reviews_count' => 40,
            'tags' => ['wordpress'],
            'badges' => [],
        ]);

        ProductPrice::create([
            'product_id' => $lowerRated->id,
            'name' => 'Default',
            'amount' => 12,
            'currency' => 'USD',
            'status' => 'active',
            'is_default' => true,
        ]);

        $response = $this->getJson('/api/products?search=WordPress&sort=rating');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'wordpress-velocity-plugin')
            ->assertJsonCount(2, 'data');
    }
}
