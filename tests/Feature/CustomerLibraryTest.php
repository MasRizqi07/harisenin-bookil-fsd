<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects unauthenticated users from personal library dashboard', function (): void {
    $this->get('/dashboard')->assertRedirect('/login');
    $this->get('/library')->assertRedirect('/login');
});

it('displays customer personal digital library with active tokens and order history', function (): void {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();

    $productA = Product::factory()->create(['title' => 'My Purchased Book']);
    $productB = Product::factory()->create(['title' => 'Other Person Book']);

    // Customer's paid order
    $customerPaidOrder = Order::factory()->create([
        'user_id' => $customer->id,
        'status' => OrderStatus::PAID,
    ]);
    $itemA = OrderItem::factory()->create([
        'order_id' => $customerPaidOrder->id,
        'product_id' => $productA->id,
    ]);
    DownloadToken::factory()->create([
        'order_item_id' => $itemA->id,
        'token' => 'token-customer-a',
        'download_count' => 1,
        'max_downloads' => 5,
        'expires_at' => now()->addDays(7),
    ]);

    // Customer's pending order
    Order::factory()->create([
        'user_id' => $customer->id,
        'status' => OrderStatus::PENDING,
    ]);

    // Other customer's paid order
    $otherOrder = Order::factory()->create([
        'user_id' => $otherCustomer->id,
        'status' => OrderStatus::PAID,
    ]);
    $otherItem = OrderItem::factory()->create([
        'order_id' => $otherOrder->id,
        'product_id' => $productB->id,
    ]);
    DownloadToken::factory()->create([
        'order_item_id' => $otherItem->id,
        'token' => 'token-other-customer',
    ]);

    $response = $this->actingAs($customer)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(
        fn(Assert $page) => $page
            ->component('Dashboard')
            ->has('library', 1)
            ->where('library.0.product_id', $productA->id)
            ->where('library.0.download_token.token', 'token-customer-a')
            ->has('orders.data', 2)
            ->where('stats.total_books', 1)
            ->where('stats.total_orders', 2)
            ->where('stats.active_downloads', 1)
    );
});
