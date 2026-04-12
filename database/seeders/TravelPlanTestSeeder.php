<?php

namespace Database\Seeders;

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

        if (!$user) {
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
                    ->has(TravelPlanItem::factory(1), 'items')
            , 'days')
            ->create();
    }
}
