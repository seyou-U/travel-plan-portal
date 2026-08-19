<?php

namespace Tests\Feature\Services\Ai\Validators;

use App\Enums\GeminiErrorCode;
use App\Exceptions\GeminiOutputValidationException;
use App\Services\Ai\Validators\AiTravelPlanResultValidator;
use Closure;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AiTravelPlanResultValidatorTest extends TestCase
{
    public function test_valid_result_returns_only_validated_travel_plan(): void
    {
        $result = $this->validResult();
        $result['destination'] = '京都府京都市';
        $result['estimated_budget'] = 150000;

        $validated = $this->validator()->validate($result, $this->requestPayload());

        $this->assertSame($result, $validated);
        $this->assertSame('京都府京都市', $validated['destination']);
        $this->assertSame(150000, $validated['estimated_budget']);
    }

    public function test_valid_one_day_result_passes(): void
    {
        $requestPayload = [
            ...$this->requestPayload(),
            'end_date' => '2026-08-10',
        ];
        $result = [
            ...$this->validResult(),
            'end_date' => '2026-08-10',
            'days' => [$this->validDay(1, '2026-08-10', null)],
        ];

        $this->assertSame(
            $result,
            $this->validator()->validate($result, $requestPayload),
        );
    }

    public function test_zero_cost_boundaries_pass(): void
    {
        $result = $this->validResult();
        $result['estimated_budget'] = 0;
        $result['days'][0]['items'][0]['visit_cost'] = 0;

        $this->assertSame(
            $result,
            $this->validator()->validate($result, $this->requestPayload()),
        );
    }

    #[DataProvider('nonTransportItemTypeProvider')]
    public function test_valid_non_transport_item_types_pass(string $itemType): void
    {
        $result = $this->validResult();
        $result['days'][0]['items'][0]['item_type'] = $itemType;

        $this->assertSame(
            $result,
            $this->validator()->validate($result, $this->requestPayload()),
        );
    }

    /**
     * @return array<string, array{string}>
     */
    public static function nonTransportItemTypeProvider(): array
    {
        return [
            'spot' => ['spot'],
            'meal' => ['meal'],
            'hotel' => ['hotel'],
        ];
    }

    #[DataProvider('transportationTypeProvider')]
    public function test_valid_transportation_types_pass(string $transportationType): void
    {
        $result = $this->validResult();
        $result['days'][0]['items'][0] = [
            'sort_order' => 1,
            'item_type' => 'transport',
            'title' => '清水寺から祇園へ移動',
            'start_time' => '11:00',
            'stay_minutes' => 30,
            'visit_cost' => 0,
            'transportation_type' => $transportationType,
            'transportation_cost' => 230,
            'memo' => null,
        ];

        $validated = $this->validator()->validate($result, $this->requestPayload());

        $this->assertSame($result, $validated);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function transportationTypeProvider(): array
    {
        return [
            'walk' => ['walk'],
            'train' => ['train'],
            'bus' => ['bus'],
            'car' => ['car'],
            'taxi' => ['taxi'],
            'plane' => ['plane'],
            'bicycle' => ['bicycle'],
            'other' => ['other'],
        ];
    }

    /**
     * @param  Closure(array<string, mixed>): array<string, mixed>  $mutate
     */
    #[DataProvider('structuralErrorProvider')]
    public function test_structural_errors_are_rejected(Closure $mutate): void
    {
        $this->assertValidationFails($mutate($this->validResult()));
    }

    /**
     * @return array<string, array{Closure(array<string, mixed>): array<string, mixed>}>
     */
    public static function structuralErrorProvider(): array
    {
        return [
            'title missing' => [static function (array $result): array {
                unset($result['title']);

                return $result;
            }],
            'title too long' => [static fn (array $result): array => [
                ...$result,
                'title' => str_repeat('旅', 101),
            ]],
            'days is not array' => [static fn (array $result): array => [
                ...$result,
                'days' => 'invalid',
            ]],
            'items missing' => [static function (array $result): array {
                unset($result['days'][0]['items']);

                return $result;
            }],
            'items is empty' => [static function (array $result): array {
                $result['days'][0]['items'] = [];

                return $result;
            }],
            'negative estimated budget' => [static fn (array $result): array => [
                ...$result,
                'estimated_budget' => -1,
            ]],
            'estimated budget is numeric string' => [static fn (array $result): array => [
                ...$result,
                'estimated_budget' => '0',
            ]],
            'estimated budget is null' => [static fn (array $result): array => [
                ...$result,
                'estimated_budget' => null,
            ]],
            'invalid item type' => [static function (array $result): array {
                $result['days'][0]['items'][0]['item_type'] = 'invalid';

                return $result;
            }],
            'memo item type is not allowed' => [static function (array $result): array {
                $result['days'][0]['items'][0]['item_type'] = 'memo';

                return $result;
            }],
            'stay minutes is zero' => [static function (array $result): array {
                $result['days'][0]['items'][0]['stay_minutes'] = 0;

                return $result;
            }],
            'stay minutes is numeric string' => [static function (array $result): array {
                $result['days'][0]['items'][0]['stay_minutes'] = '1';

                return $result;
            }],
            'stay minutes is null' => [static function (array $result): array {
                $result['days'][0]['items'][0]['stay_minutes'] = null;

                return $result;
            }],
            'negative visit cost' => [static function (array $result): array {
                $result['days'][0]['items'][0]['visit_cost'] = -1;

                return $result;
            }],
            'visit cost is numeric string' => [static function (array $result): array {
                $result['days'][0]['items'][0]['visit_cost'] = '0';

                return $result;
            }],
            'visit cost is null' => [static function (array $result): array {
                $result['days'][0]['items'][0]['visit_cost'] = null;

                return $result;
            }],
            'negative transportation cost' => [static function (array $result): array {
                $result['days'][0]['items'][0]['transportation_cost'] = -1;

                return $result;
            }],
            'transportation cost is numeric string' => [static function (array $result): array {
                $result['days'][0]['items'][0]['transportation_cost'] = '0';

                return $result;
            }],
            'transportation cost is null' => [static function (array $result): array {
                $result['days'][0]['items'][0]['transportation_cost'] = null;

                return $result;
            }],
            'invalid transportation type' => [static function (array $result): array {
                $result['days'][0]['items'][0]['transportation_type'] = 'ship';

                return $result;
            }],
            'memo is not nullable string' => [static function (array $result): array {
                $result['days'][0]['items'][0]['memo'] = ['invalid'];

                return $result;
            }],
            'unknown top-level key' => [static fn (array $result): array => [
                ...$result,
                'raw_response' => ['unexpected'],
            ]],
            'unknown nested key' => [static function (array $result): array {
                $result['days'][0]['items'][0]['unexpected'] = true;

                return $result;
            }],
            'invalid time format' => [static function (array $result): array {
                $result['days'][0]['items'][0]['start_time'] = '9:00 AM';

                return $result;
            }],
        ];
    }

    /**
     * @param  Closure(array<string, mixed>): array<string, mixed>  $mutate
     */
    #[DataProvider('semanticErrorProvider')]
    public function test_semantic_errors_are_rejected(Closure $mutate): void
    {
        $this->assertValidationFails($mutate($this->validResult()));
    }

    /**
     * @return array<string, array{Closure(array<string, mixed>): array<string, mixed>}>
     */
    public static function semanticErrorProvider(): array
    {
        return [
            'start date mismatch' => [static fn (array $result): array => [
                ...$result,
                'start_date' => '2026-08-11',
            ]],
            'end date mismatch' => [static fn (array $result): array => [
                ...$result,
                'end_date' => '2026-08-13',
            ]],
            'days count mismatch' => [static function (array $result): array {
                array_pop($result['days']);

                return $result;
            }],
            'days count exceeds travel period' => [static function (array $result): array {
                $result['days'][] = [
                    ...$result['days'][1],
                    'day_number' => 3,
                    'date' => '2026-08-12',
                ];

                return $result;
            }],
            'day number is not sequential' => [static function (array $result): array {
                $result['days'][1]['day_number'] = 3;

                return $result;
            }],
            'day date mismatch' => [static function (array $result): array {
                $result['days'][1]['date'] = '2026-08-12';

                return $result;
            }],
            'sort order is not sequential' => [static function (array $result): array {
                $result['days'][0]['items'][0]['sort_order'] = 2;

                return $result;
            }],
            'transportation type missing from transport item' => [static function (array $result): array {
                $result['days'][0]['items'][0]['item_type'] = 'transport';
                $result['days'][0]['items'][0]['visit_cost'] = 0;
                $result['days'][0]['items'][0]['transportation_cost'] = 230;

                return $result;
            }],
            'transport item has visit cost' => [static function (array $result): array {
                $result['days'][0]['items'][0]['item_type'] = 'transport';
                $result['days'][0]['items'][0]['transportation_type'] = 'bus';
                $result['days'][0]['items'][0]['transportation_cost'] = 230;

                return $result;
            }],
            'non-transport item has transportation type' => [static function (array $result): array {
                $result['days'][0]['items'][0]['transportation_type'] = 'bus';

                return $result;
            }],
            'non-transport item has transportation cost' => [static function (array $result): array {
                $result['days'][0]['items'][0]['transportation_cost'] = 230;

                return $result;
            }],
        ];
    }

    /**
     * @param  array<string, mixed>  $result
     */
    private function assertValidationFails(array $result): void
    {
        $exception = null;

        try {
            $this->validator()->validate($result, $this->requestPayload());
        } catch (GeminiOutputValidationException $caught) {
            $exception = $caught;
        }

        $this->assertInstanceOf(GeminiOutputValidationException::class, $exception);
        $this->assertSame(GeminiErrorCode::OutputValidationFailed, $exception->errorCode);
        $this->assertFalse($exception->retryable);
        $this->assertNotEmpty($exception->errors);
    }

    private function validator(): AiTravelPlanResultValidator
    {
        return app(AiTravelPlanResultValidator::class);
    }

    /**
     * @return array<string, mixed>
     */
    private function requestPayload(): array
    {
        return [
            'prefecture' => '26',
            'start_date' => '2026-08-10',
            'end_date' => '2026-08-11',
            'budget' => 100000,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validResult(): array
    {
        return [
            'title' => '京都1泊2日の旅',
            'summary' => '京都の寺社と食事を楽しむ旅行プランです。',
            'destination' => '京都',
            'start_date' => '2026-08-10',
            'end_date' => '2026-08-11',
            'estimated_budget' => 100000,
            'days' => [
                $this->validDay(1, '2026-08-10', '09:00'),
                $this->validDay(2, '2026-08-11', null),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validDay(
        int $dayNumber,
        string $date,
        ?string $startTime,
    ): array {
        return [
            'day_number' => $dayNumber,
            'date' => $date,
            'title' => '京都観光',
            'items' => [[
                'sort_order' => 1,
                'item_type' => 'spot',
                'title' => '清水寺',
                'start_time' => $startTime,
                'stay_minutes' => 120,
                'visit_cost' => 500,
                'transportation_type' => null,
                'transportation_cost' => 0,
                'memo' => '午前中の訪問がおすすめです。',
            ]],
        ];
    }
}
