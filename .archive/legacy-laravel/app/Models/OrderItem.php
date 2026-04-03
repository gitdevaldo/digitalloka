<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_price_id',
        'item_name',
        'quantity',
        'unit_price',
        'line_total',
        'meta',
    ];

    protected $casts = [
        'quantity' => 'int',
        'unit_price' => 'float',
        'line_total' => 'float',
        'meta' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(Entitlement::class, 'order_item_id');
    }
}
