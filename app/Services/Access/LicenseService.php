<?php

namespace App\Services\Access;

use App\Models\Entitlement;
use App\Models\License;
use Illuminate\Support\Str;

class LicenseService
{
    public function issue(Entitlement $entitlement): License
    {
        $license = License::query()->create([
            'entitlement_id' => $entitlement->id,
            'license_key' => $this->generateKey(),
            'status' => 'active',
            'issued_at' => now(),
        ]);

        return $license;
    }

    public function validateByKey(string $licenseKey): ?License
    {
        $license = License::query()->where('license_key', $licenseKey)->first();
        if ($license === null) {
            return null;
        }

        $license->last_validated_at = now();
        $license->save();

        return $license;
    }

    public function revoke(License $license, ?string $reason = null): License
    {
        $license->status = 'revoked';
        $license->revoked_at = now();
        $license->revocation_reason = $reason;
        $license->save();

        return $license;
    }

    private function generateKey(): string
    {
        return strtoupper(Str::random(6) . '-' . Str::random(6) . '-' . Str::random(6));
    }
}
