<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    /**
     * リクエストに対する権限を設定する
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルールを設定する
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'max:255', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ];
    }

    /**
     * バリデーションメッセージを設定する
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function messages(): array
    {
        return [
            'name.required' => '名前は必須です。',
            'name.max' => '名前は50文字以内で入力してください。',

            'email.required' => 'メールアドレスは必須です。',
            'email.max' => 'メールアドレスは255文字以内で入力してください。',
            'email.email' => 'メールアドレスの形式が正しくありません。',
            'email.unique' => 'すでにメールアドレスが使用されています。',

            'password.required' => 'パスワードは必須です。',
            'password.min' => 'パスワードは8文字以上で入力してください。',
            'password.max' => 'パスワードは255文字以内で入力してください。',
            'password.confirmed' => 'パスワード確認用のパスワードが一致しません。',
        ];
    }

    /**
     * APIとしてバリデーションエラーをJSONで返却する
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => '入力内容に誤りがあります。',
            'errors' => $validator->errors(),
        ], 422));
    }
}
