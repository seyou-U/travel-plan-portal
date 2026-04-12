<?php

namespace App\Http\Controllers;

use App\Enums\PrefectureCode;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TravelPlan extends Controller
{
    public function index(Request $request)
    {
        if (! Auth::check()) {
            return response()->json(['message' => '認証が必要です'], 401);
        }

        try {
            $userId = Auth::id();

            if ($userId === null) {
                return response()->json(['message' => '認証が必要です'], 401);
            }

            $currentPage = (int) $request->query('current_page', 1);
            $perPage = 10;

            $paginated = DB::table('travel_plans')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'current_page', $currentPage);

            $planIds = collect($paginated->items())->pluck('id')->all();

            $prefecturesByPlan = DB::table('travel_plan_days')
                ->select('travel_plan_id', 'prefecture_code')
                ->whereIn('travel_plan_id', $planIds)
                ->distinct()
                ->orderBy('prefecture_code')
                ->get()
                ->groupBy('travel_plan_id')
                ->map(function ($rows) {
                    return $rows->map(function ($row) {
                        $code = (string) $row->prefecture_code;

                        return PrefectureCode::labelFromCode($code) ?? $code;
                    })->values()->all();
                });

            $totalCostByPlan = DB::table('travel_plan_items')
                ->selectRaw('travel_plan_days.travel_plan_id AS plan_id, SUM(travel_plan_items.transportation_cost + travel_plan_items.visit_cost) AS total_cost')
                ->join('travel_plan_days', 'travel_plan_items.travel_plan_day_id', '=', 'travel_plan_days.id')
                ->whereIn('travel_plan_days.travel_plan_id', $planIds)
                ->groupBy('travel_plan_days.travel_plan_id')
                ->pluck('total_cost', 'plan_id');

            $responsePlans = collect($paginated->items())->map(function ($plan) use ($prefecturesByPlan, $totalCostByPlan) {
                $endDate = Carbon::parse($plan->start_date)
                    ->addDays(max(0, (int) $plan->days_count - 1))
                    ->toDateString();

                return [
                    'uuid' => $plan->uuid,
                    'title' => $plan->title,
                    'start_date' => $plan->start_date,
                    'end_date' => $endDate,
                    'days_count' => (int) $plan->days_count,
                    'prefectures' => $prefecturesByPlan->get($plan->id, []),
                    'total_cost' => (int) ($totalCostByPlan->get($plan->id) ?? 0),
                ];
            })->values()->all();

            return response()->json([
                'data' => $responsePlans,
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'total' => $paginated->total(),
                    'per_page' => $paginated->perPage(),
                    'last_page' => $paginated->lastPage(),
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('TravelPlan index error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'サービスが一時的に利用できません'], 500);
        }
    }

    public function show($uuid)
    {
        if (! Auth::check()) {
            return response()->json(['message' => '認証が必要です'], 401);
        }

        if (! Str::isUuid($uuid)) {
            return response()->json(['message' => 'uuidの形式が不正です'], 400);
        }

        try {
            $userId = Auth::id();

            if ($userId === null) {
                return response()->json(['message' => '認証が必要です'], 401);
            }

            $plan = DB::table('travel_plans')
                ->where('uuid', $uuid)
                ->where('user_id', $userId)
                ->first();

            if (! $plan) {
                return response()->json(['message' => '旅行プランが見つかりませんでした'], 404);
            }

            $days = collect(DB::table('travel_plan_days')
                ->where('travel_plan_id', $plan->id)
                ->orderBy('day_number')
                ->get());

            $dayIds = $days->pluck('id');

            $items = $dayIds->isNotEmpty()
                ? collect(DB::table('travel_plan_items')
                    ->whereIn('travel_plan_day_id', $dayIds)
                    ->orderBy('travel_plan_day_id')
                    ->orderBy('start_time')
                    ->get())
                : collect();

            $itemsByDay = $items
                ->groupBy('travel_plan_day_id')
                ->map(function ($dayItems) {
                    return $dayItems->map(function ($item) {
                        return [
                            'title' => $item->title,
                            'spot_name' => $item->spot_name,
                            'start_time' => $item->start_time,
                            'end_time' => Carbon::parse($item->start_time)
                                ->addMinutes((int) $item->stay_minutes)
                                ->format('H:i:s'),
                            'transportation_type' => $item->transportation_type,
                            'travel_minutes' => (int) $item->travel_minutes,
                        ];
                    })->values();
                });

            $responseDays = $days->map(function ($day) use ($itemsByDay) {
                $prefectureCode = (string) $day->prefecture_code;

                return [
                    'day_number' => (int) $day->day_number,
                    'prefecture_name' => PrefectureCode::labelFromCode($prefectureCode) ?? $prefectureCode,
                    'items' => $itemsByDay->get($day->id, collect())->all(),
                ];
            })->values()->all();

            $endDate = Carbon::parse($plan->start_date)
                ->addDays(max(0, (int) $plan->days_count - 1))
                ->toDateString();

            return response()->json([
                'uuid' => $plan->uuid,
                'title' => $plan->title,
                'start_date' => $plan->start_date,
                'end_date' => $endDate,
                'budget_per_person' => (int) $plan->budget_per_person,
                'days' => $responseDays,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('TravelPlan show error', [
                'uuid' => $uuid,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'サービスが一時的に利用できません'], 500);
        }
    }
}
