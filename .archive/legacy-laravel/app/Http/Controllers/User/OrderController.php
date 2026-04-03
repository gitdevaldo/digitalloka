<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Commerce\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly OrderService $orderService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $orders = $this->orderService->listUserOrders($userId, 20);

        return response()->json($orders, 200);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $orderId = filter_var($id, FILTER_VALIDATE_INT);
        if ($orderId === false) {
            return response()->json(['error' => 'Invalid order ID'], 400);
        }

        $order = $this->orderService->getUserOrder($userId, (int) $orderId);
        if ($order === null) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json(['order' => $order], 200);
    }
}
