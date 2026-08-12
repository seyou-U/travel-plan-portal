<?php

namespace Tests\Feature\Api;

use App\Enums\AiPlanRequestStatus;
use App\Enums\GeminiErrorCode;
use App\Models\AiPlanRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ShowAiPlanRequestStatusApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_get_ai_plan_request_status(): void
    {
        $aiPlanRequest = $this->createAiPlanRequest($this->createUser());

        $this->getJson($this->endpoint($aiPlanRequest->id))
            ->assertUnauthorized()
            ->assertExactJson([
                'message' => '未認証です',
            ]);
    }

    public function test_authenticated_user_can_get_own_queued_request(): void
    {
        $user = $this->createUser();
        $aiPlanRequest = $this->createAiPlanRequest($user);
        Sanctum::actingAs($user);

        $response = $this->getJson($this->endpoint($aiPlanRequest->id));

        $response
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'request_id' => $aiPlanRequest->id,
                    'status' => AiPlanRequestStatus::Queued->value,
                    'created_at' => $aiPlanRequest->created_at->format('Y-m-d H:i:s'),
                    'started_at' => null,
                    'completed_at' => null,
                    'failed_at' => null,
                    'error' => null,
                ],
            ]);

        $this->assertNoStore($response->headers->get('Cache-Control'));
    }

    public function test_processing_request_returns_started_at(): void
    {
        $user = $this->createUser();
        $startedAt = Carbon::parse('2026-08-04 10:00:02');
        $aiPlanRequest = $this->createAiPlanRequest($user, AiPlanRequestStatus::Processing, [
            'started_at' => $startedAt,
        ]);
        Sanctum::actingAs($user);

        $this->getJson($this->endpoint($aiPlanRequest->id))
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'request_id' => $aiPlanRequest->id,
                    'status' => AiPlanRequestStatus::Processing->value,
                    'created_at' => $aiPlanRequest->created_at->format('Y-m-d H:i:s'),
                    'started_at' => $startedAt->format('Y-m-d H:i:s'),
                    'completed_at' => null,
                    'failed_at' => null,
                    'error' => null,
                ],
            ]);
    }

    public function test_completed_request_returns_completed_at(): void
    {
        $user = $this->createUser();
        $startedAt = Carbon::parse('2026-08-04 10:00:02');
        $completedAt = Carbon::parse('2026-08-04 10:00:38');
        $aiPlanRequest = $this->createAiPlanRequest($user, AiPlanRequestStatus::Completed, [
            'started_at' => $startedAt,
            'completed_at' => $completedAt,
        ]);
        Sanctum::actingAs($user);

        $this->getJson($this->endpoint($aiPlanRequest->id))
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'request_id' => $aiPlanRequest->id,
                    'status' => AiPlanRequestStatus::Completed->value,
                    'created_at' => $aiPlanRequest->created_at->format('Y-m-d H:i:s'),
                    'started_at' => $startedAt->format('Y-m-d H:i:s'),
                    'completed_at' => $completedAt->format('Y-m-d H:i:s'),
                    'failed_at' => null,
                    'error' => null,
                ],
            ]);
    }

    public function test_failed_request_returns_safe_error_information(): void
    {
        $user = $this->createUser();
        $startedAt = Carbon::parse('2026-08-04 10:00:02');
        $failedAt = Carbon::parse('2026-08-04 10:00:15');
        $aiPlanRequest = $this->createAiPlanRequest($user, AiPlanRequestStatus::Failed, [
            'started_at' => $startedAt,
            'failed_at' => $failedAt,
            'error_code' => GeminiErrorCode::RateLimited->value,
            'error_message' => 'Geminiの生レスポンスや内部例外を含むメッセージ',
        ]);
        Sanctum::actingAs($user);

        $this->getJson($this->endpoint($aiPlanRequest->id))
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'request_id' => $aiPlanRequest->id,
                    'status' => AiPlanRequestStatus::Failed->value,
                    'created_at' => $aiPlanRequest->created_at->format('Y-m-d H:i:s'),
                    'started_at' => $startedAt->format('Y-m-d H:i:s'),
                    'completed_at' => null,
                    'failed_at' => $failedAt->format('Y-m-d H:i:s'),
                    'error' => [
                        'code' => GeminiErrorCode::RateLimited->value,
                        'message' => '旅程の生成に失敗しました。時間を置いて再度お試しください。',
                    ],
                ],
            ])
            ->assertDontSee('Geminiの生レスポンスや内部例外を含むメッセージ');
    }

    public function test_other_users_request_returns_not_found(): void
    {
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $aiPlanRequest = $this->createAiPlanRequest($owner);
        Sanctum::actingAs($otherUser);

        $this->assertNotFoundResponse($this->endpoint($aiPlanRequest->id));
    }

    public function test_missing_request_returns_not_found(): void
    {
        Sanctum::actingAs($this->createUser());

        $this->assertNotFoundResponse($this->endpoint(999999));
    }

    #[DataProvider('invalidIdProvider')]
    public function test_invalid_id_returns_not_found(string $id): void
    {
        Sanctum::actingAs($this->createUser());

        $this->assertNotFoundResponse('/api/ai/requests/'.$id);
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

    private function assertNotFoundResponse(string $endpoint): void
    {
        $response = $this->getJson($endpoint)
            ->assertNotFound()
            ->assertExactJson([
                'message' => '対象のAI旅程生成リクエストが見つかりません',
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
        AiPlanRequestStatus $status = AiPlanRequestStatus::Queued,
        array $attributes = [],
    ): AiPlanRequest {
        /** @var AiPlanRequest */
        return $user->aiPlanRequests()->create([
            'status' => $status,
            'request_payload' => [
                'prefecture' => '26',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-12',
            ],
            'provider' => 'gemini',
            ...$attributes,
        ]);
    }

    private function endpoint(int $id): string
    {
        return '/api/ai/requests/'.$id;
    }
}
