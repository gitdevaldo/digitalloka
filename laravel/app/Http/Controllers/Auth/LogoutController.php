<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class LogoutController extends Controller
{
    public function store(): JsonResponse
    {
        // Placeholder for session invalidation logic.
        return response()->json(['success' => true], 200);
    }
}
