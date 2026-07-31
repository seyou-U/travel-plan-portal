<?php

namespace App\Contracts\Ai;

interface TravelPlanGenerator
{
    /**
     * AI旅程生成依頼の条件から旅程結果を生成する。
     *
     * @param  array<string, mixed>  $requestPayload
     * @return array<string, mixed>
     */
    public function generate(array $requestPayload): array;
}
