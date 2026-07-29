<?php

namespace Tests\Feature;

use App\Http\Requests\GenerateAiPlanRequest;
use Illuminate\Support\Facades\Validator;
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
    }

    public function test_missing_required_fields_fails(): void
    {
        $validator = $this->validator([]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has([
            'destination',
            'start_date',
            'end_date',
            'departure_location',
            'number_of_people',
        ]));
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

    public function test_invalid_transportation_fails(): void
    {
        $validator = $this->validator([
            ...$this->validInput(),
            'transportation' => 'ship',
        ]);

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('transportation'));
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

    /**
     * @param  array<string, mixed>  $input
     */
    private function validator(array $input): \Illuminate\Contracts\Validation\Validator
    {
        $request = new GenerateAiPlanRequest;

        return Validator::make(
            $input,
            $request->rules(),
            $request->messages(),
            $request->attributes(),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validInput(): array
    {
        return [
            'destination' => '京都',
            'start_date' => now()->addDay()->format('Y-m-d'),
            'end_date' => now()->addDays(3)->format('Y-m-d'),
            'departure_location' => '東京',
            'number_of_people' => 2,
            'budget' => 100000,
            'transportation' => 'train',
            'preferences' => [
                '寺社を巡りたい',
                '京都らしい料理を食べたい',
            ],
            'notes' => '移動時間を短めにしたい',
        ];
    }
}
