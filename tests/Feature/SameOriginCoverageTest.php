<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureSameOrigin;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class SameOriginCoverageTest extends TestCase
{
    public function test_all_mutating_api_routes_have_same_origin_middleware_except_allowed_external_routes(): void
    {
        $allowedExternalUris = [
            'api/payments/webhook',
        ];

        $mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

        foreach (Route::getRoutes() as $route) {
            $uri = $route->uri();
            if (!str_starts_with($uri, 'api/')) {
                continue;
            }

            $methods = array_values(array_intersect($route->methods(), $mutatingMethods));
            if ($methods === []) {
                continue;
            }

            if (in_array($uri, $allowedExternalUris, true)) {
                continue;
            }

            $middleware = $route->gatherMiddleware();
            $this->assertContains(
                EnsureSameOrigin::class,
                $middleware,
                'Missing EnsureSameOrigin middleware on route: ' . $uri . ' [' . implode(',', $methods) . ']'
            );
        }
    }
}
