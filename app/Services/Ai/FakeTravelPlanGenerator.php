<?php

namespace App\Services\Ai;

use App\Contracts\Ai\TravelPlanGenerator;
use Carbon\CarbonImmutable;

class FakeTravelPlanGenerator implements TravelPlanGenerator
{
    /**
     * 外部通信を行わず、決定的な旅程結果を生成する。
     *
     * @param  array<string, mixed>  $requestPayload
     * @return array<string, mixed>
     */
    public function generate(array $requestPayload): array
    {
        $destination = is_string($requestPayload['destination'] ?? null)
            ? $requestPayload['destination']
            : '目的地未定';
        $startDate = is_string($requestPayload['start_date'] ?? null)
            ? $requestPayload['start_date']
            : '1970-01-01';
        $endDate = is_string($requestPayload['end_date'] ?? null)
            ? $requestPayload['end_date']
            : $startDate;
        $estimatedBudget = is_int($requestPayload['budget'] ?? null)
            ? $requestPayload['budget']
            : 0;

        $days = [];
        $date = CarbonImmutable::parse($startDate);
        $lastDate = CarbonImmutable::parse($endDate);
        $dayNumber = 1;

        while ($date->lessThanOrEqualTo($lastDate)) {
            $days[] = [
                'day_number' => $dayNumber,
                'date' => $date->toDateString(),
                'title' => "{$destination}を巡る{$dayNumber}日目",
                'items' => [
                    [
                        'sort_order' => 1,
                        'item_type' => 'spot',
                        'title' => "{$destination}の観光スポット",
                        'description' => "{$destination}の代表的な観光スポットを巡ります。",
                        'start_time' => '09:00',
                        'end_time' => '11:00',
                        'estimated_cost' => 0,
                    ],
                ],
            ];

            $date = $date->addDay();
            $dayNumber++;
        }

        return [
            'title' => "{$destination}のAI旅程",
            'summary' => "{$destination}を楽しむ旅行プランです。",
            'destination' => $destination,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'estimated_budget' => $estimatedBudget,
            'days' => $days,
        ];
    }
}
