<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('displays orders list on admin order index with filtering', function (): void {
    $admin = User::factory()->admin()->create();

    $paidOrder = Order::factory()->create([
        'order_number' => 'BK-PAID-001',
        'status' => OrderStatus::PAID,
    ]);

    $pendingOrder = Order::factory()->create([
        'order_number' => 'BK-PENDING-002',
        'status' => OrderStatus::PENDING,
    ]);

    $response = $this->actingAs($admin)->get('/admin/orders?status=paid');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Admin/Orders/Index')
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $paidOrder->id)
    );
});

it('displays order detail and payment audit ledger for admin', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $order = Order::factory()->create([
        'order_number' => 'BK-AUDIT-999',
        'status' => OrderStatus::PAID,
    ]);

    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    $payment = Payment::create([
        'order_id' => $order->id,
        'external_transaction_id' => 'MIDTRANS-TX-9999',
        'payment_type' => 'qris',
        'gross_amount' => $order->total_amount,
        'transaction_status' => 'settlement',
        'raw_response' => ['status_code' => '200', 'transaction_status' => 'settlement'],
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get("/admin/orders/{$order->id}");

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Admin/Orders/Show')
            ->where('order.id', $order->id)
            ->where('order.order_number', 'BK-AUDIT-999')
            ->has('order.items', 1)
            ->has('order.payments', 1)
            ->where('order.payments.0.external_transaction_id', 'MIDTRANS-TX-9999')
    );
});
