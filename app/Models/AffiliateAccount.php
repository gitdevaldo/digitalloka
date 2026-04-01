<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AffiliateAccount extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'status',
        'default_commission_rate',
        'meta',
    ];

    protected $casts = [
        'default_commission_rate' => 'float',
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(AffiliateReferral::class, 'affiliate_account_id');
    }
}
