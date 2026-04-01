<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSameOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('origin');
        $host = $request->getSchemeAndHttpHost();

        if ($origin !== null && strcasecmp(rtrim($origin, '/'), rtrim($host, '/')) !== 0) {
            return response()->json(['error' => 'Request origin is not allowed'], 403);
        }

        return $next($request);
    }
}
