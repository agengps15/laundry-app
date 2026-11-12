<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            ['name' => 'Cuci Kiloan', 'pricing_type' => 'per_kg', 'price' => 7000, 'estimated_hours' => 48],
            ['name' => 'Cuci Setrika Kiloan', 'pricing_type' => 'per_kg', 'price' => 9000, 'estimated_hours' => 48],
            ['name' => 'Express 6 jam', 'pricing_type' => 'per_kg', 'price' => 1200, 'estimated_hours' => 8],
            ['name' => 'Bed Cover', 'pricing_type' => 'per_item', 'price' => 1500, 'estimated_hours' => 4],
            ['name' => 'Jas', 'pricing_type' => 'per_item','price' => 1800, 'estimated_hours' => 2],
        ];

        foreach($services as $service){
            Service::updateOrCreate(['name' => $service['name']], $service);
        }
    }
}
