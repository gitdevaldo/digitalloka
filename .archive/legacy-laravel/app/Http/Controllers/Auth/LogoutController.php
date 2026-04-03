<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class LogoutController extends Controller
{
    public function store(): JsonResponse
    {
        return response()->json(['success' => true], 200)
            ->withoutCookie('sb-access-token', '/')
            ->withoutCookie('sb-refresh-token', '/');
    }
}
