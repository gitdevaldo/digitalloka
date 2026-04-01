<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Commerce\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly OrderService $orderService,
        private readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $orders = $this->orderService->listOrders($request->query(), 30);

        return response()->json($orders, 200);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $orderId = filter_var($id, FILTER_VALIDATE_INT);
        if ($orderId === false) {
            return response()->json(['error' => 'Invalid order ID'], 400);
        }

        $order = $this->orderService->getOrderById((int) $orderId);
        if ($order === null) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json(['order' => $order], 200);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $orderId = filter_var($id, FILTER_VALIDATE_INT);
        if ($orderId === false) {
            return response()->json(['error' => 'Invalid order ID'], 400);
        }

        $order = $this->orderService->getOrderById((int) $orderId);
        if ($order === null) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $oldStatus = (string) $order->status;
        $updatedOrder = $this->orderService->updateOrderStatus($order, (string) $request->validated('status'));

        $this->auditLogService->log(
            'admin.order.status.updated',
            'order',
            (string) $updatedOrder->id,
            $adminUserId,
            'admin',
            ['from' => $oldStatus, 'to' => $updatedOrder->status],
            $request
        );

        return response()->json(['order' => $updatedOrder], 200);
    }
}
