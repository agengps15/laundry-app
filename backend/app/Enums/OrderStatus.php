<?php

namespace App\Enums;

enum OrderStatus:string
{
    case Received = 'received';
    case Washing = 'washing';
    case Ironing = 'ironing';
    case Ready = 'ready';
    case Completed = 'completed';

    public function next(): ?self
    {
        return match ($this) {
            self::Received => self::Washing,
            self::Washing => self::Ironing,
            self::Ironing => self::Ready,
            self::Ready => self::Completed,
            self::Completed => null,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Received => 'Diterima',
            self::Washing => 'Dicuci',
            self::Ironing => 'Disetrika',
            self::Ready => 'Siap diambil/diantar',
            self::Completed => 'Selesai',
        };
    }
}
