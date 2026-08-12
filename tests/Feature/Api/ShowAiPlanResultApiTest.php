<?php

namespace Tests\Feature\Api;

use App\Enums\AiPlanRequestStatus;
use App\Models\AiPlanRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ShowAiPlanResultApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_get_ai_plan_result(): void
    {
        $aiPlanRequest = $this->createAiPlanRequest(
            $this->createUser(),
            AiPlanRequestStatus::Completed,
        );

        $this->getJson($this->endpoint($aiPlanRequest->id))
            ->assertUnauthorized()
            ->assertExactJson([
                'message' => '未認証です',
            ]);
    }

    public function test_authenticated_user_can_get_own_completed_ai_plan_result(): void
    {
        $user = $this->createUser();
        $completedAt = Carbon::parse('2026-08-04 10:00:38');
        $aiPlanRequest = $this->createAiPlanRequest(
            $user,
            AiPlanRequestStatus::Completed,
            ['completed_at' => $completedAt],
        );
        $resultPayload = $this->validResultPayload();
        $aiPlanRequest->result()->create([
            'result_payload' => $resultPayload,
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson($this->endpoint($aiPlanRequest->id));

        $response
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'request_id' => $aiPlanRequest->id,
                    'status' => AiPlanRequestStatus::Completed->value,
                    'completed_at' => $completedAt->format('Y-m-d H:i:s'),
                    'result' => $resultPayload,
                ],
            ])
            ->assertJsonPath('data.result.days.0.items.0.transportation_type', null)
            ->assertJsonPath('data.result.days.0.items.0.transportation_cost', 0)
            ->assertJsonPath('data.result.days.0.items.0.visit_cost', 500)
            ->assertJsonPath('data.result.days.0.items.1.item_type', 'transport')
            ->assertJsonPath('data.result.days.0.items.1.transportation_type', 'bus')
            ->assertJsonPath('data.result.days.0.items.1.visit_cost', 0)
            ->assertJsonPath('data.result.days.0.items.1.transportation_cost', 230)
            ->assertJsonMissingPath('data.result.days.0.items.0.description')
            ->assertJsonMissingPath('data.result.days.0.items.0.transport_type')
            ->assertJsonMissingPath('data.user_id')
            ->assertJsonMissingPath('data.request_payload')
            ->assertJsonMissingPath('data.provider')
            ->assertJsonMissingPath('data.error_code')
            ->assertJsonMissingPath('data.error_message')
            ->assertJsonMissingPath('data.result.id');

        $this->assertNoStore($response->headers->get('Cache-Control'));
    }

    public function test_other_users_request_returns_not_found(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $aiPlanRequest = $this->createAiPlanRequest(
            $owner,
            AiPlanRequestStatus::Completed,
        );
        Sanctum::actingAs($otherUser);

        $this->assertApiError(
            $this->endpoint($aiPlanRequest->id),
            404,
            'AI_PLAN_REQUEST_NOT_FOUND',
            '対象のAI旅程生成リクエストが見つかりません。',
        );
    }

    public function test_missing_request_returns_not_found(): void
    {
        Sanctum::actingAs($this->createUser());

        $this->assertApiError(
            $this->endpoint(999999),
            404,
            'AI_PLAN_REQUEST_NOT_FOUND',
            '対象のAI旅程生成リクエストが見つかりません。',
        );
    }

    #[DataProvider('invalidIdProvider')]
    public function test_invalid_id_returns_not_found(string $id): void
    {
        Sanctum::actingAs($this->createUser());

        $this->assertApiError(
            '/api/ai/requests/'.$id.'/result',
            404,
            'AI_PLAN_REQUEST_NOT_FOUND',
            '対象のAI旅程生成リクエストが見つかりません。',
        );
    }

    /**
     * @return array<string, array{string}>
     */
    public static function invalidIdProvider(): array
    {
        return [
            'zero' => ['0'],
            'negative integer' => ['-1'],
            'non integer' => ['invalid'],
        ];
    }

    #[DataProvider('notReadyStatusProvider')]
    public function test_not_ready_request_returns_conflict(
        AiPlanRequestStatus $status,
    ): void {
        $user = $this->createUser();
        $aiPlanRequest = $this->createAiPlanRequest($user, $status);
        Sanctum::actingAs($user);
        DB::enableQueryLog();

        $this->assertApiError(
            $this->endpoint($aiPlanRequest->id),
            409,
            'AI_PLAN_RESULT_NOT_READY',
            '旅程を生成しています。',
        );

        $queriedResultTable = collect(DB::getQueryLog())->contains(
            fn (array $query): bool => str_contains($query['query'], 'ai_plan_results'),
        );

        $this->assertFalse($queriedResultTable);
    }

    /**
     * @return array<string, array{AiPlanRequestStatus}>
     */
    public static function notReadyStatusProvider(): array
    {
        return [
            'queued' => [AiPlanRequestStatus::Queued],
            'processing' => [AiPlanRequestStatus::Processing],
        ];
    }

    public function test_failed_request_returns_generation_failed_conflict(): void
    {
        $user = $this->createUser();
        $aiPlanRequest = $this->createAiPlanRequest($user, AiPlanRequestStatus::Failed);
        Sanctum::actingAs($user);

        $this->assertApiError(
            $this->endpoint($aiPlanRequest->id),
            409,
            'AI_PLAN_GENERATION_FAILED',
            '旅程の生成に失敗しました。',
        );
    }

    public function test_completed_request_without_result_returns_internal_server_error(): void
    {
        $user = $this->createUser();
        $aiPlanRequest = $this->createAiPlanRequest(
            $user,
            AiPlanRequestStatus::Completed,
            ['completed_at' => Carbon::parse('2026-08-04 10:00:38')],
        );
        Sanctum::actingAs($user);

        $this->assertApiError(
            $this->endpoint($aiPlanRequest->id),
            500,
            'AI_PLAN_RESULT_MISSING',
            '生成結果を取得できませんでした。',
        );
    }

    private function assertApiError(
        string $endpoint,
        int $status,
        string $code,
        string $message,
    ): void {
        $response = $this->getJson($endpoint)
            ->assertStatus($status)
            ->assertExactJson([
                'error' => [
                    'code' => $code,
                    'message' => $message,
                ],
            ]);

        $this->assertNoStore($response->headers->get('Cache-Control'));
    }

    private function assertNoStore(?string $cacheControl): void
    {
        $this->assertIsString($cacheControl);
        $this->assertStringContainsString('no-store', $cacheControl);
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
     * @param  array<string, mixed>  $attributes
     */
    private function createAiPlanRequest(
        User $user,
        AiPlanRequestStatus $status,
        array $attributes = [],
    ): AiPlanRequest {
        /** @var AiPlanRequest */
        return $user->aiPlanRequests()->create([
            'status' => $status,
            'request_payload' => [
                'prefecture' => '26',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-10',
            ],
            'provider' => 'gemini',
            ...$attributes,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validResultPayload(): array
    {
        return [
            'title' => '京都日帰り 寺社とグルメを巡る旅',
            'summary' => '京都の主要な寺社と食事を楽しむ旅行プランです。',
            'destination' => '京都',
            'start_date' => '2026-08-10',
            'end_date' => '2026-08-10',
            'estimated_budget' => 80000,
            'days' => [
                [
                    'day_number' => 1,
                    'date' => '2026-08-10',
                    'title' => '京都東部を巡る',
                    'items' => [
                        [
                            'sort_order' => 1,
                            'item_type' => 'spot',
                            'title' => '清水寺',
                            'start_time' => '09:00',
                            'stay_minutes' => 120,
                            'visit_cost' => 500,
                            'transportation_type' => null,
                            'transportation_cost' => 0,
                            'memo' => '午前中の訪問がおすすめです。',
                        ],
                        [
                            'sort_order' => 2,
                            'item_type' => 'transport',
                            'title' => '清水寺から祇園へ移動',
                            'start_time' => '11:00',
                            'stay_minutes' => 30,
                            'visit_cost' => 0,
                            'transportation_type' => 'bus',
                            'transportation_cost' => 230,
                            'memo' => null,
                        ],
                    ],
                ],
            ],
        ];
    }

    private function endpoint(int $id): string
    {
        return '/api/ai/requests/'.$id.'/result';
    }
}
