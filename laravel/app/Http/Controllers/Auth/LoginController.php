<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class LoginController extends Controller
{
    public function __construct(private readonly SupabaseAuthService $authService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            $result = $this->authService->startMagicLinkLogin($payload['email']);
        } catch (RuntimeException $exception) {
            return response()->json([
                'error' => $exception->getMessage(),
                'kind' => 'service',
            ], 503);
        }

        return response()->json($result, 200);
    }
}
