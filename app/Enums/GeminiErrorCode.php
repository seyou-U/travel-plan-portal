<?php

declare(strict_types=1);

namespace App\Enums;

enum GeminiErrorCode: string
{
    case ApiKeyMissing = 'GEMINI_API_KEY_MISSING';
    case ConfigurationError = 'GEMINI_CONFIGURATION_ERROR';
    case BadRequest = 'GEMINI_BAD_REQUEST';
    case Unauthorized = 'GEMINI_UNAUTHORIZED';
    case Forbidden = 'GEMINI_FORBIDDEN';
    case RateLimited = 'GEMINI_RATE_LIMITED';
    case ServerError = 'GEMINI_SERVER_ERROR';
    case HttpError = 'GEMINI_HTTP_ERROR';
    case ConnectionTimeout = 'GEMINI_CONNECTION_TIMEOUT';
    case ConnectionFailed = 'GEMINI_CONNECTION_FAILED';
    case ModelOutputMissing = 'GEMINI_MODEL_OUTPUT_MISSING';
    case ModelOutputEmpty = 'GEMINI_MODEL_OUTPUT_EMPTY';
    case InvalidJson = 'GEMINI_INVALID_JSON';
    case OutputValidationFailed = 'GEMINI_OUTPUT_VALIDATION_FAILED';
}
