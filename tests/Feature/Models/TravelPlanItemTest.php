<?php

namespace Tests\Feature\Models;

use App\Enums\TransportationType;
use App\Enums\TravelPlanItemType;
use App\Models\Spot;
use App\Models\TravelPlanDay;
use App\Models\TravelPlanItem;
use Database\Seeders\TravelPlanTestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelPlanItemTest extends TestCase
{
    use RefreshDatabase;

    public function test_transport_item_uses_schema_defaults_and_enum_casts(): void
    {
        $day = TravelPlanDay::factory()->create();

        $item = TravelPlanItem::query()->create([
            'travel_plan_day_id' => $day->id,
            'sort_order' => 1,
            'title' => '駅からホテルへ移動',
            'start_time' => '09:00:00',
            'transportation_type' => TransportationType::Train,
            'travel_minutes' => 20,
            'item_type' => TravelPlanItemType::Transport,
        ])->refresh();

        $this->assertNull($item->spot_id);
        $this->assertNull($item->spot_name);
        $this->assertSame(0, $item->stay_minutes);
        $this->assertSame(20, $item->travel_minutes);
        $this->assertSame(0, $item->transportation_cost);
        $this->assertSame(0, $item->visit_cost);
        $this->assertSame(TransportationType::Train, $item->transportation_type);
        $this->assertSame(TravelPlanItemType::Transport, $item->item_type);
    }

    public function test_deleting_spot_sets_spot_id_to_null(): void
    {
        $spot = Spot::query()->create([
            'name' => 'テストスポット',
            'prefecture_code' => '13',
        ]);
        $item = TravelPlanItem::factory()->create([
            'spot_id' => $spot->id,
            'spot_name' => $spot->name,
        ]);

        $spot->forceDelete();

        $this->assertNull($item->refresh()->spot_id);
        $this->assertSame('テストスポット', $item->spot_name);
    }

    public function test_travel_plan_seeder_creates_ordered_transport_and_regular_items(): void
    {
        $this->seed(TravelPlanTestSeeder::class);

        $this->assertDatabaseCount('travel_plan_items', 225);

        $day = TravelPlanDay::query()->firstOrFail();
        $items = $day->items()->orderBy('sort_order')->get();

        $this->assertSame([1, 2, 3, 4, 5], $items->pluck('sort_order')->all());
        $this->assertSame(TravelPlanItemType::Hotel, $items[0]->item_type);
        $this->assertSame(TravelPlanItemType::Transport, $items[1]->item_type);
        $this->assertSame(TransportationType::Walk, $items[1]->transportation_type);
        $this->assertNull($items[1]->spot_name);
        $this->assertSame(0, $items[1]->stay_minutes);
        $this->assertGreaterThanOrEqual(1, $items[1]->travel_minutes);
        $this->assertSame(TravelPlanItemType::Spot, $items[2]->item_type);
        $this->assertNull($items[2]->transportation_type);
        $this->assertGreaterThanOrEqual(1, $items[2]->stay_minutes);
        $this->assertSame(0, $items[2]->travel_minutes);
    }
}
