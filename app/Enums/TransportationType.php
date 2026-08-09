<?php

declare(strict_types=1);

namespace App\Enums;

enum TransportationType: string
{
    case Walk = 'walk';
    case Train = 'train';
    case Bus = 'bus';
    case Car = 'car';
    case Taxi = 'taxi';
    case Plane = 'plane';
    case Bicycle = 'bicycle';
    case Other = 'other';
}
