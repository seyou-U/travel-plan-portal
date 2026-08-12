<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPlanResult extends Model
{
    use HasFactory;

    /**
     * 一括代入を許可する属性。
     *
     * @var list<string>
     */
    protected $fillable = [
        'ai_plan_request_id',
        'result_payload',
    ];

    /**
     * 属性の型変換。
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'result_payload' => 'array',
        ];
    }

    /**
     * この生成結果に対応するAI旅程リクエスト。
     *
     * @return BelongsTo<AiPlanRequest, $this>
     */
    public function aiPlanRequest(): BelongsTo
    {
        return $this->belongsTo(AiPlanRequest::class);
    }
}
