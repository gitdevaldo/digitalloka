<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    protected $fillable = [
        'id',
        'email',
        'droplet_ids',
    ];

    public $incrementing = false;

    protected $keyType = 'string';
}
