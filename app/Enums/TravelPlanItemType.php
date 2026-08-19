<?php

declare(strict_types=1);

namespace App\Enums;

enum TravelPlanItemType: string
{
    case Spot = 'spot';
    case Meal = 'meal';
    case Hotel = 'hotel';
    case Transport = 'transport';
}
