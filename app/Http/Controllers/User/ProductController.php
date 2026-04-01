<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ProductActionRequest;
use App\Services\Access\EntitlementService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly EntitlementService $entitlementService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $entitlements = $this->entitlementService->listUserEntitlements($userId, 20);

        return response()->json($entitlements, 200);
    }

    public function action(ProductActionRequest $request, string $productId): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'success' => true,
            'product_id' => (int) $productId,
            'action' => $request->validated('action'),
            'message' => 'Action accepted and queued for processing',
        ], 202);
    }
}
