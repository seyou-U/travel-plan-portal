<?php

use App\Http\Controllers\AuthenticatedUserController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true]));
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'store']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthenticatedUserController::class, 'show']);
    Route::post('/logout', [LogoutController::class, 'store']);
});
