<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPlanResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_plan_request_id',
        'result_payload',
    ];

    protected function casts(): array
    {
        return [
            'result_payload' => 'array',
        ];
    }

    public function aiPlanRequest(): BelongsTo
    {
        return $this->belongsTo(AiPlanRequest::class);
    }
}
