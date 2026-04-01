<?php

namespace App\Services\Access;

class DropletAccessService
{
    public function canAccessDroplet(string $userId, int $dropletId): bool
    {
        // Placeholder for database-backed droplet ownership check.
        // In Phase 2, query users.droplet_ids and validate membership.
        return $userId !== '' && $dropletId > 0;
    }

    public function listAssignedDropletIds(string $userId): array
    {
        // Placeholder for user droplet assignment lookup.
        return [];
    }
}
