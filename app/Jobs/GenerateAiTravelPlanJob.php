<?php

namespace App\Jobs;

use App\Contracts\Ai\TravelPlanGenerator;
use App\Enums\AiPlanRequestStatus;
use App\Exceptions\GeminiGenerationException;
use App\Models\AiPlanRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;
use UnexpectedValueException;

class GenerateAiTravelPlanJob implements ShouldQueue
{
    use Queueable;

    /**
     * 最大試行回数。
     */
    public int $tries = 3;

    /**
     * 最大実行時間（秒）。
     */
    public int $timeout = 60;

    public function __construct(public int $aiPlanRequestId) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [10, 30];
    }

    public function handle(TravelPlanGenerator $generator): void
    {
        $aiPlanRequest = AiPlanRequest::query()->findOrFail($this->aiPlanRequestId);

        if ($aiPlanRequest->getRawOriginal('status') === AiPlanRequestStatus::Completed->value) {
            return;
        }

        $aiPlanRequest->update([
            'status' => AiPlanRequestStatus::Processing,
            'started_at' => $aiPlanRequest->getAttribute('started_at') ?? now(),
            'failed_at' => null,
            'error_code' => null,
            'error_message' => null,
        ]);

        $requestPayload = $aiPlanRequest->getAttribute('request_payload');

        if (! is_array($requestPayload)) {
            throw new UnexpectedValueException('AI旅程生成条件の形式が不正です。');
        }

        try {
            $resultPayload = $generator->generate($requestPayload);
        } catch (GeminiGenerationException $exception) {
            if (! $exception->retryable) {
                $this->fail($exception);

                return;
            }
            throw $exception;
        }

        DB::transaction(function () use ($resultPayload): void {
            $aiPlanRequest = AiPlanRequest::query()
                ->lockForUpdate()
                ->findOrFail($this->aiPlanRequestId);

            if ($aiPlanRequest->getRawOriginal('status') === AiPlanRequestStatus::Completed->value) {
                return;
            }

            $aiPlanRequest->result()->updateOrCreate([], [
                'result_payload' => $resultPayload,
            ]);

            $aiPlanRequest->update([
                'status' => AiPlanRequestStatus::Completed,
                'completed_at' => now(),
            ]);
        });
    }

    public function failed(?Throwable $exception): void
    {
        $message = $exception?->getMessage();

        if (! is_string($message) || trim($message) === '') {
            $message = 'AI旅程生成処理に失敗しました。';
        }

        $errorCode = $exception instanceof GeminiGenerationException
            ? $exception->errorCode->value
            : 'AI_PLAN_GENERATION_FAILED';

        AiPlanRequest::query()
            ->whereKey($this->aiPlanRequestId)
            ->where('status', '!=', AiPlanRequestStatus::Completed->value)
            ->update([
                'status' => AiPlanRequestStatus::Failed,
                'failed_at' => now(),
                'error_code' => $errorCode,
                'error_message' => Str::limit($message, 1000, ''),
            ]);
    }
}
