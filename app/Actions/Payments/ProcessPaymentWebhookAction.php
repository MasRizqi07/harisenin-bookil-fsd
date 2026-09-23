<?php

declare(strict_types=1);

namespace App\Actions\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPaidEvent;
use App\Exceptions\InvalidSignatureException;
use App\Models\Order;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ProcessPaymentWebhookAction
{
    /**
     * Process incoming Midtrans webhook notification with signature verification,
     * idempotent state transitions, and audit logging.
     *
     * @param  array<string, mixed>  $payload
     */
    public function execute(array $payload): ?Payment
    {
        $this->validateSignature($payload);

        $orderId = (string) ($payload['order_id'] ?? '');
        $transactionId = (string) ($payload['transaction_id'] ?? '');

        if ($orderId === '' || $transactionId === '') {
            throw new InvalidArgumentException('Missing required transaction identifier fields in webhook payload.');
        }

        return DB::transaction(function () use ($payload, $orderId, $transactionId): ?Payment {
            $order = Order::query()
                ->where('order_number', $orderId)
                ->lockForUpdate()
                ->first();

            if (! $order) {
                throw new InvalidArgumentException("Order [{$orderId}] referenced by webhook was not found.");
            }

            $existingPayment = Payment::query()
                ->where('external_transaction_id', $transactionId)
                ->first();

            // Idempotency: if order is already paid or transaction was already finalized in identical state
            $incomingStatus = (string) ($payload['transaction_status'] ?? '');
            if ($order->status === OrderStatus::PAID) {
                return $existingPayment ?? $this->recordPayment($order, $payload, PaymentStatus::tryFrom($incomingStatus) ?? PaymentStatus::SETTLEMENT, $order->updated_at?->toImmutable());
            }

            if ($existingPayment && $existingPayment->transaction_status->value === $incomingStatus) {
                return $existingPayment;
            }

            $targetOrderStatus = $this->determineOrderStatus($payload, $order->status);
            $paymentStatus = PaymentStatus::tryFrom($incomingStatus) ?? PaymentStatus::PENDING;

            $isSettled = ($targetOrderStatus === OrderStatus::PAID);
            $paidAt = null;
            if ($isSettled) {
                $paidAt = isset($payload['settlement_time'])
                    ? CarbonImmutable::parse((string) $payload['settlement_time'])
                    : CarbonImmutable::now();
            }

            $order->status = $targetOrderStatus;
            if (isset($payload['payment_type'])) {
                $order->payment_method = (string) $payload['payment_type'];
            }
            $order->save();

            $payment = $this->recordPayment($order, $payload, $paymentStatus, $paidAt);

            if ($isSettled) {
                OrderPaidEvent::dispatch($order);
            }

            return $payment;
        });
    }

    /**
     * Validate Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key).
     *
     * @param  array<string, mixed>  $payload
     */
    protected function validateSignature(array $payload): void
    {
        $serverKey = (string) config('services.midtrans.server_key');
        $incomingSignature = (string) ($payload['signature_key'] ?? '');

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        if (! hash_equals($expectedSignature, $incomingSignature)) {
            throw new InvalidSignatureException('Midtrans webhook signature validation failed.');
        }
    }

    /**
     * Map Midtrans transaction status and fraud status to internal OrderStatus.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function determineOrderStatus(array $payload, OrderStatus $currentStatus): OrderStatus
    {
        $transactionStatus = (string) ($payload['transaction_status'] ?? '');
        $fraudStatus = (string) ($payload['fraud_status'] ?? '');

        return match ($transactionStatus) {
            'capture' => ($fraudStatus === 'challenge') ? OrderStatus::PENDING : OrderStatus::PAID,
            'settlement' => OrderStatus::PAID,
            'pending' => OrderStatus::PENDING,
            'deny', 'cancel', 'failure' => OrderStatus::FAILED,
            'expire' => OrderStatus::EXPIRED,
            default => $currentStatus,
        };
    }

    /**
     * Record or update payment ledger row.
     *
     * @param  array<string, mixed>  $payload
     */
    protected function recordPayment(Order $order, array $payload, PaymentStatus $status, ?CarbonImmutable $paidAt): Payment
    {
        return Payment::updateOrCreate(
            ['external_transaction_id' => (string) $payload['transaction_id']],
            [
                'order_id' => $order->id,
                'payment_type' => (string) ($payload['payment_type'] ?? 'unknown'),
                'gross_amount' => (string) ($payload['gross_amount'] ?? $order->total_amount),
                'transaction_status' => $status,
                'raw_response' => $payload,
                'paid_at' => $paidAt,
            ]
        );
    }
}
