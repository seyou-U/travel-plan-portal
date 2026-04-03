<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TravelPlanDay extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'travel_plan_id',
        'day_number',
        'prefecture_code',
        'date',
    ];

    protected function casts()
    {
        return [
            'day_number' => 'integer',
            'date' => 'date',
        ];
    }

    public function travelPlan(): BelongsTo
    {
        return $this->belongsTo(TravelPlan::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TravelPlanItem::class);
    }
}
