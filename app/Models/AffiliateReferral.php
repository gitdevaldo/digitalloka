<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateReferral extends Model
{
    protected $fillable = [
        'affiliate_account_id',
        'order_id',
        'referred_user_id',
        'status',
        'commission_amount',
        'currency',
        'converted_at',
        'meta',
    ];

    protected $casts = [
        'commission_amount' => 'float',
        'converted_at' => 'datetime',
        'meta' => 'array',
    ];

    public function affiliateAccount(): BelongsTo
    {
        return $this->belongsTo(AffiliateAccount::class, 'affiliate_account_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
