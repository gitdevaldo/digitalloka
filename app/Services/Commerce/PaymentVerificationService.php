<?php

namespace App\Services\Commerce;

use App\Models\Order;
use App\Models\PaymentEvent;
use App\Models\Transaction;
use RuntimeException;

class PaymentVerificationService
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function verifySignature(string $payload, ?string $signature): bool
    {
        $secret = (string) config('services.payment.webhook_secret');
        if ($secret === '' || $signature === null || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }

    public function processWebhook(array $payload): array
    {
        $idempotencyKey = (string) ($payload['idempotency_key'] ?? '');
        if ($idempotencyKey === '') {
            throw new RuntimeException('Missing idempotency_key');
        }

        $existing = PaymentEvent::query()->where('idempotency_key', $idempotencyKey)->first();
        if ($existing !== null) {
            return [
                'processed' => false,
                'duplicate' => true,
                'message' => 'Duplicate payment event ignored',
            ];
        }

        $provider = (string) ($payload['provider'] ?? 'manual');
        $event = PaymentEvent::query()->create([
            'provider' => $provider,
            'event_id' => (string) ($payload['event_id'] ?? ''),
            'idempotency_key' => $idempotencyKey,
            'status' => 'received',
            'payload' => $payload,
        ]);

        $status = (string) ($payload['status'] ?? 'pending');
        $orderId = filter_var($payload['order_id'] ?? null, FILTER_VALIDATE_INT);
        if ($orderId === false) {
            throw new RuntimeException('Invalid order_id');
        }

        $order = Order::query()->where('id', (int) $orderId)->first();
        if ($order === null) {
            throw new RuntimeException('Order not found');
        }

        $transaction = Transaction::query()
            ->where('order_id', $order->id)
            ->where('provider', $provider)
            ->where('provider_ref', (string) ($payload['provider_ref'] ?? ''))
            ->first();

        if ($transaction === null) {
            $transaction = Transaction::query()->create([
                'order_id' => $order->id,
                'provider' => $provider,
                'provider_ref' => (string) ($payload['provider_ref'] ?? null),
                'idempotency_key' => $idempotencyKey,
                'status' => 'pending',
                'amount' => (float) ($payload['amount'] ?? $order->total_amount),
                'currency' => (string) ($payload['currency'] ?? $order->currency),
                'payload' => $payload,
            ]);
        }

        if ($status === 'paid') {
            $transaction->status = 'paid';
            $transaction->paid_at = now();
            $transaction->verified_at = now();
            $transaction->idempotency_key = $idempotencyKey;
            $transaction->payload = $payload;
            $transaction->save();

            $this->orderService->markPaidFromVerifiedPayment($order);
            $event->status = 'processed';
            $event->processed_at = now();
            $event->save();

            return [
                'processed' => true,
                'duplicate' => false,
                'order_id' => $order->id,
                'status' => 'paid',
            ];
        }

        $transaction->status = $status;
        $transaction->idempotency_key = $idempotencyKey;
        $transaction->payload = $payload;
        $transaction->save();

        $event->status = 'processed';
        $event->processed_at = now();
        $event->save();

        return [
            'processed' => true,
            'duplicate' => false,
            'order_id' => $order->id,
            'status' => $status,
        ];
    }
}
