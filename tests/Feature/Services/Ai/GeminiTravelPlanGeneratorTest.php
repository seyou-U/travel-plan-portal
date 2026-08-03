<?php

namespace Tests\Feature\Services\Ai;

use App\Enums\GeminiErrorCode;
use App\Exceptions\GeminiGenerationException;
use App\Services\Ai\GeminiTravelPlanGenerator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class GeminiTravelPlanGeneratorTest extends TestCase
{
    private const ENDPOINT = 'https://gemini.example.test/v1beta/interactions';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set([
            'services.gemini.api_key' => 'test-placeholder',
            'services.gemini.model' => 'gemini-3.6-flash',
            'services.gemini.endpoint' => self::ENDPOINT,
            'services.gemini.connect_timeout' => 10,
            'services.gemini.timeout' => 50,
        ]);

        Http::preventStrayRequests();
    }

    public function test_it_posts_interaction_request_and_returns_last_model_output(): void
    {
        $expectedResult = $this->validResult();
        Http::fake([
            self::ENDPOINT => Http::response([
                'steps' => [
                    [
                        'type' => 'model_output',
                        'content' => [
                            ['type' => 'text', 'text' => '{"title":"古い出力"}'],
                        ],
                    ],
                    [
                        'type' => 'model_output',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => json_encode($expectedResult, JSON_THROW_ON_ERROR),
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $result = (new GeminiTravelPlanGenerator)->generate($this->requestPayload());

        $this->assertSame($expectedResult, $result);
        Http::assertSentCount(1);
        Http::assertSent(function (Request $request): bool {
            $data = $request->data();
            $responseFormat = $data['response_format'] ?? null;

            return $request->method() === 'POST'
                && $request->url() === self::ENDPOINT
                && $request->hasHeader('x-goog-api-key')
                && $request->hasHeader('Content-Type', 'application/json')
                && $request->hasHeader('Accept', 'application/json')
                && ($data['model'] ?? null) === 'gemini-3.6-flash'
                && ($data['store'] ?? null) === false
                && is_string($data['input'] ?? null)
                && str_contains($data['input'], '旅行全体の総予算')
                && is_array($responseFormat)
                && ($responseFormat['type'] ?? null) === 'text'
                && ($responseFormat['mime_type'] ?? null) === 'application/json'
                && is_array($responseFormat['schema'] ?? null)
                && ($responseFormat['schema']['additionalProperties'] ?? null) === false
                && ($responseFormat['schema']['properties']['days']['minItems'] ?? null) === 3
                && ($responseFormat['schema']['properties']['days']['maxItems'] ?? null) === 3;
        });
    }

    public function test_missing_api_key_fails_without_external_request(): void
    {
        config()->set('services.gemini.api_key', '');
        Http::fake();

        $this->assertGeminiFailure(
            GeminiErrorCode::ApiKeyMissing,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
        Http::assertNothingSent();
    }

    public function test_optional_request_conditions_may_be_omitted(): void
    {
        $requestPayload = $this->requestPayload();
        unset(
            $requestPayload['budget'],
            $requestPayload['transportation'],
            $requestPayload['preferences'],
            $requestPayload['notes'],
        );
        Http::fake([
            self::ENDPOINT => Http::response($this->interactionResponse(
                json_encode($this->validResult(), JSON_THROW_ON_ERROR),
            )),
        ]);

        $result = (new GeminiTravelPlanGenerator)->generate($requestPayload);

        $this->assertSame('京都2泊3日の旅', $result['title']);
    }

    /**
     * @param  array{int, GeminiErrorCode}  $data
     */
    #[DataProvider('nonRetryableHttpStatusProvider')]
    public function test_non_retryable_http_statuses_are_classified(
        int $status,
        GeminiErrorCode $errorCode,
    ): void {
        Http::fake([
            self::ENDPOINT => Http::response([], $status),
        ]);

        $this->assertGeminiFailure(
            $errorCode,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    /**
     * @return array<string, array{int, GeminiErrorCode}>
     */
    public static function nonRetryableHttpStatusProvider(): array
    {
        return [
            '400 Bad Request' => [400, GeminiErrorCode::BadRequest],
            '401 Unauthorized' => [401, GeminiErrorCode::Unauthorized],
            '403 Forbidden' => [403, GeminiErrorCode::Forbidden],
        ];
    }

    public function test_rate_limit_is_retryable(): void
    {
        Http::fake([
            self::ENDPOINT => Http::response([], 429),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::RateLimited,
            true,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_server_error_is_retryable(): void
    {
        Http::fake([
            self::ENDPOINT => Http::response([], 500),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::ServerError,
            true,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_connection_timeout_is_retryable(): void
    {
        Http::fake(function (): never {
            throw new ConnectionException('Connection timed out.');
        });

        $this->assertGeminiFailure(
            GeminiErrorCode::ConnectionTimeout,
            true,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_missing_model_output_fails(): void
    {
        Http::fake([
            self::ENDPOINT => Http::response([
                'steps' => [
                    ['type' => 'thought'],
                ],
            ]),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::ModelOutputMissing,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_empty_model_output_fails(): void
    {
        Http::fake([
            self::ENDPOINT => Http::response($this->interactionResponse('   ')),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::ModelOutputEmpty,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_invalid_json_fails(): void
    {
        Http::fake([
            self::ENDPOINT => Http::response($this->interactionResponse('{invalid-json')),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::InvalidJson,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_missing_required_key_fails_application_validation(): void
    {
        $result = $this->validResult();
        unset($result['title']);

        Http::fake([
            self::ENDPOINT => Http::response($this->interactionResponse(
                json_encode($result, JSON_THROW_ON_ERROR),
            )),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::OutputValidationFailed,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    public function test_invalid_item_type_fails_application_validation(): void
    {
        $result = $this->validResult();
        $result['days'][0]['items'][0]['item_type'] = 'invalid';

        Http::fake([
            self::ENDPOINT => Http::response($this->interactionResponse(
                json_encode($result, JSON_THROW_ON_ERROR),
            )),
        ]);

        $this->assertGeminiFailure(
            GeminiErrorCode::OutputValidationFailed,
            false,
            fn (): array => (new GeminiTravelPlanGenerator)->generate($this->requestPayload()),
        );
    }

    /**
     * @param  callable(): array<string, mixed>  $callback
     */
    private function assertGeminiFailure(
        GeminiErrorCode $errorCode,
        bool $retryable,
        callable $callback,
    ): void {
        $exception = null;

        try {
            $callback();
        } catch (GeminiGenerationException $caught) {
            $exception = $caught;
        }

        $this->assertInstanceOf(GeminiGenerationException::class, $exception);
        $this->assertSame($errorCode, $exception->errorCode);
        $this->assertSame($retryable, $exception->retryable);
    }

    /**
     * @return array<string, mixed>
     */
    private function interactionResponse(string $text): array
    {
        return [
            'steps' => [
                [
                    'type' => 'model_output',
                    'content' => [
                        ['type' => 'text', 'text' => $text],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function requestPayload(): array
    {
        return [
            'destination' => '京都',
            'start_date' => '2026-08-10',
            'end_date' => '2026-08-12',
            'departure_location' => '東京',
            'number_of_people' => 2,
            'budget' => 100000,
            'transportation' => 'train',
            'preferences' => [
                '寺社を巡りたい',
                '京都らしい料理を食べたい',
            ],
            'notes' => '移動時間を短めにしたい',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validResult(): array
    {
        $days = [];

        foreach (['2026-08-10', '2026-08-11', '2026-08-12'] as $index => $date) {
            $days[] = [
                'day_number' => $index + 1,
                'date' => $date,
                'title' => '京都観光',
                'items' => [
                    [
                        'sort_order' => 1,
                        'item_type' => 'spot',
                        'title' => '清水寺',
                        'description' => '清水寺を観光します。',
                        'start_time' => '09:00',
                        'end_time' => '11:00',
                        'estimated_cost' => 500,
                    ],
                ],
            ];
        }

        return [
            'title' => '京都2泊3日の旅',
            'summary' => '京都の寺社と食事を楽しむ旅行プランです。',
            'destination' => '京都',
            'start_date' => '2026-08-10',
            'end_date' => '2026-08-12',
            'estimated_budget' => 100000,
            'days' => $days,
        ];
    }
}
