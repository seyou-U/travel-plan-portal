<?php

namespace App\Http\Controllers\Api;

use App\Enums\AiPlanRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateAiPlanRequest;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;

class GenerateAiPlanController extends Controller
{
    /**
     * AI旅程生成依頼を受け付ける。
     *
     * @throws AuthenticationException
     */
    public function __invoke(GenerateAiPlanRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            throw new AuthenticationException;
        }

        $aiPlanRequest = $user->aiPlanRequests()->create([
            'status' => AiPlanRequestStatus::Queued,
            'request_payload' => $request->validated(),
            'provider' => 'gemini',
        ]);

        return response()->json([
            'data' => [
                'request_id' => $aiPlanRequest->id,
                'status' => AiPlanRequestStatus::Queued->value,
                'created_at' => $aiPlanRequest->created_at->toIso8601String(),
            ],
        ], 202);
    }
}
