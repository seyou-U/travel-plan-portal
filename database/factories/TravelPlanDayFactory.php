<?php

namespace Database\Factories;

use App\Models\TravelPlan;
use App\Models\TravelPlanDay;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<TravelPlanDay>
 */
class TravelPlanDayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'travel_plan_id' => TravelPlan::factory(),
            'day_number' => 1,
            'prefecture_code' => fake()->randomElement(['13', '27', '40']),
            'date' => fake()->date(),
        ];
    }

    /**
     * 指定した旅行開始日と日数を元に旅行計画日の属性を設定する
     */
    public function forPlanDate(string $startDate, int $dayNumber): static
    {
        return $this->state(function () use ($startDate, $dayNumber) {
            return [
                'day_number' => $dayNumber,
                'date' => Carbon::parse($startDate)
                    ->addDays($dayNumber - 1)
                    ->format('Y-m-d'),
            ];
        });
    }
}
