<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\CreateCheckoutRequest;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Commerce\OrderService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly OrderService $orderService
    ) {
    }

    public function store(CreateCheckoutRequest $request): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = $this->orderService->createCheckoutOrder($userId, $request->validated());

        return response()->json(['order' => $order], 201);
    }
}
