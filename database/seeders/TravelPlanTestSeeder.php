<?php

namespace Database\Seeders;

use App\Enums\TransportationType;
use App\Enums\TravelPlanItemType;
use App\Models\TravelPlan;
use App\Models\TravelPlanDay;
use App\Models\TravelPlanItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TravelPlanTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->first();

        if (! $user) {
            $user = User::factory()->create([
                'name' => 'テストユーザー',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        TravelPlan::factory(15)
            ->for($user)
            ->has(
                TravelPlanDay::factory(3)
                    ->sequence(fn ($sequence) => ['day_number' => $sequence->index + 1])
                    ->has(
                        TravelPlanItem::factory(5)->sequence(
                            [
                                'sort_order' => 1,
                                'title' => 'ホテルを出発',
                                'spot_name' => '宿泊ホテル',
                                'start_time' => '08:00:00',
                                'stay_minutes' => 30,
                                'transportation_type' => null,
                                'travel_minutes' => 0,
                                'transportation_cost' => 0,
                                'visit_cost' => 0,
                                'item_type' => TravelPlanItemType::Hotel,
                            ],
                            [
                                'sort_order' => 2,
                                'title' => 'ホテルから観光スポットへ移動',
                                'spot_name' => null,
                                'start_time' => '08:30:00',
                                'stay_minutes' => 0,
                                'transportation_type' => TransportationType::Walk,
                                'travel_minutes' => 20,
                                'transportation_cost' => 0,
                                'visit_cost' => 0,
                                'item_type' => TravelPlanItemType::Transport,
                            ],
                            [
                                'sort_order' => 3,
                                'title' => '観光スポットを見学',
                                'spot_name' => 'サンプル観光スポット',
                                'start_time' => '09:00:00',
                                'stay_minutes' => 120,
                                'transportation_type' => null,
                                'travel_minutes' => 0,
                                'transportation_cost' => 0,
                                'visit_cost' => 1000,
                                'item_type' => TravelPlanItemType::Spot,
                            ],
                            [
                                'sort_order' => 4,
                                'title' => '次の観光スポットへ移動',
                                'spot_name' => null,
                                'start_time' => '11:00:00',
                                'stay_minutes' => 0,
                                'transportation_type' => TransportationType::Bus,
                                'travel_minutes' => 30,
                                'transportation_cost' => 230,
                                'visit_cost' => 0,
                                'item_type' => TravelPlanItemType::Transport,
                            ],
                            [
                                'sort_order' => 5,
                                'title' => '次の観光スポットを見学',
                                'spot_name' => 'サンプル観光スポット2',
                                'start_time' => '11:30:00',
                                'stay_minutes' => 90,
                                'transportation_type' => null,
                                'travel_minutes' => 0,
                                'transportation_cost' => 0,
                                'visit_cost' => 500,
                                'item_type' => TravelPlanItemType::Spot,
                            ],
                        ),
                        'items',
                    ),
                'days'
            )
            ->create();
    }
}
