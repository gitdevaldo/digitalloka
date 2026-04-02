<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'product_type',
        'short_description',
        'description',
        'status',
        'is_visible',
        'rating',
        'reviews_count',
        'tags',
        'badges',
        'faq_items',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'tags' => 'array',
        'badges' => 'array',
        'faq_items' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class, 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(Entitlement::class, 'product_id');
    }
}
