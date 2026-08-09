<?php

namespace Tests\Feature\Api;

use App\Enums\TransportationType;
use App\Enums\TravelPlanItemType;
use App\Models\TravelPlan;
use App\Models\TravelPlanDay;
use App\Models\TravelPlanItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TravelPlanItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_plan_items_are_ordered_by_sort_order_and_transport_duration(): void
    {
        $user = User::factory()->create();
        $plan = TravelPlan::factory()->for($user)->create();
        $day = TravelPlanDay::factory()->for($plan)->create();

        TravelPlanItem::factory()->for($day)->create([
            'sort_order' => 2,
            'title' => '観光スポットを見学',
            'start_time' => '09:00:00',
            'stay_minutes' => 60,
            'item_type' => TravelPlanItemType::Spot,
        ]);
        TravelPlanItem::factory()->for($day)->create([
            'sort_order' => 1,
            'title' => '駅からホテルへ移動',
            'spot_name' => null,
            'start_time' => '10:00:00',
            'stay_minutes' => 0,
            'transportation_type' => TransportationType::Train,
            'travel_minutes' => 30,
            'item_type' => TravelPlanItemType::Transport,
        ]);
        Sanctum::actingAs($user);

        $this->getJson("/api/plans/{$plan->uuid}")
            ->assertOk()
            ->assertJsonPath('days.0.items.0.title', '駅からホテルへ移動')
            ->assertJsonPath('days.0.items.0.end_time', '10:30:00')
            ->assertJsonPath('days.0.items.0.transportation_type', 'train')
            ->assertJsonPath('days.0.items.1.title', '観光スポットを見学')
            ->assertJsonPath('days.0.items.1.end_time', '10:00:00');
    }
}
