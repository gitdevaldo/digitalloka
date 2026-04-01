<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Droplets\DropletController;
use App\Http\Controllers\Droplets\DropletActionController;
use App\Http\Middleware\EnsureSameOrigin;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [LoginController::class, 'store'])->middleware(EnsureSameOrigin::class);
Route::post('/auth/logout', [LogoutController::class, 'store'])->middleware(EnsureSameOrigin::class);

Route::get('/droplets', [DropletController::class, 'index']);
Route::get('/droplets/{id}', [DropletController::class, 'show']);
Route::get('/droplets/{id}/actions', [DropletActionController::class, 'index']);
Route::post('/droplets/{id}/actions', [DropletActionController::class, 'store'])->middleware(EnsureSameOrigin::class);
