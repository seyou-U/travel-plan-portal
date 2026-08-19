<?php

namespace App\Services\Ai\Schemas;

use App\Enums\TransportationType;
use InvalidArgumentException;

class AiTravelPlanResultSchema
{
    /**
     * @var list<string>
     */
    public const ITEM_TYPES = [
        'spot',
        'meal',
        'hotel',
        'transport',
    ];

    /**
     * Gemini Structured Output用のJSON Schemaを返す。
     *
     * @return array<string, mixed>
     */
    public function toArray(?int $expectedDaysCount = null): array
    {
        if ($expectedDaysCount !== null && $expectedDaysCount < 1) {
            throw new InvalidArgumentException('旅行日数は1日以上で指定してください。');
        }

        $daysSchema = [
            'type' => 'array',
            'minItems' => $expectedDaysCount ?? 1,
            'items' => [
                'type' => 'object',
                'additionalProperties' => false,
                'properties' => [
                    'day_number' => ['type' => 'integer', 'minimum' => 1],
                    'date' => ['type' => 'string', 'format' => 'date'],
                    'title' => ['type' => 'string'],
                    'items' => [
                        'type' => 'array',
                        'minItems' => 1,
                        'items' => [
                            'type' => 'object',
                            'additionalProperties' => false,
                            'properties' => [
                                'sort_order' => ['type' => 'integer', 'minimum' => 1],
                                'item_type' => [
                                    'type' => 'string',
                                    'enum' => self::ITEM_TYPES,
                                ],
                                'title' => ['type' => 'string'],
                                'start_time' => ['type' => ['string', 'null']],
                                'stay_minutes' => ['type' => 'integer', 'minimum' => 1],
                                'visit_cost' => ['type' => 'integer', 'minimum' => 0],
                                'transportation_type' => [
                                    'type' => ['string', 'null'],
                                    'enum' => [
                                        ...array_column(TransportationType::cases(), 'value'),
                                        null,
                                    ],
                                ],
                                'transportation_cost' => ['type' => 'integer', 'minimum' => 0],
                                'memo' => ['type' => ['string', 'null']],
                            ],
                            'required' => [
                                'sort_order',
                                'item_type',
                                'title',
                                'start_time',
                                'stay_minutes',
                                'visit_cost',
                                'transportation_type',
                                'transportation_cost',
                                'memo',
                            ],
                        ],
                    ],
                ],
                'required' => [
                    'day_number',
                    'date',
                    'title',
                    'items',
                ],
            ],
        ];

        if ($expectedDaysCount !== null) {
            $daysSchema['maxItems'] = $expectedDaysCount;
        }

        return [
            'type' => 'object',
            'additionalProperties' => false,
            'properties' => [
                'title' => ['type' => 'string'],
                'summary' => ['type' => 'string'],
                'destination' => ['type' => 'string'],
                'start_date' => ['type' => 'string', 'format' => 'date'],
                'end_date' => ['type' => 'string', 'format' => 'date'],
                'estimated_budget' => ['type' => 'integer', 'minimum' => 0],
                'days' => $daysSchema,
            ],
            'required' => [
                'title',
                'summary',
                'destination',
                'start_date',
                'end_date',
                'estimated_budget',
                'days',
            ],
        ];
    }
}
