<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials, false)) {
            return response()->json([
                'message' => '入力内容に誤りがあります。',
                'errors' => [
                    'email' => ['メールアドレスまたはパスワードが正しくありません。'],
                ],
            ], 422);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'ログインしました。',
        ], 200);
    }
}
