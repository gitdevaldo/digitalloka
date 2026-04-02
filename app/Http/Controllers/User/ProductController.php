<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ProductActionRequest;
use App\Jobs\ProcessUserProductAction;
use App\Models\Product;
use App\Models\UserProductAction;
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

        $normalizedProductId = filter_var($productId, FILTER_VALIDATE_INT);
        if ($normalizedProductId === false || (int) $normalizedProductId <= 0) {
            return response()->json(['error' => 'Invalid product ID'], 400);
        }

        $product = Product::query()->where('id', (int) $normalizedProductId)->first();
        if ($product === null) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $action = UserProductAction::query()->create([
            'user_id' => $userId,
            'product_id' => (int) $normalizedProductId,
            'action' => (string) $request->validated('action'),
            'status' => 'queued',
            'request_payload' => [
                'requested_at' => now()->toIso8601String(),
            ],
        ]);

        ProcessUserProductAction::dispatch($action->id);

        return response()->json([
            'success' => true,
            'product_id' => (int) $normalizedProductId,
            'action' => $request->validated('action'),
            'action_id' => $action->id,
            'status' => $action->status,
            'message' => 'Action accepted and queued for processing',
        ], 202);
    }

    public function actionStatus(Request $request, string $productId, string $actionId): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $normalizedProductId = filter_var($productId, FILTER_VALIDATE_INT);
        if ($normalizedProductId === false || (int) $normalizedProductId <= 0) {
            return response()->json(['error' => 'Invalid product ID'], 400);
        }

        $normalizedActionId = filter_var($actionId, FILTER_VALIDATE_INT);
        if ($normalizedActionId === false || (int) $normalizedActionId <= 0) {
            return response()->json(['error' => 'Invalid action ID'], 400);
        }

        $action = UserProductAction::query()
            ->where('id', (int) $normalizedActionId)
            ->where('user_id', $userId)
            ->where('product_id', (int) $normalizedProductId)
            ->first();

        if ($action === null) {
            return response()->json(['error' => 'Action not found'], 404);
        }

        return response()->json([
            'action' => [
                'id' => $action->id,
                'product_id' => $action->product_id,
                'action' => $action->action,
                'status' => $action->status,
                'result_payload' => $action->result_payload,
                'error_message' => $action->error_message,
                'started_at' => optional($action->started_at)?->toIso8601String(),
                'completed_at' => optional($action->completed_at)?->toIso8601String(),
            ],
        ], 200);
    }
}
