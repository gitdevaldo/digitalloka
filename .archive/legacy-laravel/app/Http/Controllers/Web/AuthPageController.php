<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AuthPageController extends Controller
{
    public function userLogin(Request $request): View
    {
        return view('auth.login', [
            'mode' => 'user',
            'title' => 'Sign in to Dashboard',
            'description' => 'Use your registered email to receive a secure magic link for your user dashboard.',
            'next' => $this->sanitizeNextPath((string) $request->query('next', '/dashboard'), '/dashboard'),
        ]);
    }

    public function adminLogin(Request $request): View
    {
        return view('auth.login', [
            'mode' => 'admin',
            'title' => 'Sign in to Admin Panel',
            'description' => 'Admin-only access. Sign in with an authorized administrator email.',
            'next' => $this->sanitizeNextPath((string) $request->query('next', '/admin'), '/admin'),
        ]);
    }

    private function sanitizeNextPath(string $nextPath, string $fallback): string
    {
        if ($nextPath === '' || !str_starts_with($nextPath, '/')) {
            return $fallback;
        }

        return $nextPath;
    }
}
