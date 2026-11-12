<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::where('is_active', true)->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $service = Service::create($this->validated($request));

        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service)
    {
        $service->update($this->validated($request));

        return $service;
    }

    public function destroy(Service $service)
    {
        
        $service->update(['is_active' => false]);

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'pricing_type' => ['required', Rule::in(['per_kg', 'per_item'])],
            'price' => ['required', 'integer', 'min:0'],
            'estimated_hours' => ['required', 'integer', 'min:1', 'max:1000'],
            'is_active' => ['boolean'],
        ]);
    }
}