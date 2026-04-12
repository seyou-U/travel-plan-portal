<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TravelPlanItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'travel_plan_day_id',
        'spot_id',
        'title',
        'spot_name',
        'start_time',
        'stay_minutes',
        'transportation_type',
        'travel_minutes',
        'transportation_cost',
        'visit_cost',
        'memo',
    ];

    protected function casts(): array
    {
        return [
            'spot_id' => 'integer',
            'start_time' => 'datetime:H:i',
            'stay_minutes' => 'integer',
            'transportation_type' => 'integer',
            'travel_minutes' => 'integer',
            'transportation_cost' => 'integer',
            'visit_cost' => 'integer',
        ];
    }

    public function travelPlanDay(): BelongsTo
    {
        return $this->belongsTo(TravelPlanDay::class);
    }

    public function spot(): BelongsTo
    {
        return $this->belongsTo(Spot::class);
    }
}
