<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class License extends Model
{
    protected $fillable = [
        'entitlement_id',
        'license_key',
        'status',
        'issued_at',
        'last_validated_at',
        'revoked_at',
        'revocation_reason',
        'meta',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'last_validated_at' => 'datetime',
        'revoked_at' => 'datetime',
        'meta' => 'array',
    ];

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(Entitlement::class, 'entitlement_id');
    }
}
