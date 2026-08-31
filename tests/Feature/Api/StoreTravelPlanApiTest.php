<?php

namespace Tests\Feature\Api;

use App\Models\TravelPlanItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class StoreTravelPlanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_store_plan(): void
    {
        $this->postJson('/api/plans', $this->validPayload())->assertUnauthorized();
    }

    public function test_plan_days_and_items_are_stored_and_returned(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/plans', $this->validPayload())
            ->assertCreated()
            ->assertJsonPath('title', '京都・大阪旅行')
            ->assertJsonPath('days_count', 2)
            ->assertJsonPath('days.0.date', '2026-09-10')
            ->assertJsonPath('days.1.date', '2026-09-11')
            ->assertJsonPath('days.0.prefecture_code', '26')
            ->assertJsonPath('days.0.prefecture_name', '京都府')
            ->assertJsonPath('days.0.items.0.sort_order', 1)
            ->assertJsonPath('days.0.items.0.end_time', '10:30:00')
            ->assertJsonPath('days.0.items.1.item_type', 'transport')
            ->assertJsonPath('days.0.items.1.sort_order', 2)
            ->assertJsonPath('days.0.items.1.end_time', '11:15:00')
            ->assertJsonPath('days.0.items.1.visit_cost', 0)
            ->assertJsonPath('days.1.items', []);

        $uuid = $response->json('uuid');
        $this->assertTrue(Str::isUuid($uuid));
        $this->assertDatabaseHas('travel_plans', [
            'uuid' => $uuid,
            'user_id' => $user->id,
            'days_count' => 2,
        ]);
        $this->assertDatabaseHas('travel_plan_days', [
            'day_number' => 2,
            'date' => '2026-09-11 00:00:00',
            'prefecture_code' => '27',
        ]);
        $this->assertDatabaseHas('travel_plan_items', [
            'sort_order' => 2,
            'item_type' => 'transport',
            'stay_minutes' => 0,
            'transportation_type' => 'train',
            'travel_minutes' => 45,
            'transportation_cost' => 800,
            'visit_cost' => 0,
        ]);

        $this->getJson("/api/plans/{$uuid}")
            ->assertOk()
            ->assertJsonPath('days.0.items.0.memo', '朝一番に訪問')
            ->assertJsonPath('days.0.items.0.stay_minutes', 90)
            ->assertJsonPath('days.0.items.0.transportation_cost', 0)
            ->assertJsonPath('days.0.items.0.visit_cost', 1200);
    }

    /** @param callable(array<string, mixed>): array<string, mixed> $change */
    #[DataProvider('invalidPayloadProvider')]
    public function test_inconsistent_or_invalid_payload_is_rejected(string $errorKey, callable $change): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/plans', $change($this->validPayload()))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorKey);
    }

    /**
     * @return array<string, array{string, callable(array<string, mixed>): array<string, mixed>}>
     */
    public static function invalidPayloadProvider(): array
    {
        return [
            'days count mismatch' => ['days', function (array $payload): array {
                $payload['days_count'] = 1;

                return $payload;
            }],
            'non sequential day number' => ['days.1.day_number', function (array $payload): array {
                $payload['days'][1]['day_number'] = 3;

                return $payload;
            }],
            'invalid prefecture' => ['days.0.prefecture_code', function (array $payload): array {
                $payload['days'][0]['prefecture_code'] = '99';

                return $payload;
            }],
            'invalid item type' => ['days.0.items.0.item_type', function (array $payload): array {
                $payload['days'][0]['items'][0]['item_type'] = 'event';

                return $payload;
            }],
            'transport visit cost' => ['days.0.items.1.visit_cost', function (array $payload): array {
                $payload['days'][0]['items'][1]['visit_cost'] = 100;

                return $payload;
            }],
            'regular transportation cost' => ['days.0.items.0.transportation_cost', function (array $payload): array {
                $payload['days'][0]['items'][0]['transportation_cost'] = 100;

                return $payload;
            }],
        ];
    }

    public function test_transaction_rolls_back_all_records_when_item_creation_fails(): void
    {
        Sanctum::actingAs(User::factory()->create());
        TravelPlanItem::creating(function (): never {
            throw new RuntimeException('forced failure');
        });

        $this->postJson('/api/plans', $this->validPayload())->assertInternalServerError();

        $this->assertDatabaseCount('travel_plans', 0);
        $this->assertDatabaseCount('travel_plan_days', 0);
        $this->assertDatabaseCount('travel_plan_items', 0);
    }

    /** @return array<string, mixed> */
    private function validPayload(): array
    {
        return [
            'title' => '京都・大阪旅行',
            'start_date' => '2026-09-10',
            'days_count' => 2,
            'budget_per_person' => 50000,
            'uuid' => (string) Str::uuid(),
            'user_id' => 999999,
            'days' => [
                [
                    'day_number' => 1,
                    'prefecture_code' => '26',
                    'items' => [
                        [
                            'spot_id' => null,
                            'item_type' => 'spot',
                            'title' => '清水寺',
                            'spot_name' => '清水寺',
                            'start_time' => '09:00',
                            'stay_minutes' => 90,
                            'transportation_type' => null,
                            'travel_minutes' => 0,
                            'transportation_cost' => 0,
                            'visit_cost' => 1200,
                            'memo' => '朝一番に訪問',
                            'sort_order' => 99,
                        ],
                        [
                            'spot_id' => null,
                            'item_type' => 'transport',
                            'title' => '大阪へ移動',
                            'spot_name' => null,
                            'start_time' => '10:30',
                            'stay_minutes' => 0,
                            'transportation_type' => 'train',
                            'travel_minutes' => 45,
                            'transportation_cost' => 800,
                            'visit_cost' => 0,
                            'memo' => null,
                            'sort_order' => 88,
                        ],
                    ],
                ],
                [
                    'day_number' => 2,
                    'prefecture_code' => '27',
                    'items' => [],
                ],
            ],
        ];
    }
}
