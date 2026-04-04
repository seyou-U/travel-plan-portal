<?php

namespace Database\Seeders;

use App\Models\TravelPlan;
use App\Models\TravelPlanDay;
use App\Models\TravelPlanItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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

        if (!$user) {
            $user = User::factory()->create([
                'name' => 'テストユーザー',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        $plan = TravelPlan::factory()->create([
            'user_id' => $user->id,
        ]);

        $day1 = TravelPlanDay::factory()
            ->forPlanDate($plan->start_date, 1)
            ->create([
                'travel_plan_id' => $plan->id,
            ]);

        $day2 = TravelPlanDay::factory()
            ->forPlanDate($plan->start_date, 2)
            ->create([
                'travel_plan_id' => $plan->id,
            ]);

        TravelPlanItem::factory()->create([
            'travel_plan_day_id' => $day1->id,
        ]);

        TravelPlanItem::factory()->create([
            'travel_plan_day_id' => $day1->id,
        ]);

        TravelPlanItem::factory()->create([
            'travel_plan_day_id' => $day2->id,
        ]);

    }
}
