<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Throwable;

/**
 * パスワード再設定メール送信を処理するコントローラー。
 */
class ForgotPasswordController extends Controller
{
    /**
     * パスワード再設定用のリンクを含むメールを送信する。
     *
     * 登録されていないメールアドレスの場合も登録済みの場合と同じ成功レスポンスを返却する
     *
     * @param ForgotPasswordRequest $request リクエスト
     * @return JsonResponse JSONレスポンス
     */
    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            Password::broker()->sendResetLink($request->validated());
        } catch (Throwable $exception) {
            Log::error('パスワード再設定メールの送信に失敗しました。', [
                'exception' => $exception,
            ]);

            return response()->json([
                'code' => 'INTERNAL_SERVER_ERROR',
                'message' => 'サーバー内部エラーが発生しました。',
            ], 500);
        }

        return response()->json([
            'message' => '入力されたメールアドレスに、パスワード再設定の案内を送信しました。',
        ]);
    }
}
