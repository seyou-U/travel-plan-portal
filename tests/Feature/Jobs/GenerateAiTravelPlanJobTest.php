<?php

namespace Tests\Feature\Jobs;

use App\Contracts\Ai\TravelPlanGenerator;
use App\Enums\AiPlanRequestStatus;
use App\Enums\GeminiErrorCode;
use App\Exceptions\GeminiGenerationException;
use App\Jobs\GenerateAiTravelPlanJob;
use App\Models\AiPlanRequest;
use App\Models\AiPlanResult;
use App\Models\User;
use App\Services\Ai\FakeTravelPlanGenerator;
use App\Services\Ai\GeminiTravelPlanGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class GenerateAiTravelPlanJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_generator_contract_resolves_to_gemini_implementation(): void
    {
        $this->assertInstanceOf(
            GeminiTravelPlanGenerator::class,
            app(TravelPlanGenerator::class),
        );
    }

    public function test_job_generates_result_and_completes_request_without_duplicates(): void
    {
        $aiPlanRequest = $this->createAiPlanRequest();
        $generator = new class($aiPlanRequest->id) implements TravelPlanGenerator
        {
            public ?AiPlanRequestStatus $statusDuringGeneration = null;

            public int $calls = 0;

            public function __construct(private int $aiPlanRequestId) {}

            public function generate(array $requestPayload): array
            {
                $this->calls++;
                $aiPlanRequest = AiPlanRequest::query()->findOrFail($this->aiPlanRequestId);
                $this->statusDuringGeneration = AiPlanRequestStatus::from(
                    (string) $aiPlanRequest->getRawOriginal('status'),
                );

                return (new FakeTravelPlanGenerator)->generate($requestPayload);
            }
        };
        $job = new GenerateAiTravelPlanJob($aiPlanRequest->id);

        $job->handle($generator);

        $aiPlanRequest->refresh();
        $result = AiPlanResult::query()->sole();
        $firstResultId = $result->id;

        $this->assertSame(AiPlanRequestStatus::Processing, $generator->statusDuringGeneration);
        $this->assertSame(AiPlanRequestStatus::Completed, $aiPlanRequest->status);
        $this->assertNotNull($aiPlanRequest->started_at);
        $this->assertNotNull($aiPlanRequest->completed_at);
        $this->assertNull($aiPlanRequest->failed_at);
        $this->assertNull($aiPlanRequest->error_code);
        $this->assertNull($aiPlanRequest->error_message);
        $this->assertIsArray($result->result_payload);
        $this->assertSame('京都', $result->result_payload['destination']);
        $this->assertSame(100000, $result->result_payload['estimated_budget']);
        $this->assertCount(3, $result->result_payload['days']);

        $job->handle($generator);

        $this->assertSame(1, $generator->calls);
        $this->assertDatabaseCount('ai_plan_results', 1);
        $this->assertSame($firstResultId, AiPlanResult::query()->sole()->id);
    }

    public function test_failed_callback_marks_request_as_failed_after_generator_exception(): void
    {
        $aiPlanRequest = $this->createAiPlanRequest();
        $generator = new class implements TravelPlanGenerator
        {
            public function generate(array $requestPayload): array
            {
                throw new RuntimeException('Fake generator failed.');
            }
        };
        $job = new GenerateAiTravelPlanJob($aiPlanRequest->id);
        $exception = null;

        try {
            $job->handle($generator);
        } catch (RuntimeException $caught) {
            $exception = $caught;
        }

        $this->assertInstanceOf(RuntimeException::class, $exception);
        $this->assertSame(
            AiPlanRequestStatus::Processing,
            $aiPlanRequest->refresh()->status,
        );

        $job->failed($exception);
        $aiPlanRequest->refresh();

        $this->assertSame(AiPlanRequestStatus::Failed, $aiPlanRequest->status);
        $this->assertNotNull($aiPlanRequest->failed_at);
        $this->assertSame('AI_PLAN_GENERATION_FAILED', $aiPlanRequest->error_code);
        $this->assertSame('Fake generator failed.', $aiPlanRequest->error_message);
        $this->assertDatabaseCount('ai_plan_results', 0);
    }

    public function test_non_retryable_gemini_error_fails_job_immediately(): void
    {
        $aiPlanRequest = $this->createAiPlanRequest();
        $exception = new GeminiGenerationException(
            GeminiErrorCode::Unauthorized,
            false,
            'Gemini APIの認証に失敗しました。',
        );
        $generator = new class($exception) implements TravelPlanGenerator
        {
            public function __construct(private GeminiGenerationException $exception) {}

            public function generate(array $requestPayload): array
            {
                throw $this->exception;
            }
        };
        $job = (new GenerateAiTravelPlanJob($aiPlanRequest->id))
            ->withFakeQueueInteractions();

        $job->handle($generator);

        $job
            ->assertFailedWith($exception)
            ->assertNotReleased();

        $job->failed($exception);
        $aiPlanRequest->refresh();

        $this->assertSame(AiPlanRequestStatus::Failed, $aiPlanRequest->status);
        $this->assertSame(GeminiErrorCode::Unauthorized->value, $aiPlanRequest->error_code);
        $this->assertDatabaseCount('ai_plan_results', 0);
    }

    public function test_retryable_gemini_error_is_rethrown_for_queue_retry(): void
    {
        $aiPlanRequest = $this->createAiPlanRequest();
        $exception = new GeminiGenerationException(
            GeminiErrorCode::RateLimited,
            true,
            'Gemini APIの利用上限に達しました。',
        );
        $generator = new class($exception) implements TravelPlanGenerator
        {
            public function __construct(private GeminiGenerationException $exception) {}

            public function generate(array $requestPayload): array
            {
                throw $this->exception;
            }
        };
        $job = (new GenerateAiTravelPlanJob($aiPlanRequest->id))
            ->withFakeQueueInteractions();
        $caught = null;

        try {
            $job->handle($generator);
        } catch (GeminiGenerationException $thrown) {
            $caught = $thrown;
        }

        $this->assertSame($exception, $caught);
        $job
            ->assertNotFailed()
            ->assertNotReleased();
        $this->assertSame(
            AiPlanRequestStatus::Processing,
            $aiPlanRequest->refresh()->status,
        );
        $this->assertDatabaseCount('ai_plan_results', 0);
    }

    private function createAiPlanRequest(): AiPlanRequest
    {
        $user = User::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'テストユーザー',
            'email' => Str::uuid().'@example.com',
            'password' => 'password',
        ]);

        /** @var AiPlanRequest */
        return $user->aiPlanRequests()->create([
            'status' => AiPlanRequestStatus::Queued,
            'request_payload' => [
                'destination' => '京都',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-12',
                'departure_location' => '東京',
                'number_of_people' => 2,
                'budget' => 100000,
                'transportation' => 'train',
                'preferences' => [
                    '寺社を巡りたい',
                    '京都らしい料理を食べたい',
                ],
                'notes' => '移動時間を短めにしたい',
            ],
            'provider' => 'gemini',
        ]);
    }
}
