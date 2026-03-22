<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthenticatedUserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $iconImageUrl = null;

        if ($user->icon_image_path !== null) {
            $iconImageUrl = filter_var($user->icon_image_path, FILTER_VALIDATE_URL)
                ? $user->icon_image_path
                : rtrim((string) config('app.frontend_url'), '/').'/'.ltrim($user->icon_image_path, '/');
        }

        return response()->json([
            'uuid' => $user->uuid,
            'name' => $user->name,
            'email' => $user->email,
            'icon_image_url' => $iconImageUrl,
        ]);
    }
}
