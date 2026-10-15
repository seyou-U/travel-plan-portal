<?php

namespace App\Actions;

use App\Models\TravelPlan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreTravelPlanAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): TravelPlan
    {
        return DB::transaction(function () use ($user, $data): TravelPlan {
            $plan = TravelPlan::query()->create([
                'uuid' => (string) Str::uuid(),
                'user_id' => $user->getKey(),
                'title' => $data['title'],
                'start_date' => $data['start_date'],
                'days_count' => $data['days_count'],
                'budget_per_person' => $data['budget_per_person'],
            ]);

            $startDate = CarbonImmutable::createFromFormat('!Y-m-d', $data['start_date']);
            foreach ($data['days'] as $dayData) {
                $day = $plan->days()->create([
                    'day_number' => $dayData['day_number'],
                    'prefecture_code' => $dayData['prefecture_code'],
                    'date' => $startDate->addDays($dayData['day_number'] - 1)->toDateString(),
                ]);

                foreach (array_values($dayData['items']) as $index => $itemData) {
                    $day->items()->create([
                        'spot_id' => $itemData['spot_id'] ?? null,
                        'sort_order' => $index + 1,
                        'item_type' => $itemData['item_type'],
                        'title' => $itemData['title'],
                        'spot_name' => $itemData['spot_name'] ?? null,
                        'start_time' => $itemData['start_time'],
                        'stay_minutes' => $itemData['stay_minutes'],
                        'transportation_type' => $itemData['transportation_type'] ?? null,
                        'travel_minutes' => $itemData['travel_minutes'],
                        'transportation_cost' => $itemData['transportation_cost'],
                        'visit_cost' => $itemData['visit_cost'],
                        'memo' => $itemData['memo'] ?? null,
                    ]);
                }
            }

            return $plan;
        });
    }
}
