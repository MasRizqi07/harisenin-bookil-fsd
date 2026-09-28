<?php

declare(strict_types=1);

use App\Actions\Payments\ProcessPaymentWebhookAction;
use App\Mail\OrderReceipt;
use App\Models\Order;
use App\Models\OrderItem;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

// Webhook retries and reversals must not send duplicate purchase receipts or bearer download links.
it('sends one receipt on settlement and none on replay or refund', function (): void {
    Mail::fake();
    config()->set('queue.default', 'sync');
    config()->set('services.midtrans.server_key', 'receipt-test-key');
    config()->set('services.midtrans.is_production', false);
    $order = Order::factory()->pending()->create(['total_amount' => '100000.00']);
    OrderItem::factory()->create(['order_id' => $order->id]);
    $payload = [
        'order_id' => $order->order_number, 'transaction_id' => 'receipt-transaction',
        'transaction_status' => 'settlement', 'status_code' => '200', 'gross_amount' => '100000.00',
        'payment_type' => 'qris', 'signature_key' => hash('sha512', $order->order_number.'200100000.00receipt-test-key'),
    ];
    Http::fake(['*' => function () use (&$payload): PromiseInterface {
        return Http::response($payload);
    }]);
    $action = app(ProcessPaymentWebhookAction::class);
    $action->execute($payload);
    Mail::assertSent(OrderReceipt::class, function (OrderReceipt $mail) use ($order): bool {
        $html = $mail->render();
        expect($html)->toContain(route('orders.show', $order->order_number), '30 days', '5 downloads')
            ->not->toContain('/downloads/', 'signature=');

        return $mail->hasTo($order->user->email);
    });
    Mail::assertSentCount(1);

    $action->execute($payload);
    Mail::assertSentCount(1);
    $payload['transaction_status'] = 'refund';
    $action->execute($payload);
    Mail::assertSentCount(1);
    $this->assertDatabaseCount('payments', 1);
    fwrite(STDOUT, "SETTLEMENT_RECEIPTS=1 REPLAY_RECEIPTS=1 REFUND_RECEIPTS=1 PAYMENT_ROWS=1 DOWNLOAD_LINKS_IN_MAIL=0\n");
});
