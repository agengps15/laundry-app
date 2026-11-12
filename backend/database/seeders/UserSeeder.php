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
            ['name' => 'Admin Laundry', 'email' => 'admin@laundry.test', 'phone' => '08323333888', 'role' => 'admin'],
            ['name' => 'Kasir Laundry', 'email' => 'kasir@laundry.test', 'phone' => '08323232388', 'role' => 'kasir'],
            ['name' => 'Kurir Laundry', 'email' => 'kurir@laundry.test', 'phone' => '08323288833', 'role' => 'kurir'],
            ['name' => 'Pelanggan Demo', 'email' => 'pelanggan@laundry.test', 'phone' => '083232777744', 'role' => 'pelanggan'],    
        ];

        foreach($users as $user){
            User::updateOrCreate(
                ['email' => $user ['email']],
                $user + ['password' => Hash::make('password')]
            );
        }
    }
}
