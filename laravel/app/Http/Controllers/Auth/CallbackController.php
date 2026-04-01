<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CallbackController extends Controller
{
    public function show(Request $request): RedirectResponse
    {
        $next = (string) $request->query('next', '/dashboard');

        if (!str_starts_with($next, '/')) {
            $next = '/dashboard';
        }

        return redirect($next);
    }
}
