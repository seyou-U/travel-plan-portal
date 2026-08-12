<?php

namespace App\Services\Ai\Validators;

use App\Enums\GeminiErrorCode;
use App\Enums\TransportationType;
use App\Exceptions\GeminiGenerationException;
use App\Exceptions\GeminiOutputValidationException;
use App\Services\Ai\Schemas\AiTravelPlanResultSchema;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AiTravelPlanResultValidator
{
    private const TITLE_MAX_LENGTH = 100;

    private const SUMMARY_MAX_LENGTH = 1000;

    private const DESTINATION_MAX_LENGTH = 100;

    /**
     * @param  array<string, mixed>  $result
     * @param  array<string, mixed>  $requestPayload
     * @return array<string, mixed>
     */
    public function validate(array $result, array $requestPayload): array
    {
        $validator = Validator::make(['result' => $result], [
            'result' => [
                'required',
                'array:title,summary,destination,start_date,end_date,estimated_budget,days',
            ],
            'result.title' => ['required', 'string', 'max:'.self::TITLE_MAX_LENGTH],
            'result.summary' => ['required', 'string', 'max:'.self::SUMMARY_MAX_LENGTH],
            'result.destination' => ['required', 'string', 'max:'.self::DESTINATION_MAX_LENGTH],
            'result.start_date' => ['required', 'date_format:Y-m-d'],
            'result.end_date' => ['required', 'date_format:Y-m-d'],
            'result.estimated_budget' => ['required', 'integer', 'min:0'],
            'result.days' => ['required', 'array', 'min:1'],
            'result.days.*' => ['required', 'array:day_number,date,title,items'],
            'result.days.*.day_number' => ['required', 'integer', 'min:1'],
            'result.days.*.date' => ['required', 'date_format:Y-m-d'],
            'result.days.*.title' => ['required', 'string', 'max:'.self::TITLE_MAX_LENGTH],
            'result.days.*.items' => ['required', 'array', 'min:1'],
            'result.days.*.items.*' => [
                'required',
                'array:sort_order,item_type,title,start_time,stay_minutes,visit_cost,transportation_type,transportation_cost,memo',
            ],
            'result.days.*.items.*.sort_order' => ['required', 'integer', 'min:1'],
            'result.days.*.items.*.item_type' => [
                'required',
                'string',
                'in:'.implode(',', AiTravelPlanResultSchema::ITEM_TYPES),
            ],
            'result.days.*.items.*.title' => [
                'required',
                'string',
                'max:'.self::TITLE_MAX_LENGTH,
            ],
            'result.days.*.items.*.start_time' => [
                'present',
                'nullable',
                'string',
                'date_format:H:i',
            ],
            'result.days.*.items.*.stay_minutes' => ['required', 'integer', 'min:1'],
            'result.days.*.items.*.visit_cost' => ['required', 'integer', 'min:0'],
            'result.days.*.items.*.transportation_type' => [
                'present',
                'nullable',
                'string',
                'in:'.implode(',', array_column(TransportationType::cases(), 'value')),
            ],
            'result.days.*.items.*.transportation_cost' => ['required', 'integer', 'min:0'],
            'result.days.*.items.*.memo' => ['present', 'nullable', 'string'],
        ]);

        if ($validator->fails()) {
            throw new GeminiOutputValidationException($validator->errors()->toArray());
        }

        $validatedData = $validator->validated();
        $validated = $validatedData['result'] ?? null;

        if (! is_array($validated)) {
            throw new GeminiOutputValidationException([
                'result' => ['Geminiの生成結果がオブジェクト形式ではありません。'],
            ]);
        }

        $this->validateSemantics($validated, $requestPayload);

        return $validated;
    }

    /**
     * @param  array<string, mixed>  $result
     * @param  array<string, mixed>  $requestPayload
     */
    private function validateSemantics(array $result, array $requestPayload): void
    {
        [$startDate, $endDate] = $this->requestPeriod($requestPayload);
        $errors = [];

        if (($result['start_date'] ?? null) !== $startDate->toDateString()) {
            $errors['result.start_date'][] = '生成結果の開始日が入力条件と一致しません。';
        }

        if (($result['end_date'] ?? null) !== $endDate->toDateString()) {
            $errors['result.end_date'][] = '生成結果の終了日が入力条件と一致しません。';
        }

        $days = $result['days'];
        $expectedDaysCount = (int) $startDate->diffInDays($endDate) + 1;

        if (count($days) !== $expectedDaysCount) {
            $errors['result.days'][] = '生成結果の日数が入力された旅行期間と一致しません。';
        }

        foreach ($days as $dayIndex => $day) {
            $dayPath = "result.days.{$dayIndex}";

            if (($day['day_number'] ?? null) !== $dayIndex + 1) {
                $errors["{$dayPath}.day_number"][] = 'day_numberは1から始まる連番にしてください。';
            }

            if (($day['date'] ?? null) !== $startDate->addDays($dayIndex)->toDateString()) {
                $errors["{$dayPath}.date"][] = '日付が入力された旅行期間と一致しません。';
            }

            foreach ($day['items'] as $itemIndex => $item) {
                $itemPath = "{$dayPath}.items.{$itemIndex}";

                if (($item['sort_order'] ?? null) !== $itemIndex + 1) {
                    $errors["{$itemPath}.sort_order"][] = 'sort_orderは1から始まる連番にしてください。';
                }

                if (($item['item_type'] ?? null) === 'transport') {
                    if (! is_string($item['transportation_type'] ?? null)) {
                        $errors["{$itemPath}.transportation_type"][] = '移動予定には移動手段を設定してください。';
                    }

                    if (($item['visit_cost'] ?? null) !== 0) {
                        $errors["{$itemPath}.visit_cost"][] = '移動予定のvisit_costは0にしてください。';
                    }
                } else {
                    if (($item['transportation_type'] ?? null) !== null) {
                        $errors["{$itemPath}.transportation_type"][] = '移動予定以外のtransportation_typeはnullにしてください。';
                    }

                    if (($item['transportation_cost'] ?? null) !== 0) {
                        $errors["{$itemPath}.transportation_cost"][] = '移動予定以外のtransportation_costは0にしてください。';
                    }
                }
            }
        }

        if ($errors !== []) {
            throw new GeminiOutputValidationException($errors);
        }
    }

    /**
     * @param  array<string, mixed>  $requestPayload
     * @return array{CarbonImmutable, CarbonImmutable}
     */
    private function requestPeriod(array $requestPayload): array
    {
        $startDate = $requestPayload['start_date'] ?? null;
        $endDate = $requestPayload['end_date'] ?? null;

        if (! is_string($startDate) || ! is_string($endDate)) {
            throw $this->invalidRequestPeriodException();
        }

        try {
            $start = CarbonImmutable::createFromFormat('!Y-m-d', $startDate);
            $end = CarbonImmutable::createFromFormat('!Y-m-d', $endDate);
        } catch (Throwable $exception) {
            throw $this->invalidRequestPeriodException($exception);
        }

        if (
            $start->toDateString() !== $startDate
            || $end->toDateString() !== $endDate
            || $end->lessThan($start)
        ) {
            throw $this->invalidRequestPeriodException();
        }

        return [$start, $end];
    }

    private function invalidRequestPeriodException(?Throwable $previous = null): GeminiGenerationException
    {
        return new GeminiGenerationException(
            GeminiErrorCode::ConfigurationError,
            false,
            'AI旅程生成条件の日付範囲が不正です。',
            $previous,
        );
    }
}
