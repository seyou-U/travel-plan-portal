<?php

namespace App\Http\Controllers\Api;

use App\Enums\AiPlanRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\AiPlanRequest;
use App\Models\AiPlanResult;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use UnexpectedValueException;

class ShowAiPlanResultController extends Controller
{
    /**
     * 完了したAI旅程生成リクエストの生成結果を返す。
     *
     * @param  Request  $request  認証ユーザー情報を含むHTTPリクエスト
     * @param  string  $id  取得対象のAI旅程生成リクエストID
     * @return JsonResponse AI旅程生成結果または状態に応じたエラーレスポンス
     *
     * @throws AuthenticationException 認証ユーザーを取得できない場合
     * @throws UnexpectedValueException DBから取得した状態、日時または結果の形式が不正な場合
     */
    public function __invoke(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new AuthenticationException;
        }

        $requestId = filter_var($id, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($requestId === false) {
            return $this->errorResponse(
                404,
                'AI_PLAN_REQUEST_NOT_FOUND',
                '対象のAI旅程生成リクエストが見つかりません。',
            );
        }

        $aiPlanRequest = $user->aiPlanRequests()
            ->select([
                'id',
                'status',
                'completed_at',
            ])
            ->whereKey($requestId)
            ->first();

        if (! $aiPlanRequest instanceof AiPlanRequest) {
            return $this->errorResponse(
                404,
                'AI_PLAN_REQUEST_NOT_FOUND',
                '対象のAI旅程生成リクエストが見つかりません。',
            );
        }

        $status = $aiPlanRequest->getAttribute('status');

        if (! $status instanceof AiPlanRequestStatus) {
            throw new UnexpectedValueException('AI旅程生成リクエストの状態が不正です。');
        }

        if (in_array($status, [
            AiPlanRequestStatus::Queued,
            AiPlanRequestStatus::Processing,
        ], true)) {
            return $this->errorResponse(
                409,
                'AI_PLAN_RESULT_NOT_READY',
                '旅程を生成しています。',
            );
        }

        if ($status === AiPlanRequestStatus::Failed) {
            return $this->errorResponse(
                409,
                'AI_PLAN_GENERATION_FAILED',
                '旅程の生成に失敗しました。',
            );
        }

        $aiPlanResult = $aiPlanRequest->result()
            ->select([
                'ai_plan_request_id',
                'result_payload',
            ])
            ->first();

        if (! $aiPlanResult instanceof AiPlanResult) {
            return $this->errorResponse(
                500,
                'AI_PLAN_RESULT_MISSING',
                '生成結果を取得できませんでした。',
            );
        }

        $resultPayload = $aiPlanResult->getAttribute('result_payload');

        if (! is_array($resultPayload)) {
            throw new UnexpectedValueException('AI旅程生成結果の形式が不正です。');
        }

        return response()->json([
            'data' => [
                'request_id' => $aiPlanRequest->id,
                'status' => AiPlanRequestStatus::Completed->value,
                'completed_at' => $this->completedAt($aiPlanRequest),
                'result' => $resultPayload,
            ],
        ])->header('Cache-Control', 'no-store');
    }

    /**
     * 本API固有のエラーレスポンスを返す。
     *
     * @param  int  $status  HTTPステータスコード
     * @param  string  $code  アプリケーションエラーコード
     * @param  string  $message  クライアント向けエラーメッセージ
     * @return JsonResponse キャッシュを無効化したJSONエラーレスポンス
     */
    private function errorResponse(int $status, string $code, string $message): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ], $status)->header('Cache-Control', 'no-store');
    }

    /**
     * AI旅程生成完了日時をY-m-d H:i:s形式へ変換する。
     *
     * @param  AiPlanRequest  $aiPlanRequest  完了日時を保持するAI旅程生成リクエスト
     * @return string Y-m-d H:i:s形式の完了日時
     *
     * @throws UnexpectedValueException 完了日時を日時型として取得できない場合
     */
    private function completedAt(AiPlanRequest $aiPlanRequest): string
    {
        $completedAt = $aiPlanRequest->getAttribute('completed_at');

        if (! $completedAt instanceof CarbonInterface) {
            throw new UnexpectedValueException('AI旅程生成リクエストの完了日時が不正です。');
        }

        return $completedAt->format('Y-m-d H:i:s');
    }
}
