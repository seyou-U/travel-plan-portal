<?php

namespace Database\Factories;

use App\Models\TravelPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TravelPlan>
 */
class TravelPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()
            ->dateTimeBetween('+1 week', '+2 month')
            ->format('Y-m-d');

        return [
            'uuid' => Str::uuid(),
            'user_id' => User::factory(),
            'title' => fake()->randomElement([
                '大阪旅行',
                '京都旅行',
                '福岡旅行'
            ]),
            'start_date' => $startDate,
            'days_count' => fake()->numberBetween(1, 3),
            'budget_per_person' => fake()->numberBetween(5000, 30000),
        ];
    }
}
