<?php

use App\Http\Controllers\Auth\CallbackController;
use App\Http\Controllers\Web\AdminPageController;
use App\Http\Controllers\Web\CatalogPageController;
use App\Http\Controllers\Web\DashboardPageController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/callback', [CallbackController::class, 'show']);

Route::get('/', [CatalogPageController::class, 'index']);
Route::get('/products/{slug}', [CatalogPageController::class, 'show']);

Route::get('/dashboard', [DashboardPageController::class, 'overview']);
Route::get('/dashboard/droplets', [DashboardPageController::class, 'droplets']);
Route::get('/dashboard/products', [DashboardPageController::class, 'products']);
Route::get('/dashboard/orders', [DashboardPageController::class, 'orders']);

Route::get('/admin', [AdminPageController::class, 'overview']);
Route::get('/admin/products', [AdminPageController::class, 'products']);
Route::get('/admin/users', [AdminPageController::class, 'users']);
Route::get('/admin/orders', [AdminPageController::class, 'orders']);
Route::get('/admin/settings', [AdminPageController::class, 'settings']);
