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
