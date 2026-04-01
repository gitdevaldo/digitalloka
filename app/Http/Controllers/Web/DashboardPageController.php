<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class DashboardPageController extends Controller
{
    public function overview(): View
    {
        return view('dashboard.overview');
    }

    public function products(): View
    {
        return view('dashboard.products');
    }

    public function orders(): View
    {
        return view('dashboard.orders');
    }

    public function licenses(): View
    {
        return view('dashboard.licenses');
    }

    public function droplets(): View
    {
        return view('dashboard.droplets');
    }
}
