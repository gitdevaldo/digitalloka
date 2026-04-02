<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Catalog\ProductController as CatalogProductController;
use App\Http\Controllers\Droplets\DropletController;
use App\Http\Controllers\Droplets\DropletActionController;
use App\Http\Controllers\User\CheckoutController as UserCheckoutController;
use App\Http\Controllers\User\OrderController as UserOrderController;
use App\Http\Controllers\User\ProductController as UserProductController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\EntitlementController as AdminEntitlementController;
use App\Http\Controllers\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Admin\DropletController as AdminDropletController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Middleware\EnsureSameOrigin;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [LoginController::class, 'store'])->middleware(EnsureSameOrigin::class);
Route::post('/auth/logout', [LogoutController::class, 'store'])->middleware(EnsureSameOrigin::class);

Route::get('/droplets', [DropletController::class, 'index']);
Route::get('/droplets/{id}', [DropletController::class, 'show']);
Route::get('/droplets/{id}/actions', [DropletActionController::class, 'index']);
Route::post('/droplets/{id}/actions', [DropletActionController::class, 'store'])->middleware(EnsureSameOrigin::class);

Route::get('/products', [CatalogProductController::class, 'index']);
Route::get('/products/{slug}', [CatalogProductController::class, 'show']);

Route::get('/user/products', [UserProductController::class, 'index']);
Route::post('/user/products/{id}/actions', [UserProductController::class, 'action'])->middleware(EnsureSameOrigin::class);
Route::get('/user/orders', [UserOrderController::class, 'index']);
Route::get('/user/orders/{id}', [UserOrderController::class, 'show']);
Route::post('/user/checkout', [UserCheckoutController::class, 'store'])->middleware(EnsureSameOrigin::class);

Route::get('/admin/products', [AdminProductController::class, 'index']);
Route::post('/admin/products', [AdminProductController::class, 'store'])->middleware(EnsureSameOrigin::class);
Route::put('/admin/products/{id}', [AdminProductController::class, 'update'])->middleware(EnsureSameOrigin::class);
Route::get('/admin/orders', [AdminOrderController::class, 'index']);
Route::get('/admin/orders/{id}', [AdminOrderController::class, 'show']);
Route::put('/admin/orders/{id}/status', [AdminOrderController::class, 'updateStatus'])->middleware(EnsureSameOrigin::class);
Route::get('/admin/users', [AdminUserController::class, 'index']);
Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
Route::put('/admin/users/{id}/access', [AdminUserController::class, 'updateAccess'])->middleware(EnsureSameOrigin::class);
Route::get('/admin/entitlements', [AdminEntitlementController::class, 'index']);
Route::put('/admin/entitlements/{id}/status', [AdminEntitlementController::class, 'updateStatus'])->middleware(EnsureSameOrigin::class);
Route::get('/admin/droplets', [AdminDropletController::class, 'index']);
Route::post('/admin/droplets/{id}/actions', [AdminDropletController::class, 'storeAction'])->middleware(EnsureSameOrigin::class);
Route::get('/admin/audit-logs', [AdminAuditLogController::class, 'index']);
Route::get('/admin/settings', [AdminSiteSettingController::class, 'index']);
Route::put('/admin/settings', [AdminSiteSettingController::class, 'upsert'])->middleware(EnsureSameOrigin::class);
