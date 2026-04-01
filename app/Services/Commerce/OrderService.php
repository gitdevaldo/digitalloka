<?php

namespace App\Services\Commerce;

use App\Models\Order;

class OrderService
{
    public const ALLOWED_STATUS_TRANSITIONS = [
        'pending' => ['paid', 'cancelled'],
        'paid' => ['fulfilled', 'cancelled'],
        'fulfilled' => [],
        'cancelled' => [],
    ];

    public function listUserOrders(string $userId, int $perPage = 20)
    {
        return Order::query()
            ->with(['items.product:id,name,slug', 'transactions:id,order_id,status,provider,amount,currency,paid_at'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getUserOrder(string $userId, int $orderId): ?Order
    {
        return Order::query()
            ->with(['items.product:id,name,slug', 'items.entitlements:id,order_item_id,status,expires_at', 'transactions'])
            ->where('user_id', $userId)
            ->where('id', $orderId)
            ->first();
    }

    public function listOrders(array $filters, int $perPage = 30)
    {
        $query = Order::query()->with(['user:id,email,role', 'items.product:id,name,slug']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();
    }

    public function getOrderById(int $orderId): ?Order
    {
        return Order::query()
            ->with(['user:id,email,role,is_active', 'items.product:id,name,slug', 'transactions'])
            ->where('id', $orderId)
            ->first();
    }

    public function updateOrderStatus(Order $order, string $newStatus): Order
    {
        $currentStatus = (string) $order->status;
        $allowedTransitions = self::ALLOWED_STATUS_TRANSITIONS[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowedTransitions, true)) {
            abort(422, 'Invalid order status transition');
        }

        $order->status = $newStatus;
        if ($newStatus === 'paid') {
            $order->payment_status = 'paid';
        }
        $order->save();

        return $order;
    }
}
