<?php

namespace Tests\Feature\Services\Ai;

use App\Services\Ai\AiCostManager;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AiCostManagerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('cache.default', 'array');
        config()->set('services.gemini.daily_call_limit', 2);
        Cache::flush();
    }

    public function test_it_allows_generation_until_daily_limit_is_reached(): void
    {
        $manager = new AiCostManager;

        $this->assertTrue($manager->canCreate());
        $this->assertSame(0, $manager->dailyUsage());

        $manager->recordUsage();
        $this->assertSame(1, $manager->dailyUsage());
        $this->assertTrue($manager->canCreate());

        $manager->recordUsage();
        $this->assertSame(2, $manager->dailyUsage());
        $this->assertFalse($manager->canCreate());
    }
}
