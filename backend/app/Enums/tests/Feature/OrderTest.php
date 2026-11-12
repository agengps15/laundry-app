<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role, string $email = null): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $email ?? $role . '@example.com',
            'password' => Hash::make('password123'),
            'role' => $role,
        ]);
    }

    private function kiloan(): Service
    {
        return Service::create(['name' => 'Cuci Kiloan', 'pricing_type' => 'per_kg', 'price' => 7000, 'estimated_hours' => 48]);
    }

    private function bedCover(): Service
    {
        return Service::create(['name' => 'Bed Cover', 'pricing_type' => 'per_item', 'price' => 35000, 'estimated_hours' => 72]);
    }

    private function orderFor(User $customer, OrderStatus $status = OrderStatus::Received): Order
    {
        return Order::create([
            'code' => 'LDR-TEST-' . $customer->id . $status->value,
            'customer_id' => $customer->id,
            'status' => $status,
            'pickup_type' => 'walk_in',
        ]);
    }

    public function test_customer_can_create_order_with_server_side_price(): void
    {
        Sanctum::actingAs($this->userWithRole('customer'));

        $this->postJson('/api/orders', [
            'pickup_type' => 'walk_in',
            'items' => [
                ['service_id' => $this->kiloan()->id, 'quantity' => 2.5],
                ['service_id' => $this->bedCover()->id, 'quantity' => 1],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('total_price', 52500)
            ->assertJsonPath('status', 'received');

        $this->assertDatabaseCount('order_status_logs', 1);
    }

    public function test_pickup_order_requires_address(): void
    {
        Sanctum::actingAs($this->userWithRole('customer'));

        $this->postJson('/api/orders', [
            'pickup_type' => 'pickup',
            'items' => [['service_id' => $this->kiloan()->id, 'quantity' => 1]],
        ])->assertUnprocessable();
    }

    public function test_per_item_service_rejects_fractional_quantity(): void
    {
        Sanctum::actingAs($this->userWithRole('customer'));

        $this->postJson('/api/orders', [
            'pickup_type' => 'walk_in',
            'items' => [['service_id' => $this->bedCover()->id, 'quantity' => 1.5]],
        ])->assertUnprocessable();
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        $owner = $this->userWithRole('customer', 'a@example.com');
        $other = $this->userWithRole('customer', 'b@example.com');
        $order = $this->orderFor($owner);

        Sanctum::actingAs($other);

        $this->getJson('/api/orders/' . $order->id)->assertForbidden();
    }

    public function test_cashier_can_advance_status_one_step(): void
    {
        $order = $this->orderFor($this->userWithRole('customer'));
        Sanctum::actingAs($this->userWithRole('cashier'));

        $this->patchJson("/api/orders/{$order->id}/advance")
            ->assertOk()
            ->assertJsonPath('status', 'washing');

        $this->assertDatabaseHas('order_status_logs', [
            'order_id' => $order->id,
            'from_status' => 'received',
            'to_status' => 'washing',
        ]);
    }

    public function test_completed_order_cannot_advance(): void
    {
        $order = $this->orderFor($this->userWithRole('customer'), OrderStatus::Completed);
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->patchJson("/api/orders/{$order->id}/advance")->assertUnprocessable();
    }

    public function test_customer_cannot_advance_status(): void
    {
        $customer = $this->userWithRole('customer');
        $order = $this->orderFor($customer);
        Sanctum::actingAs($customer);

        $this->patchJson("/api/orders/{$order->id}/advance")->assertForbidden();
    }

    public function test_public_tracking_hides_personal_data(): void
    {
        $order = $this->orderFor($this->userWithRole('customer'));

        $this->getJson('/api/track/' . $order->code)
            ->assertOk()
            ->assertJsonPath('status_label', 'Diterima')
            ->assertJsonMissingPath('customer_id')
            ->assertJsonMissingPath('total_price');
    }
}