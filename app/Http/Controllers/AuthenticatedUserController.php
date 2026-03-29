<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthenticatedUserController extends Controller
{
    public function show(Request $request): JsonResponse|Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->noContent();
        }

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
