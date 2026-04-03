<?php

namespace App\Services\Access;

use App\Models\Entitlement;

class EntitlementService
{
    public const ALLOWED_STATUS_TRANSITIONS = [
        'pending' => ['active', 'revoked'],
        'active' => ['expired', 'revoked'],
        'expired' => ['active', 'revoked'],
        'revoked' => [],
    ];

    public function listUserEntitlements(string $userId, int $perPage = 20)
    {
        return Entitlement::query()
            ->with(['product:id,name,slug,status'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function updateStatus(Entitlement $entitlement, string $newStatus, ?string $reason = null): Entitlement
    {
        $currentStatus = (string) $entitlement->status;
        $allowedTransitions = self::ALLOWED_STATUS_TRANSITIONS[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowedTransitions, true)) {
            abort(422, 'Invalid entitlement status transition');
        }

        $entitlement->status = $newStatus;
        if ($newStatus === 'revoked') {
            $entitlement->revoked_at = now();
            $entitlement->revocation_reason = $reason;
        }

        if ($newStatus === 'expired' && $entitlement->expires_at === null) {
            $entitlement->expires_at = now();
        }

        $entitlement->save();

        return $entitlement;
    }
}
