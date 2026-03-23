<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        // セッションを再生成し、セッションからのデータを削除する(セッションの無効化)
        $request->session()->invalidate();
        // ログアウトした状態でセッション固定攻撃を防ぐ策として、新しいセッショントークンを生成し前のトークンが使用される
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'ログアウトしました。',
        ], 200);
    }
}
