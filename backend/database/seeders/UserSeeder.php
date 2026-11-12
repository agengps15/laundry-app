<?php

namespace Database\Seeders;

use App\Models\User;    
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [

            ['name' => 'Admin Laundry', 'email' => 'admin@laundry.test', 'phone' => '081200000001', 'role' => 'admin'],
            ['name' => 'Kasir Laundry', 'email' => 'kasir@laundry.test', 'phone' => '081200000002', 'role' => 'cashier'],
            ['name' => 'Kurir Laundry', 'email' => 'kurir@laundry.test', 'phone' => '081200000003', 'role' => 'courier'],
            ['name' => 'Pelanggan Demo', 'email' => 'pelanggan@laundry.test', 'phone' => '081200000004', 'role' => 'customer'],
  
        ];

        foreach($users as $user){
            User::updateOrCreate(
                ['email' => $user ['email']],
                $user + ['password' => Hash::make('password')]
            );
        }
    }
}
