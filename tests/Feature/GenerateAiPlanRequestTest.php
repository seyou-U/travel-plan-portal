<?php

namespace Tests\Feature;

use App\Enums\PrefectureCode;
use App\Http\Requests\GenerateAiPlanRequest;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class GenerateAiPlanRequestTest extends TestCase
{
    public function test_valid_input_passes_and_excludes_server_managed_fields(): void
    {
        $input = $this->validInput() + [
            'user_id' => 999,
            'status' => 'completed',
            'provider' => 'other-provider',
            'started_at' => '2026-08-01 10:00:00',
            'completed_at' => '2026-08-01 10:01:00',
            'failed_at' => '2026-08-01 10:02:00',
            'error_code' => 'CLIENT_ERROR',
            'error_message' => 'クライアント指定エラー',
            'destination' => '京都',
            'transportation' => 'train',
        ];

        $validator = $this->validator($input);

        $this->assertFalse($validator->fails());
        $validated = $validator->validated();

        $this->assertEquals($this->validInput(), $validated);
        $this->assertArrayNotHasKey('user_id', $validated);
        $this->assertArrayNotHasKey('status', $validated);
        $this->assertArrayNotHasKey('provider', $validated);
        $this->assertArrayNotHasKey('started_at', $validated);
        $this->assertArrayNotHasKey('completed_at', $validated);
        $this->assertArrayNotHasKey('failed_at', $validated);
        $this->assertArrayNotHasKey('error_code', $validated);
        $this->assertArrayNotHasKey('error_message', $validated);
        $this->assertArrayNotHasKey('destination', $validated);
        $this->assertArrayNotHasKey('transportation', $validated);
    }

    public function test_missing_required_fields_fails(): void
    {
        $validator = $this->validator([]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has([
            'prefecture',
            'start_date',
            'end_date',
            'departure_location',
            'number_of_people',
            'budget',
            'transport_priority',
        ]));
        $this->assertSame('都道府県は必須です。', $validator->errors()->first('prefecture'));
        $this->assertSame('1人当たり予算は必須です。', $validator->errors()->first('budget'));
        $this->assertSame('移動方針は必須です。', $validator->errors()->first('transport_priority'));
    }

    public function test_prefecture_outside_enum_values_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'prefecture' => '京都府',
        ]);

        $this->assertTrue($validator->fails());
        $this->assertSame(
            '都道府県は選択肢から指定してください。',
            $validator->errors()->first('prefecture'),
        );
    }

    public function test_past_start_date_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'start_date' => now()->subDay()->format('Y-m-d'),
        ]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('start_date'));
    }

    public function test_end_date_before_start_date_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'start_date' => now()->addDays(2)->format('Y-m-d'),
            'end_date' => now()->addDay()->format('Y-m-d'),
        ]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('end_date'));
        $this->assertSame(
            '帰着日には出発日以降の日付を指定してください。',
            $validator->errors()->first('end_date'),
        );
    }

    public function test_zero_number_of_people_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'number_of_people' => 0,
        ]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('number_of_people'));
    }

    public function test_non_string_transport_priority_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'transport_priority' => ['おまかせ'],
        ]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('transport_priority'));
    }

    public function test_transport_priority_outside_allowed_values_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'transport_priority' => 'auto',
        ]);

        $this->assertTrue($validator->fails());
        $this->assertSame(
            '移動方針はおまかせ、時間優先、費用優先のいずれかを指定してください。',
            $validator->errors()->first('transport_priority'),
        );
    }

    #[DataProvider('transportPriorityProvider')]
    public function test_allowed_transport_priority_passes(string $transportPriority): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'transport_priority' => $transportPriority,
        ]);

        $this->assertFalse($validator->fails());
        $this->assertSame($transportPriority, $validator->validated()['transport_priority']);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function transportPriorityProvider(): array
    {
        return [
            'おまかせ' => ['おまかせ'],
            '時間優先' => ['時間優先'],
            '費用優先' => ['費用優先'],
        ];
    }

    public function test_transport_priority_is_required(): void
    {
        $input = $this->validInput();
        unset($input['transport_priority']);

        $validator = $this->validator($input);

        $this->assertTrue($validator->fails());
        $this->assertSame(
            '移動方針は必須です。',
            $validator->errors()->first('transport_priority'),
        );
    }

    public function test_travel_period_of_31_days_passes(): void
    {
        $startDate = now()->addDay();
        $validator = $this->validator([
            ...$this->validInput(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $startDate->copy()->addDays(30)->format('Y-m-d'),
        ]);

        $this->assertFalse($validator->fails());
    }

    public function test_travel_period_over_31_days_fails(): void
    {
        $startDate = now()->addDay();
        $validator = $this->validator([
            ...$this->validInput(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $startDate->copy()->addDays(31)->format('Y-m-d'),
        ]);

        $this->assertTrue($validator->fails());
        $this->assertSame(
            '旅行期間は31日以内で指定してください。',
            $validator->errors()->first('end_date'),
        );
    }

    public function test_non_array_preferences_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'preferences' => '寺社を巡りたい',
        ]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('preferences'));
    }

    public function test_null_preference_item_passes(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'preferences' => [null],
        ]);

        $this->assertFalse($validator->fails());
        $this->assertSame([null], $validator->validated()['preferences']);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function validator(array $input): \Illuminate\Contracts\Validation\Validator
    {
        $request = new GenerateAiPlanRequest;
        $request->merge($input);

        $validator = Validator::make(
            $input,
            $request->rules(),
            $request->messages(),
            $request->attributes(),
        );
        $validator->after($request->after());

        return $validator;
    }

    /**
     * @return array<string, mixed>
     */
    private function validInput(): array
    {
        return [
            'prefecture' => PrefectureCode::KYOTO->value,
            'start_date' => now()->addDay()->format('Y-m-d'),
            'end_date' => now()->addDays(3)->format('Y-m-d'),
            'departure_location' => '東京',
            'number_of_people' => 2,
            'budget' => 100000,
            'transport_priority' => 'おまかせ',
            'preferences' => [
                '寺社を巡りたい',
                '京都らしい料理を食べたい',
            ],
            'notes' => '移動時間を短めにしたい',
        ];
    }
}
