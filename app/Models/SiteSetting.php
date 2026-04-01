<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'setting_group',
        'setting_key',
        'setting_value',
        'updated_by',
    ];

    protected $casts = [
        'setting_value' => 'array',
    ];
}
