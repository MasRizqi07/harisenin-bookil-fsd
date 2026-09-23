<?php

declare(strict_types=1);

namespace Tests\Feature\Actions;

use App\Actions\Orders\CreateOrderAction;
use App\Enums\OrderStatus;
use App\Exceptions\ProductUnavailableException;
use App\Models\Product;
use App\Models\User;
use InvalidArgumentException;

it('creates an order with server-calculated totals and order items', function (): void {
    $user = User::factory()->create();
    $product1 = Product::factory()->create([
        'price' => '150000.00',
        'is_published' => true,
    ]);
    $product2 = Product::factory()->create([
        'price' => '250000.00',
        'is_published' => true,
    ]);

    $action = app(CreateOrderAction::class);
    $order = $action->execute($user, [
        ['product_id' => $product1->id],
        ['product_id' => $product2->id],
    ], 'Customer notes');

    expect($order->user_id)->toBe($user->id)
        ->and($order->total_amount)->toBe('400000.00')
        ->and($order->status)->toBe(OrderStatus::PENDING)
        ->and($order->notes)->toBe('Customer notes')
        ->and($order->order_number)->toStartWith('ORD-')
        ->and($order->items)->toHaveCount(2);

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'order_number' => $order->order_number,
        'total_amount' => '400000.00',
        'status' => 'pending',
    ]);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product1->id,
        'price' => '150000.00',
    ]);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product2->id,
        'price' => '250000.00',
    ]);
});

it('accepts a simple array of product id integers', function (): void {
    $user = User::factory()->create();
    $product = Product::factory()->create([
        'price' => '99000.00',
        'is_published' => true,
    ]);

    $action = app(CreateOrderAction::class);
    $order = $action->execute($user, [$product->id]);

    expect($order->total_amount)->toBe('99000.00')
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->product_id)->toBe($product->id);
});

it('deduplicates items if the same product is sent multiple times', function (): void {
    $user = User::factory()->create();
    $product = Product::factory()->create([
        'price' => '50000.00',
        'is_published' => true,
    ]);

    $action = app(CreateOrderAction::class);
    $order = $action->execute($user, [$product->id, $product->id]);

    expect($order->items)->toHaveCount(1)
        ->and($order->total_amount)->toBe('50000.00');
});

it('rejects order creation if any product is unpublished', function (): void {
    $user = User::factory()->create();
    $publishedProduct = Product::factory()->create(['is_published' => true]);
    $unpublishedProduct = Product::factory()->create(['is_published' => false]);

    $action = app(CreateOrderAction::class);

    expect(fn() => $action->execute($user, [$publishedProduct->id, $unpublishedProduct->id]))
        ->toThrow(ProductUnavailableException::class);
});

it('rejects order creation if any product does not exist', function (): void {
    $user = User::factory()->create();

    $action = app(CreateOrderAction::class);

    expect(fn() => $action->execute($user, [999999]))
        ->toThrow(ProductUnavailableException::class);
});

it('rejects order creation with empty items', function (): void {
    $user = User::factory()->create();
    $action = app(CreateOrderAction::class);

    expect(fn() => $action->execute($user, []))
        ->toThrow(InvalidArgumentException::class);
});

