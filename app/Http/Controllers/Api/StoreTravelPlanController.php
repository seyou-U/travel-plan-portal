<?php

namespace App\Http\Controllers\Api;

use App\Actions\StoreTravelPlanAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\TravelPlan as TravelPlanController;
use App\Http\Requests\StoreTravelPlanRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StoreTravelPlanController extends Controller
{
    public function __invoke(StoreTravelPlanRequest $request, StoreTravelPlanAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $plan = $action->execute($user, $request->validated());

        return app(TravelPlanController::class)->show($plan->uuid)->setStatusCode(201);
    }
}
