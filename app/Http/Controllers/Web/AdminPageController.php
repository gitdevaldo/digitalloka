<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class AdminPageController extends Controller
{
    public function overview(): View
    {
        return view('admin.overview');
    }

    public function products(): View
    {
        return view('admin.products');
    }

    public function users(): View
    {
        return view('admin.users');
    }

    public function orders(): View
    {
        return view('admin.orders');
    }

    public function settings(): View
    {
        return view('admin.settings');
    }
}
