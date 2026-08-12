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
            'start_time',
            'stay_minutes',
            'visit_cost',
            'transportation_type',
            'transportation_cost',
            'memo',
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
            $item['properties']['transportation_type']['type'],
        );
        $this->assertSame([
            'walk',
            'train',
            'bus',
            'car',
            'taxi',
            'plane',
            'bicycle',
            'other',
            null,
        ], $item['properties']['transportation_type']['enum']);
        $this->assertSame(
            ['string', 'null'],
            $item['properties']['memo']['type'],
        );
        $this->assertSame(1, $item['properties']['stay_minutes']['minimum']);
        $this->assertSame(0, $item['properties']['visit_cost']['minimum']);
        $this->assertSame(0, $item['properties']['transportation_cost']['minimum']);
        $this->assertArrayNotHasKey('description', $item['properties']);
        $this->assertArrayNotHasKey('end_time', $item['properties']);
        $this->assertArrayNotHasKey('estimated_cost', $item['properties']);
    }

    public function test_schema_can_restrict_days_to_requested_period(): void
    {
        $days = (new AiTravelPlanResultSchema)->toArray(3)['properties']['days'];

        $this->assertSame(3, $days['minItems']);
        $this->assertSame(3, $days['maxItems']);
    }
}
