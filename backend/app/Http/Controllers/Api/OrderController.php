<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with('items.service')->latest();

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        return $query->paginate(10);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        abort_if(
            $user->role === 'customer' && $order->customer_id !== $user->id,
            403,
            'Anda tidak punya akses ke order ini.'
        );

        return $order->load('items.service', 'statusLogs');
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $isStaff = in_array($user->role, ['admin', 'cashier'], true);

        $data = $request->validate([
            'customer_id' => $isStaff ? ['required', 'exists:users,id'] : ['prohibited'],
            'pickup_type' => ['required', Rule::in(['walk_in', 'pickup'])],
            'address' => ['required_if:pickup_type,pickup', 'nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer', 'exists:services,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.1', 'max:1000'],
        ]);

        $services = Service::whereIn('id', collect($data['items'])->pluck('service_id'))
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        foreach ($data['items'] as $index => $item) {
            $service = $services->get($item['service_id']);

            if (! $service) {
                throw ValidationException::withMessages([
                    "items.$index.service_id" => ['Layanan tidak tersedia.'],
                ]);
            }

            if ($service->pricing_type === 'per_item' && floor($item['quantity']) != $item['quantity']) {
                throw ValidationException::withMessages([
                    "items.$index.quantity" => ['Layanan satuan harus berupa bilangan bulat.'],
                ]);
            }
        }

        $order = DB::transaction(function () use ($data, $services, $user, $isStaff) {
            $order = Order::create([
                'code' => $this->generateCode(),
                'customer_id' => $isStaff ? $data['customer_id'] : $user->id,
                'status' => OrderStatus::Received,
                'pickup_type' => $data['pickup_type'],
                'address' => $data['address'] ?? null,
                'total_price' => 0,
            ]);

            $total = 0;

            foreach ($data['items'] as $item) {
                $service = $services->get($item['service_id']);
                $subtotal = (int) round($item['quantity'] * $service->price);

                $order->items()->create([
                    'service_id' => $service->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $service->price,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $order->update(['total_price' => $total]);

            $order->statusLogs()->create([
                'from_status' => null,
                'to_status' => OrderStatus::Received,
                'changed_by' => $user->id,
            ]);

            return $order;
        });

        return response()->json($order->load('items.service'), 201);
    }

    public function advance(Request $request, Order $order)
    {
        $next = $order->status->next();

        if (! $next) {
            throw ValidationException::withMessages([
                'status' => ['Order sudah selesai dan tidak bisa diubah lagi.'],
            ]);
        }

        DB::transaction(function () use ($order, $next, $request) {
            $from = $order->status;

            $order->update(['status' => $next]);

            $order->statusLogs()->create([
                'from_status' => $from,
                'to_status' => $next,
                'changed_by' => $request->user()->id,
            ]);
        });

        return $order->fresh()->load('items.service');
    }

    public function track(string $code)
    {
        $order = Order::where('code', $code)->firstOrFail();

        return response()->json([
            'code' => $order->code,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'timeline' => $order->statusLogs()->orderBy('id')->get()->map(fn ($log) => [
                'status' => $log->to_status->value,
                'label' => $log->to_status->label(),
                'at' => $log->created_at,
            ]),
        ]);
    }

    private function generateCode(): string
    {
        do {
            $code = 'LDR-' . now()->format('ymd') . '-' . strtoupper(Str::random(4));
        } while (Order::where('code', $code)->exists());

        return $code;
    }
}