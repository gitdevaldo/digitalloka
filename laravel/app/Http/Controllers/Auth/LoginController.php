<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $result = $this->authService->buildMagicLinkRedirect($payload['email']);

        return response()->json($result, 200);
    }
}
