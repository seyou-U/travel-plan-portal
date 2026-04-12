<?php

namespace App\Enums;

enum PrefectureCode: string
{
    case HOKKAIDO = '01';
    case AOMORI = '02';
    case IWATE = '03';
    case MIYAGI = '04';
    case AKITA = '05';
    case YAMAGATA = '06';
    case FUKUSHIMA = '07';
    case IBARAKI = '08';
    case TOCHIGI = '09';
    case GUNMA = '10';
    case SAITAMA = '11';
    case CHIBA = '12';
    case TOKYO = '13';
    case KANAGAWA = '14';
    case NIIGATA = '15';
    case TOYAMA = '16';
    case ISHIKAWA = '17';
    case FUKUI = '18';
    case YAMANASHI = '19';
    case NAGANO = '20';
    case GIFU = '21';
    case SHIZUOKA = '22';
    case AICHI = '23';
    case MIE = '24';
    case SHIGA = '25';
    case KYOTO = '26';
    case OSAKA = '27';
    case HYOGO = '28';
    case NARA = '29';
    case WAKAYAMA = '30';
    case TOTTORI = '31';
    case SHIMANE = '32';
    case OKAYAMA = '33';
    case HIROSHIMA = '34';
    case YAMAGUCHI = '35';
    case TOKUSHIMA = '36';
    case KAGAWA = '37';
    case EHIME = '38';
    case KOCHI = '39';
    case FUKUOKA = '40';
    case SAGA = '41';
    case NAGASAKI = '42';
    case KUMAMOTO = '43';
    case OITA = '44';
    case MIYAZAKI = '45';
    case KAGOSHIMA = '46';
    case OKINAWA = '47';

    public function label(): string
    {
        return match ($this) {
            self::HOKKAIDO => '北海道',
            self::AOMORI => '青森県',
            self::IWATE => '岩手県',
            self::MIYAGI => '宮城県',
            self::AKITA => '秋田県',
            self::YAMAGATA => '山形県',
            self::FUKUSHIMA => '福島県',
            self::IBARAKI => '茨城県',
            self::TOCHIGI => '栃木県',
            self::GUNMA => '群馬県',
            self::SAITAMA => '埼玉県',
            self::CHIBA => '千葉県',
            self::TOKYO => '東京都',
            self::KANAGAWA => '神奈川県',
            self::NIIGATA => '新潟県',
            self::TOYAMA => '富山県',
            self::ISHIKAWA => '石川県',
            self::FUKUI => '福井県',
            self::YAMANASHI => '山梨県',
            self::NAGANO => '長野県',
            self::GIFU => '岐阜県',
            self::SHIZUOKA => '静岡県',
            self::AICHI => '愛知県',
            self::MIE => '三重県',
            self::SHIGA => '滋賀県',
            self::KYOTO => '京都府',
            self::OSAKA => '大阪府',
            self::HYOGO => '兵庫県',
            self::NARA => '奈良県',
            self::WAKAYAMA => '和歌山県',
            self::TOTTORI => '鳥取県',
            self::SHIMANE => '島根県',
            self::OKAYAMA => '岡山県',
            self::HIROSHIMA => '広島県',
            self::YAMAGUCHI => '山口県',
            self::TOKUSHIMA => '徳島県',
            self::KAGAWA => '香川県',
            self::EHIME => '愛媛県',
            self::KOCHI => '高知県',
            self::FUKUOKA => '福岡県',
            self::SAGA => '佐賀県',
            self::NAGASAKI => '長崎県',
            self::KUMAMOTO => '熊本県',
            self::OITA => '大分県',
            self::MIYAZAKI => '宮崎県',
            self::KAGOSHIMA => '鹿児島県',
            self::OKINAWA => '沖縄県',
        };
    }

    public static function fromCode(?string $code): ?self
    {
        if ($code === null) {
            return null;
        }

        $normalizedCode = str_pad(trim($code), 2, '0', STR_PAD_LEFT);

        return self::tryFrom($normalizedCode);
    }

    public static function labelFromCode(?string $code): ?string
    {
        return self::fromCode($code)?->label();
    }
}
