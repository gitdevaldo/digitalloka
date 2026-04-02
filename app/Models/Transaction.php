<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'order_id',
        'provider',
        'provider_ref',
        'idempotency_key',
        'status',
        'amount',
        'currency',
        'paid_at',
        'verified_at',
        'payload',
    ];

    protected $casts = [
        'amount' => 'float',
        'paid_at' => 'datetime',
        'verified_at' => 'datetime',
        'payload' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
