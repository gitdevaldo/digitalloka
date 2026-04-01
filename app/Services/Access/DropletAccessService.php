<?php

namespace App\Services\Access;

use App\Models\User;

class DropletAccessService
{
    public function canAccessDroplet(string $userId, int $dropletId): bool
    {
        if ($userId === '' || $dropletId <= 0) {
            return false;
        }

        $user = User::query()->select(['droplet_ids'])->where('id', $userId)->first();
        if ($user === null) {
            return false;
        }

        $dropletIds = $this->normalizeDropletIds($user->droplet_ids);

        return in_array($dropletId, $dropletIds, true);
    }

    public function listAssignedDropletIds(string $userId): array
    {
        if ($userId === '') {
            return [];
        }

        $user = User::query()->select(['droplet_ids'])->where('id', $userId)->first();
        if ($user === null) {
            return [];
        }

        return $this->normalizeDropletIds($user->droplet_ids);
    }

    private function normalizeDropletIds(mixed $rawDropletIds): array
    {
        if (is_array($rawDropletIds)) {
            return array_values(array_unique(array_map('intval', $rawDropletIds)));
        }

        if (is_string($rawDropletIds) && $rawDropletIds !== '') {
            $decoded = json_decode($rawDropletIds, true);
            if (is_array($decoded)) {
                return array_values(array_unique(array_map('intval', $decoded)));
            }

            // PostgreSQL array form: {1,2,3}
            if (str_starts_with($rawDropletIds, '{') && str_ends_with($rawDropletIds, '}')) {
                $trimmed = trim($rawDropletIds, '{}');
                if ($trimmed === '') {
                    return [];
                }
                return array_values(array_unique(array_map('intval', explode(',', $trimmed))));
            }
        }

        return [];
    }
}
