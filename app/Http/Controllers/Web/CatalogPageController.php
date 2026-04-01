<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class CatalogPageController extends Controller
{
    public function index(): View
    {
        return view('catalog.index');
    }

    public function show(string $slug): View
    {
        return view('catalog.show', ['slug' => $slug]);
    }
}
