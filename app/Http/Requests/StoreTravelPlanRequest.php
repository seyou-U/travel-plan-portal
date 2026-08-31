<?php

namespace App\Http\Requests;

use App\Enums\PrefectureCode;
use App\Enums\TransportationType;
use App\Enums\TravelPlanItemType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTravelPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'days_count' => ['required', 'integer', 'between:1,31'],
            'budget_per_person' => ['required', 'integer', 'between:0,10000000'],
            'days' => ['required', 'array'],
            'days.*' => ['required', 'array'],
            'days.*.day_number' => ['required', 'integer', 'between:1,31'],
            'days.*.prefecture_code' => ['required', Rule::enum(PrefectureCode::class)],
            'days.*.items' => ['present', 'array'],
            'days.*.items.*' => ['required', 'array'],
            'days.*.items.*.spot_id' => ['nullable', 'integer', 'exists:spots,id'],
            'days.*.items.*.item_type' => ['required', Rule::enum(TravelPlanItemType::class)],
            'days.*.items.*.title' => ['required', 'string', 'max:255'],
            'days.*.items.*.spot_name' => ['nullable', 'string', 'max:255'],
            'days.*.items.*.start_time' => ['required', 'date_format:H:i'],
            'days.*.items.*.stay_minutes' => ['required', 'integer', 'min:0'],
            'days.*.items.*.transportation_type' => ['nullable', Rule::enum(TransportationType::class)],
            'days.*.items.*.travel_minutes' => ['required', 'integer', 'min:0'],
            'days.*.items.*.transportation_cost' => ['required', 'integer', 'min:0'],
            'days.*.items.*.visit_cost' => ['required', 'integer', 'min:0'],
            'days.*.items.*.memo' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $days = $this->input('days');
            $daysCount = $this->input('days_count');

            if (is_array($days) && is_int($daysCount) && count($days) !== $daysCount) {
                $validator->errors()->add('days', 'daysの件数はdays_countと一致させてください。');
            }

            if (! is_array($days)) {
                return;
            }

            foreach (array_values($days) as $dayIndex => $day) {
                if (is_array($day) && ($day['day_number'] ?? null) !== $dayIndex + 1) {
                    $validator->errors()->add("days.{$dayIndex}.day_number", 'day_numberは1から始まる連番にしてください。');
                }

                foreach (is_array($day) && is_array($day['items'] ?? null) ? $day['items'] : [] as $itemIndex => $item) {
                    if (! is_array($item)) {
                        continue;
                    }

                    $prefix = "days.{$dayIndex}.items.{$itemIndex}";
                    if (($item['item_type'] ?? null) === TravelPlanItemType::Transport->value) {
                        $this->validateTransportItem($validator, $prefix, $item);
                    } elseif (in_array($item['item_type'] ?? null, [
                        TravelPlanItemType::Spot->value,
                        TravelPlanItemType::Meal->value,
                        TravelPlanItemType::Hotel->value,
                    ], true)) {
                        $this->validateRegularItem($validator, $prefix, $item);
                    }
                }
            }
        }];
    }

    /** @param array<string, mixed> $item */
    private function validateTransportItem(Validator $validator, string $prefix, array $item): void
    {
        if (empty($item['transportation_type'])) {
            $validator->errors()->add("{$prefix}.transportation_type", '移動予定ではtransportation_typeが必須です。');
        }
        if (($item['travel_minutes'] ?? null) < 1) {
            $validator->errors()->add("{$prefix}.travel_minutes", '移動予定ではtravel_minutesを1以上にしてください。');
        }
        if (($item['stay_minutes'] ?? null) !== 0) {
            $validator->errors()->add("{$prefix}.stay_minutes", '移動予定ではstay_minutesを0にしてください。');
        }
        if (($item['visit_cost'] ?? null) !== 0) {
            $validator->errors()->add("{$prefix}.visit_cost", '移動予定ではvisit_costを0にしてください。');
        }
    }

    /** @param array<string, mixed> $item */
    private function validateRegularItem(Validator $validator, string $prefix, array $item): void
    {
        if (($item['stay_minutes'] ?? null) < 1) {
            $validator->errors()->add("{$prefix}.stay_minutes", '通常予定ではstay_minutesを1以上にしてください。');
        }
        if (($item['transportation_type'] ?? null) !== null) {
            $validator->errors()->add("{$prefix}.transportation_type", '通常予定ではtransportation_typeをnullにしてください。');
        }
        if (($item['travel_minutes'] ?? null) !== 0) {
            $validator->errors()->add("{$prefix}.travel_minutes", '通常予定ではtravel_minutesを0にしてください。');
        }
        if (($item['transportation_cost'] ?? null) !== 0) {
            $validator->errors()->add("{$prefix}.transportation_cost", '通常予定ではtransportation_costを0にしてください。');
        }
    }
}
