<?php

namespace App\Services\Commerce;

use App\Models\Entitlement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
            $hasVerifiedPayment = Transaction::query()
                ->where('order_id', $order->id)
                ->where('status', 'paid')
                ->exists();

            if (!$hasVerifiedPayment) {
                abort(422, 'Paid transition requires verified payment transaction');
            }

            $order->payment_status = 'paid';
            $this->ensureEntitlementsForPaidOrder($order);
        }
        $order->save();

        return $order;
    }

    public function markPaidFromVerifiedPayment(Order $order): Order
    {
        if ((string) $order->status === 'paid' && (string) $order->payment_status === 'paid') {
            return $order;
        }

        $order->status = 'paid';
        $order->payment_status = 'paid';
        $order->save();

        $this->ensureEntitlementsForPaidOrder($order);

        return $order->fresh() ?? $order;
    }

    public function createCheckoutOrder(string $userId, array $payload): Order
    {
        return DB::transaction(function () use ($userId, $payload): Order {
            $product = Product::query()->where('id', (int) $payload['product_id'])->first();
            if ($product === null || !$product->is_visible) {
                abort(404, 'Product not found');
            }

            $selectedPrice = $this->resolvePrice($product, $payload);
            $quantity = (int) ($payload['quantity'] ?? 1);
            $lineTotal = (float) $selectedPrice->amount * $quantity;

            $order = Order::query()->create([
                'user_id' => $userId,
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'status' => 'pending',
                'payment_status' => 'pending',
                'subtotal_amount' => $lineTotal,
                'total_amount' => $lineTotal,
                'currency' => $selectedPrice->currency,
                'meta' => [
                    'affiliate_code' => $payload['affiliate_code'] ?? null,
                ],
            ]);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_price_id' => $selectedPrice->id,
                'item_name' => $product->name,
                'quantity' => $quantity,
                'unit_price' => $selectedPrice->amount,
                'line_total' => $lineTotal,
                'meta' => [
                    'product_slug' => $product->slug,
                ],
            ]);

            Transaction::query()->create([
                'order_id' => $order->id,
                'provider' => 'manual',
                'status' => 'pending',
                'amount' => $lineTotal,
                'currency' => $selectedPrice->currency,
            ]);

            return $this->getOrderById((int) $order->id) ?? $order;
        });
    }

    private function resolvePrice(Product $product, array $payload): ProductPrice
    {
        if (isset($payload['product_price_id'])) {
            $price = ProductPrice::query()
                ->where('id', (int) $payload['product_price_id'])
                ->where('product_id', $product->id)
                ->where('status', 'active')
                ->first();

            if ($price !== null) {
                return $price;
            }
        }

        $defaultPrice = ProductPrice::query()
            ->where('product_id', $product->id)
            ->where('status', 'active')
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->first();

        if ($defaultPrice === null) {
            abort(422, 'No active pricing available for product');
        }

        return $defaultPrice;
    }

    private function ensureEntitlementsForPaidOrder(Order $order): void
    {
        $items = $order->items()->get();
        foreach ($items as $item) {
            $exists = Entitlement::query()
                ->where('order_item_id', $item->id)
                ->where('user_id', $order->user_id)
                ->exists();

            if ($exists) {
                continue;
            }

            Entitlement::query()->create([
                'user_id' => $order->user_id,
                'product_id' => $item->product_id,
                'order_item_id' => $item->id,
                'status' => 'active',
                'starts_at' => now(),
                'meta' => [
                    'source_order_id' => $order->id,
                ],
            ]);
        }
    }
}
