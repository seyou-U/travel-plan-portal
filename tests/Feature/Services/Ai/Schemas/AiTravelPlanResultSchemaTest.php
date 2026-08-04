<?php

namespace Tests\Feature\Services\Ai\Schemas;

use App\Services\Ai\Schemas\AiTravelPlanResultSchema;
use Tests\TestCase;

class AiTravelPlanResultSchemaTest extends TestCase
{
    public function test_schema_defines_required_travel_plan_structure(): void
    {
        $schema = (new AiTravelPlanResultSchema)->toArray();
        $days = $schema['properties']['days'];
        $day = $days['items'];
        $items = $day['properties']['items'];
        $item = $items['items'];

        $this->assertSame('object', $schema['type']);
        $this->assertFalse($schema['additionalProperties']);
        $this->assertSame([
            'title',
            'summary',
            'destination',
            'start_date',
            'end_date',
            'estimated_budget',
            'days',
        ], $schema['required']);
        $this->assertSame(1, $days['minItems']);
        $this->assertArrayNotHasKey('maxItems', $days);
        $this->assertFalse($day['additionalProperties']);
        $this->assertSame([
            'day_number',
            'date',
            'title',
            'items',
        ], $day['required']);
        $this->assertSame(1, $items['minItems']);
        $this->assertFalse($item['additionalProperties']);
        $this->assertSame([
            'sort_order',
            'item_type',
            'title',
            'description',
            'start_time',
            'end_time',
            'estimated_cost',
        ], $item['required']);
        $this->assertSame(
            AiTravelPlanResultSchema::ITEM_TYPES,
            $item['properties']['item_type']['enum'],
        );
        $this->assertSame(
            ['string', 'null'],
            $item['properties']['start_time']['type'],
        );
        $this->assertSame(
            ['string', 'null'],
            $item['properties']['end_time']['type'],
        );
    }

    public function test_schema_can_restrict_days_to_requested_period(): void
    {
        $days = (new AiTravelPlanResultSchema)->toArray(3)['properties']['days'];

        $this->assertSame(3, $days['minItems']);
        $this->assertSame(3, $days['maxItems']);
    }
}
