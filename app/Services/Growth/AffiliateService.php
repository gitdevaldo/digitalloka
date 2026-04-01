<?php

namespace App\Services\Growth;

use App\Models\AffiliateAccount;
use App\Models\AffiliateReferral;
use Illuminate\Support\Str;

class AffiliateService
{
    public function getOrCreateAccount(string $userId): AffiliateAccount
    {
        $existing = AffiliateAccount::query()->where('user_id', $userId)->first();
        if ($existing !== null) {
            return $existing;
        }

        return AffiliateAccount::query()->create([
            'user_id' => $userId,
            'code' => 'aff-' . Str::lower(Str::random(8)),
            'status' => 'active',
            'default_commission_rate' => 10,
        ]);
    }

    public function recordReferral(int $affiliateAccountId, ?int $orderId, ?string $referredUserId, float $commissionAmount): AffiliateReferral
    {
        return AffiliateReferral::query()->create([
            'affiliate_account_id' => $affiliateAccountId,
            'order_id' => $orderId,
            'referred_user_id' => $referredUserId,
            'status' => $orderId !== null ? 'converted' : 'pending',
            'commission_amount' => $commissionAmount,
            'currency' => 'IDR',
            'converted_at' => $orderId !== null ? now() : null,
        ]);
    }
}
