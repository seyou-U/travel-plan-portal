<?php

use App\Http\Controllers\Api\GenerateAiPlanController;
use App\Http\Controllers\Api\ShowAiPlanRequestStatusController;
use App\Http\Controllers\AuthenticatedUserController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\TravelPlan;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'store']);
Route::post('/password/forgot', [ForgotPasswordController::class, 'store'])
    ->middleware('throttle:password-forgot');
Route::post('/password/reset', [ResetPasswordController::class, 'store']);
Route::get('/me', [AuthenticatedUserController::class, 'show']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'destroy']);
    Route::post('/ai/plans/generate', GenerateAiPlanController::class);
    Route::get('/ai/requests/{id}', ShowAiPlanRequestStatusController::class);

    Route::get('/plans', [TravelPlan::class, 'index']);
    Route::get('/plans/{uuid}', [TravelPlan::class, 'show']);
});
