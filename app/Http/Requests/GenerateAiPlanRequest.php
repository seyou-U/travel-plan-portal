<?php

namespace App\Http\Requests;

use App\Enums\PrefectureCode;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

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
            'prefecture' => ['required', 'string', Rule::in(PrefectureCode::values())],
            'start_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'departure_location' => ['required', 'string', 'max:100'],
            'number_of_people' => ['required', 'integer', 'between:1,20'],
            'budget' => ['required', 'integer', 'between:0,10000000'],
            'transport_priority' => ['required', 'string', Rule::in(['おまかせ', '時間優先', '費用優先'])],
            'preferences' => ['nullable', 'array', 'max:10'],
            'preferences.*' => ['nullable', 'string', 'max:100'],
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
            'end_date.after_or_equal' => '帰着日には出発日以降の日付を指定してください。',
            'prefecture.in' => '都道府県は選択肢から指定してください。',
            'departure_location.max' => '出発地は100文字以内で入力してください。',
            'number_of_people.between' => '旅行人数は1人以上20人以下で入力してください。',
            'budget.between' => '1人当たり予算は0円以上10,000,000円以下で入力してください。',
            'transport_priority.in' => '移動方針はおまかせ、時間優先、費用優先のいずれかを指定してください。',
            'preferences.array' => '希望条件は配列で入力してください。',
            'preferences.max' => '希望条件は10件以内で入力してください。',
            'preferences.*.max' => '希望条件は1件につき100文字以内で入力してください。',
            'notes.max' => '備考は1,000文字以内で入力してください。',
        ];
    }

    /**
     * 旅行期間が最大31日以内であることを検証する。
     *
     * @return array<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (
                    $validator->errors()->has('start_date')
                    || $validator->errors()->has('end_date')
                ) {
                    return;
                }

                $startDate = CarbonImmutable::createFromFormat(
                    '!Y-m-d',
                    (string) $this->input('start_date'),
                );
                $endDate = CarbonImmutable::createFromFormat(
                    '!Y-m-d',
                    (string) $this->input('end_date'),
                );

                if ($endDate->greaterThan($startDate->addDays(30))) {
                    $validator->errors()->add(
                        'end_date',
                        '旅行期間は31日以内で指定してください。',
                    );
                }
            },
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
            'prefecture' => '都道府県',
            'start_date' => '出発日',
            'end_date' => '帰着日',
            'departure_location' => '出発地',
            'number_of_people' => '旅行人数',
            'budget' => '1人当たり予算',
            'transport_priority' => '移動方針',
            'preferences' => '希望条件',
            'preferences.*' => '希望条件',
            'notes' => '備考',
        ];
    }

    /**
     * APIとしてバリデーションエラーをJSONで返却する。
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => '入力内容に誤りがあります。',
            'errors' => $validator->errors(),
        ], 422));
    }
}
