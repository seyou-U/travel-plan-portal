<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function store(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = User::create([
            ...$validated,
            'uuid' => (string) Str::uuid(),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => '新規登録が完了しました。',
        ], 201);
    }
}
