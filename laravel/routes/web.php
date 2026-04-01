<?php

use App\Http\Controllers\Auth\CallbackController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/callback', [CallbackController::class, 'show']);
