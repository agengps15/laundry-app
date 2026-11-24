<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use PHPUnit\Framework\TestCase;

class OrderStatusTest extends TestCase
{
    public function test_status_moves_one_step_forward(): void
    {
        $this->assertSame(OrderStatus::Washing, OrderStatus::Received->next());
        $this->assertSame(OrderStatus::Completed, OrderStatus::Ready->next());
    }

    public function test_completed_has_no_next_status(): void
    {
        $this->assertNull(OrderStatus::Completed->next());
    }

    public function test_every_status_has_an_indonesian_label(): void
    {
        foreach (OrderStatus::cases() as $status) {
            $this->assertNotSame('', $status->label());
        }
    }
}