<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Events\OrderPaidEvent;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;

/** @return array<string, string> */
function bookilReconcilePayload(Order $order, string $amount = '100000.00'): array
{
    return [
        'order_id' => $order->order_number, 'transaction_id' => 'reconcile-transaction',
        'transaction_status' => 'settlement', 'gross_amount' => $amount, 'status_code' => '200', 'payment_type' => 'qris',
        'signature_key' => hash('sha512', $order->order_number.'200'.$amount.'reconcile-test-key'),
    ];
}

beforeEach(function (): void {
    config()->set('services.midtrans.server_key', 'reconcile-test-key');
    config()->set('services.midtrans.is_production', false);
    Http::preventStrayRequests();
    Event::fake([OrderPaidEvent::class]);
});

// A missed notification must be recoverable without creating a second payment or paid event on retry.
it('reconciles a pending order and treats a repeat reconciliation as a no-op', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '100000.00']);
    Http::fake(['*' => Http::response(bookilReconcilePayload($order))]);
    $this->artisan('bookil:reconcile', ['order_number' => $order->order_number])
        ->expectsOutput($order->order_number.': pending -> paid')->assertSuccessful();
    $this->artisan('bookil:reconcile', ['order_number' => $order->order_number])
        ->expectsOutput($order->order_number.': paid -> paid')->assertSuccessful();
    expect($order->refresh()->status)->toBe(OrderStatus::PAID);
    $this->assertDatabaseCount('payments', 1);
    $this->assertDatabaseCount('webhook_notifications', 1);
    Event::assertDispatchedTimes(OrderPaidEvent::class, 1);
    Http::assertSentCount(3);
    fwrite(STDOUT, "RECONCILE=pending->paid->paid PAYMENTS=1 PAID_EVENTS=1 STATUS_API_REQUESTS=3\n");
});

// A valid gateway signature with the wrong amount must not settle a local order.
it('rejects amount mismatch without recording a payment', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '100000.00']);
    Http::fake(['*' => Http::response(bookilReconcilePayload($order, '1.00'))]);
    $this->artisan('bookil:reconcile', ['order_number' => $order->order_number])
        ->expectsOutput('FAIL reconciliation rejected (PaymentAmountMismatchException).')->assertFailed();
    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
    $this->assertDatabaseCount('payments', 0);
    $this->assertDatabaseCount('webhook_notifications', 0);
    Event::assertNotDispatched(OrderPaidEvent::class);
    fwrite(STDOUT, "RECONCILE_WRONG_AMOUNT_EXIT=1 PAYMENTS=0 ORDER_STATUS=pending\n");
});

// A gateway outage must fail cleanly without altering the customer's pending order.
it('fails cleanly during a Midtrans outage', function (): void {
    $order = Order::factory()->pending()->create();
    Http::fake(['*' => Http::response([], 500)]);
    $this->artisan('bookil:reconcile', ['order_number' => $order->order_number])
        ->expectsOutput('FAIL Midtrans returned an unavailable or invalid order status.')->assertFailed();
    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
    $this->assertDatabaseCount('payments', 0);
    Event::assertNotDispatched(OrderPaidEvent::class);
    fwrite(STDOUT, "RECONCILE_OUTAGE_EXIT=1 PAYMENTS=0 ORDER_STATUS=pending\n");
});

// A response for another order must never mutate that other customer's purchase.
it('rejects a status response identifying a different order', function (): void {
    $requested = Order::factory()->pending()->create();
    $other = Order::factory()->pending()->create(['total_amount' => '100000.00']);
    Http::fake(['*' => Http::response(bookilReconcilePayload($other))]);
    $this->artisan('bookil:reconcile', ['order_number' => $requested->order_number])
        ->expectsOutput('FAIL Midtrans returned an unavailable or invalid order status.')->assertFailed();
    expect($requested->refresh()->status)->toBe(OrderStatus::PENDING)
        ->and($other->refresh()->status)->toBe(OrderStatus::PENDING);
    $this->assertDatabaseCount('payments', 0);
});
