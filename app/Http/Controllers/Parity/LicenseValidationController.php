<?php

namespace App\Http\Controllers\Parity;

use App\Http\Controllers\Controller;
use App\Models\Entitlement;
use App\Services\Access\LicenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseValidationController extends Controller
{
    public function __construct(private readonly LicenseService $licenseService)
    {
    }

    public function validateKey(Request $request): JsonResponse
    {
        $licenseKey = (string) $request->input('license_key', '');
        if ($licenseKey === '') {
            return response()->json(['error' => 'license_key is required'], 422);
        }

        $license = $this->licenseService->validateByKey($licenseKey);
        if ($license === null) {
            return response()->json(['valid' => false, 'message' => 'License not found'], 404);
        }

        return response()->json([
            'valid' => $license->status === 'active',
            'license' => $license,
        ], 200);
    }

    public function issue(Request $request): JsonResponse
    {
        $entitlementId = (int) $request->input('entitlement_id', 0);
        if ($entitlementId <= 0) {
            return response()->json(['error' => 'entitlement_id is required'], 422);
        }

        $entitlement = Entitlement::query()->find($entitlementId);
        if ($entitlement === null) {
            return response()->json(['error' => 'Entitlement not found'], 404);
        }

        $license = $this->licenseService->issue($entitlement);

        return response()->json(['license' => $license], 201);
    }

    public function revoke(Request $request): JsonResponse
    {
        $licenseId = (int) $request->input('license_id', 0);
        if ($licenseId <= 0) {
            return response()->json(['error' => 'license_id is required'], 422);
        }

        $license = \App\Models\License::query()->find($licenseId);
        if ($license === null) {
            return response()->json(['error' => 'License not found'], 404);
        }

        $updated = $this->licenseService->revoke($license, (string) $request->input('reason'));

        return response()->json(['license' => $updated], 200);
    }
}
