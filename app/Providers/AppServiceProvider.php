<?php

namespace App\Providers;

use App\Contracts\Ai\TravelPlanGenerator;
use App\Services\Ai\GeminiTravelPlanGenerator;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            TravelPlanGenerator::class,
            GeminiTravelPlanGenerator::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('password-forgot', function (Request $request): array {
            $email = strtolower((string) $request->input('email'));
            $ip = $request->ip();
            $response = function (Request $request, array $headers) {
                return response()->json([
                    'code' => 'TOO_MANY_REQUESTS',
                    'message' => 'しばらく時間をおいてから再度お試しください。',
                ], 429, $headers);
            };

            return [
                Limit::perMinutes(10, 5)
                    ->by("password-forgot:{$email}|{$ip}")
                    ->response($response),
                Limit::perMinute(30)
                    ->by("password-forgot:ip:{$ip}")
                    ->response($response),
            ];
        });
    }
}
