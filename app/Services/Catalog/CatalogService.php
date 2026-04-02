<?php

namespace App\Services\Catalog;

use App\Models\Product;

class CatalogService
{
    public function listProducts(array $filters, int $perPage = 12)
    {
        $query = Product::query()
            ->with(['category:id,name,slug', 'prices' => function ($builder) {
                $builder->where('status', 'active')->orderByDesc('is_default');
            }])
            ->where('is_visible', true);

        if (!empty($filters['category'])) {
            $query->whereHas('category', function ($builder) use ($filters) {
                $builder->where('slug', $filters['category']);
            });
        }

        if (!empty($filters['type'])) {
            $query->where('product_type', $filters['type']);
        }

        if (!empty($filters['availability'])) {
            $query->where('status', $filters['availability']);
        }

        if (!empty($filters['search'])) {
            $keyword = (string) $filters['search'];
            $query->where(function ($builder) use ($keyword) {
                $builder->where('name', 'like', '%' . $keyword . '%')
                    ->orWhere('short_description', 'like', '%' . $keyword . '%')
                    ->orWhere('description', 'like', '%' . $keyword . '%');
            });
        }

        if (isset($filters['rating_min'])) {
            $query->where('rating', '>=', (float) $filters['rating_min']);
        }

        if (!empty($filters['tags'])) {
            $tags = array_values(array_filter(array_map('trim', explode(',', (string) $filters['tags']))));
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        if (!empty($filters['badges'])) {
            $badges = array_values(array_filter(array_map('trim', explode(',', (string) $filters['badges']))));
            foreach ($badges as $badge) {
                $query->whereJsonContains('badges', $badge);
            }
        }

        if (isset($filters['min_price']) || isset($filters['max_price'])) {
            $query->whereHas('prices', function ($builder) use ($filters) {
                if (isset($filters['min_price'])) {
                    $builder->where('amount', '>=', (float) $filters['min_price']);
                }
                if (isset($filters['max_price'])) {
                    $builder->where('amount', '<=', (float) $filters['max_price']);
                }
            });
        }

        $sort = $filters['sort'] ?? 'recommended';
        if ($sort === 'newest') {
            $query->orderByDesc('created_at');
        } elseif ($sort === 'price_asc') {
            $query->orderByRaw('(select min(amount) from product_prices where product_prices.product_id = products.id and product_prices.status = ?) asc', ['active']);
        } elseif ($sort === 'price_desc') {
            $query->orderByRaw('(select max(amount) from product_prices where product_prices.product_id = products.id and product_prices.status = ?) desc', ['active']);
        } elseif ($sort === 'rating') {
            $query->orderByDesc('rating')->orderByDesc('reviews_count');
        } else {
            $query->orderByDesc('is_visible')->orderBy('name');
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function getProductBySlug(string $slug): ?Product
    {
        return Product::query()
            ->with(['category:id,name,slug', 'prices' => function ($builder) {
                $builder->where('status', 'active')->orderByDesc('is_default');
            }])
            ->where('slug', $slug)
            ->where('is_visible', true)
            ->first();
    }
}
