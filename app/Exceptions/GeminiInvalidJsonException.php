<?php

namespace App\Exceptions;

use App\Enums\GeminiErrorCode;
use Throwable;

class GeminiInvalidJsonException extends GeminiGenerationException
{
    public function __construct(?Throwable $previous = null)
    {
        parent::__construct(
            GeminiErrorCode::InvalidJson,
            false,
            'Geminiの生成結果をJSONとして解析できませんでした。',
            $previous,
        );
    }
}
