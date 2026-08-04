<?php

namespace App\Exceptions;

use App\Enums\GeminiErrorCode;

class GeminiOutputValidationException extends GeminiGenerationException
{
    /**
     * @param  array<string, list<string>>  $errors
     */
    public function __construct(public readonly array $errors)
    {
        parent::__construct(
            GeminiErrorCode::OutputValidationFailed,
            false,
            'Geminiの生成結果がアプリケーションの検証条件を満たしていません。',
        );
    }
}
