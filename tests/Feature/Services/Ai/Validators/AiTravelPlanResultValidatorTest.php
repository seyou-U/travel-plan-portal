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
            'invalid item type' => [static function (array $result): array {
                $result['days'][0]['items'][0]['item_type'] = 'invalid';

                return $result;
            }],
            'negative estimated cost' => [static function (array $result): array {
                $result['days'][0]['items'][0]['estimated_cost'] = -1;

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
            'start time is after end time' => [static function (array $result): array {
                $result['days'][0]['items'][0]['start_time'] = '12:00';
                $result['days'][0]['items'][0]['end_time'] = '11:00';

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
                $this->validDay(1, '2026-08-10', '09:00', '11:00'),
                $this->validDay(2, '2026-08-11', null, null),
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
        ?string $endTime,
    ): array {
        return [
            'day_number' => $dayNumber,
            'date' => $date,
            'title' => '京都観光',
            'items' => [[
                'sort_order' => 1,
                'item_type' => 'spot',
                'title' => '清水寺',
                'description' => '清水寺を観光します。',
                'start_time' => $startTime,
                'end_time' => $endTime,
                'estimated_cost' => 500,
            ]],
        ];
    }
}
