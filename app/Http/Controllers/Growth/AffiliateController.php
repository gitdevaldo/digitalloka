<?php

namespace App\Http\Controllers\Growth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Growth\AffiliateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AffiliateService $affiliateService
    ) {
    }

    public function me(Request $request): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $account = $this->affiliateService->getOrCreateAccount($userId);

        return response()->json(['affiliate_account' => $account], 200);
    }

    public function recordReferral(Request $request): JsonResponse
    {
        $affiliateAccountId = (int) $request->input('affiliate_account_id', 0);
        if ($affiliateAccountId <= 0) {
            return response()->json(['error' => 'affiliate_account_id is required'], 422);
        }

        $referral = $this->affiliateService->recordReferral(
            $affiliateAccountId,
            $request->filled('order_id') ? (int) $request->input('order_id') : null,
            $request->filled('referred_user_id') ? (string) $request->input('referred_user_id') : null,
            (float) $request->input('commission_amount', 0)
        );

        return response()->json(['referral' => $referral], 201);
    }
}
