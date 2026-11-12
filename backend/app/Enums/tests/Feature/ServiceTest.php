<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceTest extends TestCase
{
    use RefreshDatabase;

    private array $payload = [
        'name' => 'Cuci Sepatu',
        'pricing_type' => 'per_item',
        'price' => 25000,
        'estimated_hours' => 24,
    ];

    private function userWithRole(string $role): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $role . '@example.com',
            'password' => Hash::make('password123'),
            'role' => $role,
        ]);
    }

    public function test_guest_can_list_only_active_services(): void
    {
        Service::create($this->payload + ['is_active' => true]);
        Service::create(['name' => 'Lama', 'pricing_type' => 'per_kg', 'price' => 1000, 'estimated_hours' => 24, 'is_active' => false]);

        $this->getJson('/api/services')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Cuci Sepatu');
    }

    public function test_guest_cannot_create_service(): void
    {
        $this->postJson('/api/services', $this->payload)->assertUnauthorized();
    }

    public function test_customer_cannot_create_service(): void
    {
        Sanctum::actingAs($this->userWithRole('customer'));

        $this->postJson('/api/services', $this->payload)->assertForbidden();
    }

    public function test_admin_can_create_service(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->postJson('/api/services', $this->payload)->assertCreated();
        $this->assertDatabaseHas('services', ['name' => 'Cuci Sepatu']);
    }

    public function test_admin_can_deactivate_service(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));
        $service = Service::create($this->payload);

        $this->deleteJson('/api/services/' . $service->id)->assertNoContent();
        $this->assertDatabaseHas('services', ['id' => $service->id, 'is_active' => false]);
    }

    public function test_invalid_pricing_type_is_rejected(): void
    {
        Sanctum::actingAs($this->userWithRole('admin'));

        $this->postJson('/api/services', ['pricing_type' => 'per_meter'] + $this->payload)
            ->assertUnprocessable();
    }
}