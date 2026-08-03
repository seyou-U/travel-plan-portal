<?php

namespace App\Exceptions;

use App\Enums\GeminiErrorCode;
use RuntimeException;
use Throwable;

class GeminiGenerationException extends RuntimeException
{
    public function __construct(
        public readonly GeminiErrorCode $errorCode,
        public readonly bool $retryable,
        string $message,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
