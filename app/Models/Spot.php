<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Spot extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'prefecture_code',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'prefecture_code' => 'string',
        ];
    }

    public function travelPlanItems(): HasMany
    {
        return $this->hasMany(TravelPlanItem::class);
    }
}
