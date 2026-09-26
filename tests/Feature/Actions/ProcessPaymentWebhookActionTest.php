<?php

declare(strict_types=1);

namespace Tests\Feature\Actions;

use App\Actions\Payments\ProcessPaymentWebhookAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPaidEvent;
use App\Exceptions\InvalidSignatureException;
use App\Exceptions\InvalidWebhookPayloadException;
use App\Exceptions\PaymentAmountMismatchException;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    config()->set('services.midtrans.server_key', 'mock-midtrans-server-key-123');
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function createWebhookPayload(Order $order, string $status = 'settlement', array $overrides = []): array
{
    $serverKey = (string) config('services.midtrans.server_key');
    $statusCode = '200';
    $grossAmount = (string) $order->total_amount;
    $orderId = $order->order_number;
    $signature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

    $payload = array_merge([
        'order_id' => $orderId,
        'status_code' => $statusCode,
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
        'transaction_status' => $status,
        'transaction_id' => 'tx-midtrans-'.uniqid(),
        'payment_type' => 'credit_card',
        'settlement_time' => now()->toDateTimeString(),
    ], $overrides);

    Http::swap(new Factory);
    Http::fake([
        'https://api.sandbox.midtrans.com/v2/'.$orderId.'/status' => Http::response($payload),
    ]);

    return $payload;
}

it('successfully processes a settlement webhook and updates order to paid', function (): void {
    Event::fake([OrderPaidEvent::class]);

    $order = Order::factory()->pending()->create(['total_amount' => '150000.00']);
    $payload = createWebhookPayload($order, 'settlement');

    $action = app(ProcessPaymentWebhookAction::class);
    $payment = $action->execute($payload);

    expect($order->refresh()->status)->toBe(OrderStatus::PAID)
        ->and($payment)->not->toBeNull()
        ->and($payment->transaction_status)->toBe(PaymentStatus::SETTLEMENT)
        ->and($payment->gross_amount)->toBe('150000.00');

    Event::assertDispatched(OrderPaidEvent::class, fn (OrderPaidEvent $event) => $event->order->id === $order->id);

    $this->assertDatabaseHas('payments', [
        'order_id' => $order->id,
        'external_transaction_id' => $payload['transaction_id'],
        'payment_type' => 'credit_card',
        'transaction_status' => 'settlement',
    ]);
});

it('automatically generates download tokens via listener when order settles', function (): void {
    // We do NOT fake events here to verify the listener actively generates tokens
    $order = Order::factory()->pending()->create(['total_amount' => '100000.00']);
    $product = Product::factory()->create(['price' => '100000.00']);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'price' => '100000.00',
    ]);

    $payload = createWebhookPayload($order, 'settlement');
    $action = app(ProcessPaymentWebhookAction::class);
    $action->execute($payload);

    expect($order->refresh()->status)->toBe(OrderStatus::PAID);

    $this->assertDatabaseHas('download_tokens', [
        'order_item_id' => $orderItem->id,
        'download_count' => 0,
        'max_downloads' => 5,
    ]);
});

it('rejects webhooks with spoofed or invalid signatures', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '75000.00']);
    $payload = createWebhookPayload($order, 'settlement');
    $payload['signature_key'] = 'invalid_spoofed_signature_hash_value';

    $action = app(ProcessPaymentWebhookAction::class);

    expect(fn () => $action->execute($payload))
        ->toThrow(InvalidSignatureException::class);

    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
});

it('is strictly idempotent on repeated settlement webhooks', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '150000.00']);
    $payload = createWebhookPayload($order, 'settlement');

    $action = app(ProcessPaymentWebhookAction::class);

    // First call
    $action->execute($payload);
    expect($order->refresh()->status)->toBe(OrderStatus::PAID);

    // Second call with same payload
    Event::fake([OrderPaidEvent::class]);
    $payment = $action->execute($payload);

    expect($payment)->not->toBeNull();
    // Must NOT fire another OrderPaidEvent when already paid
    Event::assertNotDispatched(OrderPaidEvent::class);
});

