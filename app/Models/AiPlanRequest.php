<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AiPlanRequest extends Model
{
    use HasFactory;

    /**
     * 一括代入を許可する属性。
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'status',
        'request_payload',
        'provider',
        'started_at',
        'completed_at',
        'failed_at',
        'error_code',
        'error_message',
    ];

    /**
     * 属性の型変換。
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'request_payload' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    /**
     * このAI旅程生成を依頼したユーザー。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * このAI旅程リクエストに対する生成結果。
     */
    public function result(): HasOne
    {
        return $this->hasOne(AiPlanResult::class);
    }
}
