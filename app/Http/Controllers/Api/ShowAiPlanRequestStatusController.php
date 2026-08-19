<?php

namespace App\Http\Controllers\Api;

use App\Enums\AiPlanRequestStatus;
use App\Enums\GeminiErrorCode;
use App\Http\Controllers\Controller;
use App\Models\AiPlanRequest;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use UnexpectedValueException;

class ShowAiPlanRequestStatusController extends Controller
{
    /**
     * AI旅程生成リクエストの現在状態を返す。
     *
     * @param  Request  $request  認証ユーザー情報を含むHTTPリクエスト
     * @param  string  $id  取得対象のAI旅程生成リクエストID
     * @return JsonResponse AI旅程生成リクエストの現在状態を含むJSONレスポンス
     *
     * @throws AuthenticationException 認証ユーザーを取得できない場合
     * @throws UnexpectedValueException DBから取得した状態または日時の形式が不正な場合
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
            return $this->notFoundResponse();
        }

        $aiPlanRequest = $user->aiPlanRequests()
            ->select([
                'id',
                'status',
                'created_at',
                'started_at',
                'completed_at',
                'failed_at',
                'error_code',
            ])
            ->whereKey($requestId)
            ->first();

        if (! $aiPlanRequest instanceof AiPlanRequest) {
            return $this->notFoundResponse();
        }

        $status = $aiPlanRequest->getAttribute('status');

        if (! $status instanceof AiPlanRequestStatus) {
            throw new UnexpectedValueException('AI旅程生成リクエストの状態が不正です。');
        }

        return response()->json([
            'data' => [
                'request_id' => $aiPlanRequest->id,
                'status' => $status->value,
                'created_at' => $this->requiredDateTime($aiPlanRequest, 'created_at'),
                'started_at' => $this->nullableDateTime($aiPlanRequest, 'started_at'),
                'completed_at' => $this->nullableDateTime($aiPlanRequest, 'completed_at'),
                'failed_at' => $this->nullableDateTime($aiPlanRequest, 'failed_at'),
                'error' => $this->error($aiPlanRequest, $status),
            ],
        ])->header('Cache-Control', 'no-store');
    }

    /**
     * 対象のAI旅程生成リクエストが見つからない場合のレスポンスを返す。
     *
     * @return JsonResponse キャッシュを無効化した404 JSONレスポンス
     */
    private function notFoundResponse(): JsonResponse
    {
        return response()->json([
            'message' => '対象のAI旅程生成リクエストが見つかりません',
        ], 404)->header('Cache-Control', 'no-store');
    }

    /**
     * AI旅程生成に失敗している場合のクライアント向けエラー情報を生成する。
     *
     * @param  AiPlanRequest  $aiPlanRequest  AI旅程生成リクエスト
     * @param  AiPlanRequestStatus  $status  AI旅程生成リクエストの現在状態
     */
    private function error(
        AiPlanRequest $aiPlanRequest,
        AiPlanRequestStatus $status,
    ): ?array {
        if ($status !== AiPlanRequestStatus::Failed) {
            return null;
        }

        $errorCode = $aiPlanRequest->getAttribute('error_code');

        if (! is_string($errorCode) || $errorCode === '') {
            $errorCode = 'AI_PLAN_GENERATION_FAILED';
        }

        return [
            'code' => $errorCode,
            'message' => $this->userFacingErrorMessage($errorCode),
        ];
    }

    /**
     * 内部エラーコードを安全なクライアント向けメッセージへ変換する。
     *
     * @param  string  $errorCode  DBへ保存されたアプリケーション側エラーコード
     * @return string 内部情報を含まないクライアント向けエラーメッセージ
     */
    private function userFacingErrorMessage(string $errorCode): string
    {
        return match ($errorCode) {
            GeminiErrorCode::RateLimited->value,
            GeminiErrorCode::ServerError->value,
            GeminiErrorCode::HttpError->value,
            GeminiErrorCode::ConnectionTimeout->value,
            GeminiErrorCode::ConnectionFailed->value => '旅程の生成に失敗しました。時間を置いて再度お試しください。',
            default => '旅程の生成に失敗しました。もう一度お試しください。',
        };
    }

    /**
     * 必須の日時属性をY-m-d H:i:s形式へ変換する。
     *
     * @param  AiPlanRequest  $aiPlanRequest  日時属性を保持するAI旅程生成リクエスト
     * @param  string  $attribute  変換対象の属性名
     * @return string Y-m-d H:i:s形式の日時
     *
     * @throws UnexpectedValueException 対象属性が日時として取得できない場合
     */
    private function requiredDateTime(AiPlanRequest $aiPlanRequest, string $attribute): string
    {
        $dateTime = $aiPlanRequest->getAttribute($attribute);

        if (! $dateTime instanceof CarbonInterface) {
            throw new UnexpectedValueException('AI旅程生成リクエストの日時が不正です。');
        }

        return $dateTime->format('Y-m-d H:i:s');
    }

    /**
     * NULLを許容する日時属性をY-m-d H:i:s形式へ変換する。
     *
     * @param  AiPlanRequest  $aiPlanRequest  日時属性を保持するAI旅程生成リクエスト
     * @param  string  $attribute  変換対象の属性名
     * @return string|null Y-m-d H:i:s形式の日時、または属性がNULLの場合はNULL
     *
     * @throws UnexpectedValueException 対象属性がNULLでも日時でもない場合
     */
    private function nullableDateTime(AiPlanRequest $aiPlanRequest, string $attribute): ?string
    {
        $dateTime = $aiPlanRequest->getAttribute($attribute);

        if ($dateTime === null) {
            return null;
        }

        if (! $dateTime instanceof CarbonInterface) {
            throw new UnexpectedValueException('AI旅程生成リクエストの日時が不正です。');
        }

        return $dateTime->format('Y-m-d H:i:s');
    }
}
