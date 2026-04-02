<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CallbackController extends Controller
{
    public function show(Request $request): View
    {
        $next = (string) $request->query('next', '/dashboard');

        if (!str_starts_with($next, '/')) {
            $next = '/dashboard';
        }

        return view('auth.callback', ['next' => $next]);
    }
}
