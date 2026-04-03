<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class AdminPageController extends Controller
{
    public function overview(): View
    {
        return view('admin.app', ['initialPage' => 'overview']);
    }

    public function products(): View
    {
        return view('admin.app', ['initialPage' => 'products']);
    }

    public function productCreate(): View
    {
        return view('admin.app', ['initialPage' => 'product-create']);
    }

    public function productEdit(string $id): View
    {
        $productId = filter_var($id, FILTER_VALIDATE_INT);

        return view('admin.app', [
            'initialPage' => 'product-edit',
            'initialProductEditId' => $productId !== false ? (int) $productId : null,
        ]);
    }

    public function productTypes(): View
    {
        return view('admin.app', ['initialPage' => 'product-types']);
    }

    public function productStocks(): View
    {
        return view('admin.app', ['initialPage' => 'product-stocks']);
    }

    public function productStocksByProduct(string $id): View
    {
        $productId = filter_var($id, FILTER_VALIDATE_INT);

        return view('admin.app', [
            'initialPage' => 'product-stocks',
            'initialStockProductId' => $productId !== false ? (int) $productId : null,
        ]);
    }

    public function productTypeCreate(): View
    {
        return view('admin.app', [
            'initialPage' => 'product-type-editor',
            'initialProductType' => null,
        ]);
    }

    public function productTypeEdit(string $type): View
    {
        return view('admin.app', [
            'initialPage' => 'product-type-editor',
            'initialProductType' => $type,
        ]);
    }

    public function users(): View
    {
        return view('admin.app', ['initialPage' => 'users']);
    }

    public function orders(): View
    {
        return view('admin.app', ['initialPage' => 'orders']);
    }

    public function settings(): View
    {
        return view('admin.app', ['initialPage' => 'settings']);
    }

    public function entitlements(): View
    {
        return view('admin.app', ['initialPage' => 'entitlements']);
    }

    public function droplets(): View
    {
        return view('admin.app', ['initialPage' => 'droplets']);
    }

    public function auditLogs(): View
    {
        return view('admin.app', ['initialPage' => 'audit']);
    }

    public function account(): View
    {
        return view('admin.app', ['initialPage' => 'account']);
    }

    public function support(): View
    {
        return view('admin.app', ['initialPage' => 'support']);
    }
}
