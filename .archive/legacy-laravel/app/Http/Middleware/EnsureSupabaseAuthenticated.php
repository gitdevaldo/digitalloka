<?php

namespace App\Http\Middleware;

use App\Services\Auth\SupabaseAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSupabaseAuthenticated
{
    public function __construct(private readonly SupabaseAuthService $authService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            $target = $request->getRequestUri();
            return redirect('/login?next=' . urlencode($target));
        }

        return $next($request);
    }
}
