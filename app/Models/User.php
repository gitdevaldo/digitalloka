<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    protected $table = 'users';

    protected $fillable = [
        'id',
        'email',
        'role',
        'is_active',
        'droplet_ids',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'droplet_ids' => 'array',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(Entitlement::class, 'user_id', 'id');
    }
}
