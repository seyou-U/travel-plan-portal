<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Throwable;

/**
 * パスワード再設定を処理するコントローラー。
 */
class ResetPasswordController extends Controller
{
    /**
     * トークンを検証し、新しいパスワードへ更新する。
     *
     * @param  ResetPasswordRequest  $request  パスワード再設定情報を含むリクエスト
     * @return JsonResponse パスワード再設定結果のJSONレスポンス
     */
    public function store(ResetPasswordRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        try {
            $status = Password::broker()->reset(
                $credentials,
                function (User $user, string $password): void {
                    $user->forceFill([
                        'password' => $password,
                    ])->save();

                    event(new PasswordReset($user));
                },
            );
        } catch (Throwable $exception) {
            Log::error('パスワードの再設定に失敗しました。', [
                'exception' => $exception,
            ]);

            return response()->json([
                'code' => 'INTERNAL_SERVER_ERROR',
                'message' => 'サーバー内部エラーが発生しました。',
            ], 500);
        }

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'code' => 'INVALID_PASSWORD_RESET_TOKEN',
                'message' => 'パスワード再設定リンクが無効、または期限切れです。',
            ], 422);
        }

        return response()->json([
            'message' => 'パスワードを再設定しました。',
        ]);
    }
}
