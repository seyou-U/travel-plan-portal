<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GenerateAiPlanRequest extends FormRequest
{
    /**
     * リクエストに対する権限を設定する。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルールを設定する。
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'destination' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'departure_location' => ['required', 'string', 'max:100'],
            'number_of_people' => ['required', 'integer', 'between:1,20'],
            'budget' => ['nullable', 'integer', 'between:0,10000000'],
            'transportation' => ['nullable', 'string', 'in:train,car,bus,plane,walk,other'],
            'preferences' => ['nullable', 'array', 'max:10'],
            'preferences.*' => ['string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * バリデーションメッセージを設定する。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attributeは必須です。',
            'string' => ':attributeは文字列で入力してください。',
            'integer' => ':attributeは整数で入力してください。',
            'date_format' => ':attributeはY-m-d形式で入力してください。',
            'start_date.after_or_equal' => '出発日は本日以降の日付を入力してください。',
            'end_date.after_or_equal' => '帰着日は出発日以降の日付を入力してください。',
            'destination.max' => '目的地は100文字以内で入力してください。',
            'departure_location.max' => '出発地は100文字以内で入力してください。',
            'number_of_people.between' => '旅行人数は1人以上20人以下で入力してください。',
            'budget.between' => '予算は0円以上10,000,000円以下で入力してください。',
            'transportation.in' => '交通手段はtrain、car、bus、plane、walk、otherのいずれかを入力してください。',
            'preferences.array' => '希望条件は配列で入力してください。',
            'preferences.max' => '希望条件は10件以内で入力してください。',
            'preferences.*.max' => '希望条件は1件につき100文字以内で入力してください。',
            'notes.max' => '備考は1,000文字以内で入力してください。',
        ];
    }

    /**
     * バリデーション対象の日本語項目名を設定する。
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'destination' => '目的地',
            'start_date' => '出発日',
            'end_date' => '帰着日',
            'departure_location' => '出発地',
            'number_of_people' => '旅行人数',
            'budget' => '予算',
            'transportation' => '交通手段',
            'preferences' => '希望条件',
            'preferences.*' => '希望条件',
            'notes' => '備考',
        ];
    }
}
