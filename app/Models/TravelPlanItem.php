<?php

namespace App\Models;

use App\Enums\TransportationType;
use App\Enums\TravelPlanItemType;
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
        'sort_order',
        'title',
        'spot_name',
        'start_time',
        'stay_minutes',
        'transportation_type',
        'travel_minutes',
        'transportation_cost',
        'visit_cost',
        'memo',
        'item_type',
    ];

    protected function casts(): array
    {
        return [
            'spot_id' => 'integer',
            'sort_order' => 'integer',
            'start_time' => 'datetime:H:i',
            'stay_minutes' => 'integer',
            'transportation_type' => TransportationType::class,
            'travel_minutes' => 'integer',
            'transportation_cost' => 'integer',
            'visit_cost' => 'integer',
            'item_type' => TravelPlanItemType::class,
        ];
    }

    /**
     * @return BelongsTo<TravelPlanDay, $this>
     */
    public function travelPlanDay(): BelongsTo
    {
        return $this->belongsTo(TravelPlanDay::class);
    }

    /**
     * @return BelongsTo<Spot, $this>
     */
    public function spot(): BelongsTo
    {
        return $this->belongsTo(Spot::class);
    }
}
