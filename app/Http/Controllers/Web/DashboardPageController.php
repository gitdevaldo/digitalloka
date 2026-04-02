<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardPageController extends Controller
{
    public function overview(): View
    {
        return view('dashboard.app', ['initialPage' => 'overview']);
    }

    public function droplets(): View
    {
        return view('dashboard.app', ['initialPage' => 'products-droplets']);
    }

    public function products(Request $request): View
    {
        $section = (string) $request->query('section', 'all');
        $initialPage = match ($section) {
            'digital' => 'products-digital',
            'access' => 'products-access',
            default => 'products-all',
        };

        return view('dashboard.app', ['initialPage' => $initialPage]);
    }

    public function productDroplets(): View
    {
        return view('dashboard.app', ['initialPage' => 'products-droplets']);
    }

    public function orders(): View
    {
        return view('dashboard.app', ['initialPage' => 'orders']);
    }

    public function account(): View
    {
        return view('dashboard.app', ['initialPage' => 'account']);
    }

    public function support(): View
    {
        return view('dashboard.app', ['initialPage' => 'support']);
    }
}
