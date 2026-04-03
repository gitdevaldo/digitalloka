<?php

namespace App\Http\Controllers\Payments;

use App\Http\Controllers\Controller;
use App\Services\Commerce\PaymentVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class WebhookController extends Controller
{
    public function __construct(private readonly PaymentVerificationService $paymentVerificationService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $rawPayload = (string) $request->getContent();
        $signature = $request->header('X-Payment-Signature');

        if (!$this->paymentVerificationService->verifySignature($rawPayload, $signature)) {
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }

        $payload = $request->json()->all();
        if (!is_array($payload)) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        try {
            $result = $this->paymentVerificationService->processWebhook($payload);
        } catch (RuntimeException $exception) {
            return response()->json([
                'error' => $exception->getMessage(),
                'kind' => 'validation',
            ], 422);
        }

        return response()->json($result, 200);
    }
}