it('maps expire status to expired order status', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '50000.00']);
    $payload = createWebhookPayload($order, 'expire');

    $action = app(ProcessPaymentWebhookAction::class);
    $payment = $action->execute($payload);

    expect($order->refresh()->status)->toBe(OrderStatus::EXPIRED)
        ->and($payment->transaction_status)->toBe(PaymentStatus::EXPIRE);
});

it('maps cancel and deny statuses to failed order status', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '50000.00']);
    $payload = createWebhookPayload($order, 'deny');

    $action = app(ProcessPaymentWebhookAction::class);
    $payment = $action->execute($payload);

    expect($order->refresh()->status)->toBe(OrderStatus::FAILED)
        ->and($payment->transaction_status)->toBe(PaymentStatus::DENY);
});

it('rejects a signed notification whose amount differs from the locked order price', function (): void {
    $order = Order::factory()->pending()->create(['total_amount' => '50000.00']);
    $grossAmount = '100.00';
    $signature = hash('sha512', $order->order_number.'200'.$grossAmount.config('services.midtrans.server_key'));
    $payload = createWebhookPayload($order, 'settlement', [
        'gross_amount' => $grossAmount,
        'signature_key' => $signature,
    ]);

    expect(fn () => app(ProcessPaymentWebhookAction::class)->execute($payload))
        ->toThrow(PaymentAmountMismatchException::class);

    $this->assertDatabaseCount('payments', 0);
    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
});

it('rejects status tampering despite a valid notification signature', function (): void {
    $order = Order::factory()->pending()->create();
    $payload = createWebhookPayload($order, 'pending');
    $payload['transaction_status'] = 'settlement';

    expect(fn () => app(ProcessPaymentWebhookAction::class)->execute($payload))
        ->toThrow(InvalidWebhookPayloadException::class);

    expect($order->refresh()->status)->toBe(OrderStatus::PENDING);
});

it('preserves one webhook receipt and one payment on duplicate delivery', function (): void {
    $order = Order::factory()->pending()->create();
    $payload = createWebhookPayload($order);
    $action = app(ProcessPaymentWebhookAction::class);

    $action->execute($payload);
    Http::swap(new Factory);
    Http::fake(['*' => Http::response(['transaction_status' => 'refund'])]);
    $action->execute($payload);

    $this->assertDatabaseCount('payments', 1);
    $this->assertDatabaseCount('webhook_notifications', 1);
    Http::assertNothingSent();
});

it('revokes an existing entitlement after a gateway-confirmed refund', function (): void {
    $order = Order::factory()->pending()->create();
    $item = OrderItem::factory()->for($order)->create();
    $action = app(ProcessPaymentWebhookAction::class);
    $settled = createWebhookPayload($order);
    $action->execute($settled);

    $refunded = createWebhookPayload($order, 'refund', ['transaction_id' => $settled['transaction_id']]);
    $action->execute($refunded);

    expect($order->refresh()->status)->toBe(OrderStatus::FAILED)
        ->and(DownloadToken::query()->where('order_item_id', $item->id)->firstOrFail()->expires_at->isPast())->toBeTrue();
    $this->assertDatabaseCount('webhook_notifications', 2);
});

it('does not revoke a paid order for a different denied transaction', function (): void {
    $order = Order::factory()->pending()->create();
    $item = OrderItem::factory()->for($order)->create();
    $action = app(ProcessPaymentWebhookAction::class);
    $action->execute(createWebhookPayload($order));

    $action->execute(createWebhookPayload($order, 'deny'));

    expect($order->refresh()->status)->toBe(OrderStatus::PAID)
        ->and(DownloadToken::query()->where('order_item_id', $item->id)->firstOrFail()->expires_at->isFuture())->toBeTrue();
});
