<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_customer(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Siti',
            'email' => 'siti@example.com',
            'phone' => '08987654321',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()->assertJsonPath('user.role', 'customer');
        $this->assertDatabaseHas('users', ['email' => 'siti@example.com', 'phone' => '08987654321']);
    }

    public function test_register_cannot_choose_role(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Nakal',
            'email' => 'nakal@example.com',
            'role' => 'admin',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'nakal@example.com', 'role' => 'customer']);
    }

    public function test_user_can_login(): void
    {
        User::create([
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'budi@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonStructure(['token']);
    }

    public function test_me_requires_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }
}