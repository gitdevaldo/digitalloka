<?php

namespace App\Services\DigitalOcean;

class DigitalOceanService
{
    public function listDroplets(array $dropletIds, ?string $userId = null): array
    {
        // Placeholder for DigitalOcean list by explicit id set.
        return [];
    }

    public function getDroplet(int $dropletId, ?string $userId = null): array
    {
        // Placeholder for DigitalOcean droplet detail fetch.
        return [
            'id' => $dropletId,
            'name' => 'placeholder',
            'status' => 'off',
        ];
    }

    public function performAction(int $dropletId, string $actionType, ?string $userId = null): array
    {
        // Placeholder for DigitalOcean droplet action request.
        return [
            'id' => 0,
            'type' => $actionType,
            'status' => 'in-progress',
            'droplet_id' => $dropletId,
        ];
    }

    public function listActions(int $dropletId, ?string $userId = null): array
    {
        // Placeholder for DigitalOcean action history fetch.
        return [];
    }
}
