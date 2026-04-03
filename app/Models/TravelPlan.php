<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TravelPlan extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'title',
        'start_date',
        'days_count',
        'budget_per_person',
    ];

    protected function casts()
    {
        return [
            'start_date' => 'date',
            'days_count' => 'integer',
            'budget_per_person' => 'integer',
        ];
    }

    public function days()
    {
        return $this->hasMany(TravelPlanDay::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
