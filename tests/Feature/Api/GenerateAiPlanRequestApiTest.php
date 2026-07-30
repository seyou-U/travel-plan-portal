<?php

namespace Tests\Feature\Api;

use App\Enums\AiPlanRequestStatus;
use App\Models\AiPlanRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GenerateAiPlanRequestApiTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/ai/plans/generate';

    public function test_authenticated_user_can_create_queued_ai_plan_request(): void
    {
        $user = $this->createUser();
        $payload = $this->validPayload();
        Sanctum::actingAs($user);

        $response = $this->postJson(self::ENDPOINT, [
            ...$payload,
            'user_id' => 999,
            'status' => 'completed',
            'provider' => 'client-provider',
            'started_at' => '2026-08-01 10:00:00',
            'completed_at' => '2026-08-01 10:01:00',
            'failed_at' => '2026-08-01 10:02:00',
            'error_code' => 'CLIENT_ERROR',
            'error_message' => 'クライアント指定エラー',
        ]);

        $aiPlanRequest = AiPlanRequest::query()->sole();

        $response
            ->assertAccepted()
            ->assertJsonPath('data.request_id', $aiPlanRequest->id)
            ->assertJsonPath('data.status', AiPlanRequestStatus::Queued->value)
            ->assertJsonPath('data.created_at', $aiPlanRequest->created_at->toIso8601String())
            ->assertJsonStructure([
                'data' => [
                    'request_id',
                    'status',
                    'created_at',
                ],
            ]);

        $this->assertSame($user->id, $aiPlanRequest->user_id);
        $this->assertSame(AiPlanRequestStatus::Queued, $aiPlanRequest->status);
        $this->assertEquals($payload, $aiPlanRequest->request_payload);
        $this->assertSame('gemini', $aiPlanRequest->provider);
        $this->assertNull($aiPlanRequest->started_at);
        $this->assertNull($aiPlanRequest->completed_at);
        $this->assertNull($aiPlanRequest->failed_at);
        $this->assertNull($aiPlanRequest->error_code);
        $this->assertNull($aiPlanRequest->error_message);
        $this->assertDatabaseCount('ai_plan_requests', 1);
        $this->assertDatabaseCount('ai_plan_results', 0);
    }

    public function test_unauthenticated_user_cannot_create_ai_plan_request(): void
    {
        $this->postJson(self::ENDPOINT, $this->validPayload())
            ->assertUnauthorized()
            ->assertJsonPath('message', '未認証です');

        $this->assertDatabaseCount('ai_plan_requests', 0);
    }

    public function test_missing_required_fields_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([], [
            'destination',
            'start_date',
            'end_date',
            'departure_location',
            'number_of_people',
        ]);
    }

    public function test_past_start_date_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([
            ...$this->validPayload(),
            'start_date' => now()->subDay()->format('Y-m-d'),
        ], ['start_date']);
    }

    public function test_end_date_before_start_date_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([
            ...$this->validPayload(),
            'start_date' => now()->addDays(2)->format('Y-m-d'),
            'end_date' => now()->addDay()->format('Y-m-d'),
        ], ['end_date']);
    }

    public function test_number_of_people_outside_allowed_range_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([
            ...$this->validPayload(),
            'number_of_people' => 0,
        ], ['number_of_people']);
    }

    public function test_budget_outside_allowed_range_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([
            ...$this->validPayload(),
            'budget' => 10000001,
        ], ['budget']);
    }

    public function test_invalid_transportation_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([
            ...$this->validPayload(),
            'transportation' => 'ship',
        ], ['transportation']);
    }

    public function test_non_array_preferences_returns_unprocessable_entity(): void
    {
        $this->assertInvalid([
            ...$this->validPayload(),
            'preferences' => '寺社を巡りたい',
        ], ['preferences']);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  list<string>  $errorFields
     */
    private function assertInvalid(array $payload, array $errorFields): void
    {
        Sanctum::actingAs($this->createUser());

        $this->postJson(self::ENDPOINT, $payload)
            ->assertUnprocessable()
            ->assertJsonPath('message', '入力内容に誤りがあります。')
            ->assertJsonValidationErrors($errorFields);

        $this->assertDatabaseCount('ai_plan_requests', 0);
        $this->assertDatabaseCount('ai_plan_results', 0);
    }

    private function createUser(): User
    {
        return User::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'テストユーザー',
            'email' => Str::uuid().'@example.com',
            'password' => 'password',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
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
