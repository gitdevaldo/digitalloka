<?php

namespace App\Http\Middleware;

use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSupabaseAdminAuthenticated
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $target = $request->getRequestUri();
        $userId = $this->authService->getSessionUserId($request);

        if ($userId === null) {
            return redirect('/admin/login?next=' . urlencode($target));
        }

        if (!$this->adminAccessService->isAdmin($userId)) {
            return redirect('/admin/login?next=' . urlencode($target) . '&error=forbidden');
        }

        return $next($request);
    }
}
