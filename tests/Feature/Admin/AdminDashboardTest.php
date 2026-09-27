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
    OrderItem::factory()->for(Order::factory()->pending())->for($product)->create();

    $response = $this->actingAs($admin)->get('/admin/dashboard');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('metrics')
            ->where('metrics.paid_orders_count', 1)
            ->has('recentTransactions', 2)
            ->has('topProducts')
            ->where('topProducts.0.sales_count', 1)
            ->has('dailyRevenue', 30)
            ->where('dailyRevenue.29.amount', '150000.00')
            ->has('monthlyRevenue', 12)
            ->where('monthlyRevenue.11.amount', '150000.00')
            ->where('orderStatusBreakdown.paid', 1)
            ->where('orderStatusBreakdown.pending', 1)
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

it('streams every order across chunks and neutralizes spreadsheet formulas from customer data', function (): void {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create(['name' => '=HYPERLINK("https://invalid.example")']);
    Order::factory()->count(205)->for($customer)->create();
    foreach (['+SUM(1,1)', '-SUM(1,1)', '@SUM(1,1)', "\t=SUM(1,1)"] as $name) {
        Order::factory()->for(User::factory()->create(['name' => $name]))->create();
    }

    $response = $this->actingAs($admin)->get('/admin/reports/sales/csv');

    $response->assertOk();
    $csv = $response->streamedContent();
    expect(substr_count($csv, "\n"))->toBe(Order::query()->count() + 1)
        ->and($csv)->toContain("'=HYPERLINK")
        ->toContain("'+SUM")
        ->toContain("'-SUM")
        ->toContain("'@SUM")
        ->toContain("'\t=SUM");
});

it('denies every admin route to a customer who knows its URL', function (): void {
    $customer = User::factory()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->create();

    $routes = [
        ['GET', '/admin/dashboard'],
        ['GET', '/admin/reports/sales/csv'],
        ['GET', '/admin/export/csv'],
        ['GET', '/admin/products'],
        ['GET', '/admin/products/create'],
        ['POST', '/admin/products'],
        ['GET', "/admin/products/{$product->id}/edit"],
        ['PUT', "/admin/products/{$product->id}"],
        ['PATCH', "/admin/products/{$product->id}/toggle-publish"],
        ['DELETE', "/admin/products/{$product->id}"],
        ['GET', '/admin/categories'],
        ['POST', '/admin/categories'],
        ['PUT', "/admin/categories/{$product->category_id}"],
        ['DELETE', "/admin/categories/{$product->category_id}"],
        ['GET', '/admin/orders'],
        ['GET', "/admin/orders/{$order->id}"],
    ];

    foreach ($routes as [$method, $uri]) {
        $this->actingAs($customer)->call($method, $uri)->assertForbidden();
    }
});
