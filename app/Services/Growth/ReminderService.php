<?php

namespace App\Services\Growth;

use App\Models\Entitlement;
use Illuminate\Support\Facades\Log;

class ReminderService
{
    public function sendRenewalReminders(): int
    {
        $entitlements = Entitlement::query()
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays(7)])
            ->with('user:id,email')
            ->get();

        foreach ($entitlements as $entitlement) {
            // Placeholder dispatch: channel providers are decided later in the roadmap.
            Log::info('renewal_reminder_ready', [
                'user_id' => $entitlement->user_id,
                'entitlement_id' => $entitlement->id,
                'expires_at' => (string) $entitlement->expires_at,
            ]);
        }

        return $entitlements->count();
    }
}
