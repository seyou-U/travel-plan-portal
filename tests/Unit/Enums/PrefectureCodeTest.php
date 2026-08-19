<?php

namespace Tests\Unit\Enums;

use App\Enums\PrefectureCode;
use PHPUnit\Framework\TestCase;

class PrefectureCodeTest extends TestCase
{
    public function test_enum_defines_all_47_prefecture_codes_and_labels(): void
    {
        $this->assertCount(47, PrefectureCode::cases());
        $this->assertSame('01', PrefectureCode::HOKKAIDO->value);
        $this->assertSame('北海道', PrefectureCode::HOKKAIDO->label());
        $this->assertSame('26', PrefectureCode::KYOTO->value);
        $this->assertSame('京都府', PrefectureCode::KYOTO->label());
        $this->assertSame('47', PrefectureCode::OKINAWA->value);
        $this->assertSame('沖縄県', PrefectureCode::OKINAWA->label());
        $this->assertSame(
            array_map(
                static fn (int $code): string => str_pad((string) $code, 2, '0', STR_PAD_LEFT),
                range(1, 47),
            ),
            PrefectureCode::values(),
        );
    }
}
