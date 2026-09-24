<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects unauthenticated guests away from admin dashboard', function (): void {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/login');
});

it('forbids normal customers from accessing admin dashboard with 403', function (): void {
    $customer = User::factory()->create();

    $response = $this->actingAs($customer)->get('/admin/dashboard');

    $response->assertForbidden();
});

it('allows admin users to view executive dashboard with analytics and ledger', function (): void {
    $admin = User::factory()->admin()->create();

    $product = Product::factory()->create(['price' => '150000.00', 'is_published' => true]);

    $paidOrder = Order::factory()->create([
        'total_amount' => '150000.00',
        'status' => OrderStatus::PAID,
    ]);

    OrderItem::factory()->create([
        'order_id' => $paidOrder->id,
        'product_id' => $product->id,
        'price' => '150000.00',
    ]);

    $response = $this->actingAs($admin)->get('/admin/dashboard');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('metrics')
            ->where('metrics.paid_orders_count', 1)
            ->has('recentTransactions', 1)
            ->has('topProducts')
    );
});

it('streams a sales CSV report for administrator', function (): void {
    $admin = User::factory()->admin()->create();

    $order = Order::factory()->create([
        'total_amount' => '250000.00',
        'status' => OrderStatus::PAID,
    ]);

    $response = $this->actingAs($admin)->get('/admin/export/csv');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain($order->order_number);
});
