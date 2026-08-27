<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Cache;

class AiCostManager
{
    public function canCreate(): bool
    {
        $limit = $this->dailyLimit();

        if ($limit < 1) {
            return false;
        }

        return $this->dailyUsage() < $limit;
    }

    public function recordUsage(int $count = 1): void
    {
        if ($count < 1) {
            return;
        }

        $key = $this->dailyKey();
        $current = (int) Cache::get($key, 0);
        $next = $current + $count;

        Cache::put($key, $next, now()->endOfDay());
    }

    public function dailyUsage(): int
    {
        return (int) Cache::get($this->dailyKey(), 0);
    }

    private function dailyKey(): string
    {
        return 'ai:gemini:daily_usage:'.now()->toDateString();
    }

    private function dailyLimit(): int
    {
        return max(0, (int) config('services.gemini.daily_call_limit', 50));
    }
}
