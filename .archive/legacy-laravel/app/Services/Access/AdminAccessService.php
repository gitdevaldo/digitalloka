<?php

namespace App\Services\Access;

use App\Models\User;

class AdminAccessService
{
    public function isAdmin(string $userId): bool
    {
        if ($userId === '') {
            return false;
        }

        $user = User::query()->select(['role', 'is_active'])->where('id', $userId)->first();
        if ($user === null || !$user->is_active) {
            return false;
        }

        return in_array((string) $user->role, ['admin', 'super-admin'], true);
    }
}
