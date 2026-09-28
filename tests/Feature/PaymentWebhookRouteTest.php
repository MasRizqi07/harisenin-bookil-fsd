<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Events\OrderPaidEvent;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    config()->set('services.midtrans.server_key', 'test-webhook-secret-key-456');
});

// A status API outage must leave an order pending and return a failure so Midtrans retries.
it('returns a retryable error without recording payment when the status API is unavailable', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '100000.00']);
    $payload = [
        'order_id' => $order->order_number, 'status_code' => '200', 'gross_amount' => '100000.00',
        'transaction_status' => 'settlement', 'transaction_id' => 'tx-outage', 'payment_type' => 'qris',
        'signature_key' => hash('sha512', $order->order_number.'200100000.00'.config('services.midtrans.server_key')),
    ];
    Event::fake([OrderPaidEvent::class]);
    Http::fake(['*' => Http::response([], 500)]);

    $this->postJson('/webhooks/midtrans', $payload)->assertStatus(500);
    $this->assertDatabaseCount('payments', 0);
    $this->assertDatabaseCount('webhook_notifications', 0);
    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
    Event::assertNotDispatched(OrderPaidEvent::class);
    fwrite(STDOUT, "WEBHOOK_HTTP=500 PAYMENT_ROWS=0 WEBHOOK_ROWS=0 ORDER_STATUS=pending\n");
});

it('processes a valid midtrans webhook via POST without CSRF verification', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '250000.00']);
    $product = Product::factory()->create(['price' => '250000.00']);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'price' => '250000.00',
    ]);

    $serverKey = (string) config('services.midtrans.server_key');
    $statusCode = '200';
    $grossAmount = '250000.00';
    $signature = hash('sha512', $order->order_number.$statusCode.$grossAmount.$serverKey);

    $payload = [
        'order_id' => $order->order_number,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'transaction_id' => 'tx-live-987654',
        'payment_type' => 'bca_va',
        'settlement_time' => now()->toDateTimeString(),
    ];
    Http::fake(['https://api.sandbox.midtrans.com/v2/'.$order->order_number.'/status' => Http::response($payload)]);

    $response = $this->postJson('/webhooks/midtrans', $payload);

    $response->assertOk()
        ->assertJson(['status' => 'ok']);

    expect($order->refresh()->status)->toBe(OrderStatus::PAID)
        ->and($order->payment_method)->toBe('bca_va');

    $this->assertDatabaseHas('download_tokens', [
        'order_item_id' => $orderItem->id,
        'download_count' => 0,
        'max_downloads' => 5,
    ]);
});

it('rejects midtrans webhooks with an invalid signature with 401', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '100000.00']);

    $payload = [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '100000.00',
        'signature_key' => 'fake_spoofed_signature_string',
        'transaction_status' => 'settlement',
        'transaction_id' => 'tx-invalid-1',
        'payment_type' => 'qris',
    ];

    $response = $this->postJson('/webhooks/midtrans', $payload);

    $response->assertStatus(401);
    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
});

it('handles duplicate webhook notifications idempotently with HTTP 200', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '150000.00']);

    $serverKey = (string) config('services.midtrans.server_key');
    $statusCode = '200';
    $grossAmount = '150000.00';
    $signature = hash('sha512', $order->order_number.$statusCode.$grossAmount.$serverKey);

    $payload = [
        'order_id' => $order->order_number,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => 'settlement',
        'transaction_id' => 'tx-repeat-123',
        'payment_type' => 'gopay',
    ];
    Http::fake(['https://api.sandbox.midtrans.com/v2/'.$order->order_number.'/status' => Http::response($payload)]);

    // First delivery
    $this->postJson('/webhooks/midtrans', $payload)->assertOk();
    expect($order->refresh()->status)->toBe(OrderStatus::PAID);

    // Duplicate delivery
    $response = $this->postJson('/webhooks/midtrans', $payload);
    $response->assertOk()
        ->assertJson(['status' => 'ok']);
});
