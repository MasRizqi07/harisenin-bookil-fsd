<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config()->set('services.midtrans.server_key', 'mock-server-key-test');
    config()->set('services.midtrans.is_production', false);
});

it('requires authentication to checkout', function (): void {
    $product = Product::factory()->create(['is_published' => true]);

    $response = $this->post('/checkout', [
        'product_id' => $product->id,
    ]);

    $response->assertRedirect('/login');
});

it('validates product_id is required and must exist', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/checkout', [
        'product_id' => 999999,
    ]);

    $response->assertSessionHasErrors(['product_id']);
});

it('rejects checkout of an unpublished product', function (): void {
    $user = User::factory()->create();
    $unpublishedProduct = Product::factory()->create(['is_published' => false]);

    $response = $this->actingAs($user)->post('/checkout', [
        'product_id' => $unpublishedProduct->id,
    ]);

    $response->assertSessionHasErrors(['product_id']);
});

it('creates an order and retrieves snap token from midtrans', function (): void {
    $user = User::factory()->create();
    $product = Product::factory()->create([
        'title' => 'Laravel Concurrency',
        'price' => '120000.00',
        'is_published' => true,
    ]);

    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
            'token' => 'mock-snap-token-abc123xyz',
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-snap-token-abc123xyz',
        ], 200),
    ]);

    $response = $this->actingAs($user)->post('/checkout', [
        'product_id' => $product->id,
        'notes' => 'Please hurry',
    ]);

    $order = Order::query()->where('user_id', $user->id)->first();
    expect($order)->not->toBeNull()
        ->and($order->total_amount)->toBe('120000.00')
        ->and($order->notes)->toBe('Please hurry');

    $response->assertRedirect(route('orders.show', $order->order_number));
    $response->assertSessionHas('snap_token', 'mock-snap-token-abc123xyz');
});

it('allows customer to view their order invoice', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->pending()->create(['total_amount' => '100000.00']);

    $response = $this->actingAs($user)->get("/orders/{$order->order_number}");

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Orders/Show')
            ->where('order.id', $order->id)
            ->where('order.order_number', $order->order_number)
    );
});

it('forbids customers from viewing orders belonging to another user', function (): void {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $order = Order::factory()->for($owner)->create();

    $response = $this->actingAs($stranger)->get("/orders/{$order->order_number}");

    $response->assertForbidden();
});
