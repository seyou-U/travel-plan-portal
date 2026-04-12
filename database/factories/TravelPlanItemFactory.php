<?php

namespace Database\Factories;

use App\Models\TravelPlanDay;
use App\Models\TravelPlanItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TravelPlanItem>
 */
class TravelPlanItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startHour = fake()->numberBetween(8, 20);
        $startMinute = fake()->randomElement([0, 15, 30, 45]);
        $stayMinutes = fake()->randomElement([30, 60, 90, 120]);

        return [
            'travel_plan_day_id' => TravelPlanDay::factory(),
            'title' => fake()->randomElement([
                '大阪城を見にいく',
                'カフェで休憩',
                '海遊館に行く',
                'ホテルにチェックイン'
            ]),
            'spot_name' => fake()->randomElement([
                '大阪城',
                '海遊館',
                '道頓堀',
                'ユニバーサル・スタジオ・ジャパン',
            ]),
            'start_time' => sprintf('%02d:%s:00', $startHour, $startMinute),
            'stay_minutes' => $stayMinutes,
            'transportation_type' => fake()->randomElement([1, 2, 3, 4]),
            'travel_minutes' => fake()->randomElement([10, 20, 30, 45, 60]),
            'transportation_cost' => fake()->numberBetween(0, 10000),
            'visit_cost' => fake()->numberBetween(0, 5000),
        ];
    }
}
