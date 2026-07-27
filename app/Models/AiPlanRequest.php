<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AiPlanRequest extends Model
{
    use HasFactory;

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

    protected function casts(): array
    {
        return [
            'request_payload' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function result(): HasOne
    {
        return $this->hasOne(AiPlanResult::class);
    }
}
