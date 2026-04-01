<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    public function __construct(private readonly SupabaseAuthService $authService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $licenses = \App\Models\License::query()
            ->whereHas('entitlement', function ($builder) use ($userId) {
                $builder->where('user_id', $userId);
            })
            ->with('entitlement.product:id,name,slug')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($licenses, 200);
    }
}
