<?php

declare(strict_types=1);

namespace App\Actions\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPaidEvent;
use App\Exceptions\InvalidSignatureException;
use App\Exceptions\InvalidWebhookPayloadException;
use App\Exceptions\PaymentAmountMismatchException;
use App\Models\Order;
use App\Models\Payment;
use App\Models\WebhookNotification;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ProcessPaymentWebhookAction
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function execute(array $payload): ?Payment
    {
        $orderNumber = $this->requiredString($payload, 'order_id');
        $transactionId = $this->requiredString($payload, 'transaction_id');
        $statusCode = $this->requiredString($payload, 'status_code');
        $grossAmount = $this->requiredString($payload, 'gross_amount');
        $status = PaymentStatus::tryFrom($this->requiredString($payload, 'transaction_status'));

        if ($status === null || ! preg_match('/^\d{1,12}(?:\.\d{1,2})?$/D', $grossAmount)) {
            throw new InvalidWebhookPayloadException;
        }

        if (strlen($transactionId) > 64
            || ! preg_match('/^\d{3}$/D', $statusCode)
            || ! is_string($payload['fraud_status'] ?? '')) {
            throw new InvalidWebhookPayloadException;
        }

        $this->validateSignature($payload, $orderNumber, $statusCode, $grossAmount);
        $eventKey = hash('sha256', implode('|', [
            $orderNumber, $transactionId, $status->value, $grossAmount,
            $payload['fraud_status'] ?? '', $statusCode,
        ]));

        if (WebhookNotification::query()->where('event_key', $eventKey)->exists()) {
            return Payment::query()->where('external_transaction_id', $transactionId)->first();
        }

        $verified = $this->verifyGatewayStatus($payload, $orderNumber, $transactionId, $status, $grossAmount);
        $paymentType = is_string($verified['payment_type'] ?? null)
            ? $verified['payment_type'] : 'unknown';
        if (strlen($paymentType) > 255 || ! is_string($verified['fraud_status'] ?? '')) {
            throw new InvalidWebhookPayloadException;
        }

        return DB::transaction(function () use ($payload, $verified, $paymentType, $eventKey, $orderNumber, $transactionId, $status, $grossAmount): ?Payment {
            $order = Order::query()->where('order_number', $orderNumber)->lockForUpdate()->first();

            if ($order === null) {
                throw new InvalidWebhookPayloadException('The payment order was not found.');
            }

            if (bccomp($grossAmount, $order->total_amount, 2) !== 0) {
                throw new PaymentAmountMismatchException;
            }

            $existingPayment = Payment::query()->where('external_transaction_id', $transactionId)->first();

            if ($existingPayment !== null && $existingPayment->order_id !== $order->id) {
                throw new InvalidWebhookPayloadException('The transaction belongs to a different order.');
            }

            $notification = WebhookNotification::query()->firstOrCreate(
                ['event_key' => $eventKey],
                [
                    'order_id' => $order->id,
                    'external_transaction_id' => $transactionId,
                    'transaction_status' => $status->value,
                    'payload' => $payload,
                    'result' => 'received',
                ],
            );

            if ($notification->result !== 'received') {
                return $existingPayment;
            }

            $target = $this->targetStatus($status, (string) ($verified['fraud_status'] ?? ''));

            // A paid transaction can be reversed or refunded by the gateway.
            $reversal = $order->status === OrderStatus::PAID
                && $existingPayment !== null
                && in_array($existingPayment->transaction_status, [PaymentStatus::SETTLEMENT, PaymentStatus::CAPTURE], true)
                && in_array($status, [PaymentStatus::DENY, PaymentStatus::CANCEL, PaymentStatus::REFUND, PaymentStatus::CHARGEBACK], true);

            if ($order->status->isFinal() && ! $reversal) {
                $notification->update(['result' => 'ignored_final']);

                return $existingPayment;
            }

            if ($existingPayment !== null && $existingPayment->transaction_status === $status) {
                $notification->update(['result' => 'ignored_duplicate']);

                return $existingPayment;
            }

            $paidAt = $target === OrderStatus::PAID ? CarbonImmutable::now() : $existingPayment?->paid_at;

            if ($existingPayment === null) {
                $payment = Payment::query()->create([
                    'order_id' => $order->id,
                    'external_transaction_id' => $transactionId,
                    'payment_type' => $paymentType,
                    'gross_amount' => $grossAmount,
                    'transaction_status' => $status,
                    'raw_response' => $payload,
                    'paid_at' => $paidAt,
                ]);
            } else {
                $existingPayment->update([
                    'payment_type' => $paymentType,
                    'transaction_status' => $status,
                    'raw_response' => $payload,
                    'paid_at' => $paidAt,
                ]);
                $payment = $existingPayment;
            }

            $wasPaid = $order->status === OrderStatus::PAID;
            $order->update([
                'status' => $target,
                'payment_method' => $payment->payment_type,
                'snap_token' => $target === OrderStatus::PENDING ? $order->snap_token : null,
                'snap_redirect_url' => $target === OrderStatus::PENDING ? $order->snap_redirect_url : null,
            ]);

            if ($reversal) {
                $order->items()->whereHas('downloadToken')->with('downloadToken')->get()
                    ->each(fn ($item) => $item->downloadToken->update(['expires_at' => now()]));
            }

            $notification->update(['result' => 'processed']);

            if (! $wasPaid && $target === OrderStatus::PAID) {
                OrderPaidEvent::dispatch($order);
            }

            return $payment;
        }, attempts: 3);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function requiredString(array $payload, string $key): string
    {
        $value = $payload[$key] ?? null;

        if (! is_string($value) || $value === '' || strlen($value) > 255) {
            throw new InvalidWebhookPayloadException("Missing or invalid {$key}.");
        }

        return $value;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validateSignature(array $payload, string $orderNumber, string $statusCode, string $grossAmount): void
    {
        $serverKey = (string) config('services.midtrans.server_key');
        $signature = $payload['signature_key'] ?? null;

        if ($serverKey === '' || ! is_string($signature) || ! preg_match('/^[a-fA-F0-9]{128}$/D', $signature)) {
            throw new InvalidSignatureException;
        }

        $expected = hash('sha512', $orderNumber.$statusCode.$grossAmount.$serverKey);

        if (! hash_equals($expected, strtolower($signature))) {
            throw new InvalidSignatureException;
        }
    }

    /**
     * Midtrans recommends confirming notification state with its authenticated status API.
     * The signed fields do not cover transaction_status or transaction_id.
     *
     * @param  array<string, mixed>  $payload
     */
    private function verifyGatewayStatus(
        array $payload,
        string $orderNumber,
        string $transactionId,
        PaymentStatus $status,
        string $grossAmount,
    ): array {
        if (app()->environment(['local', 'testing'])
            && config('bookil.payment_simulator_enabled', false)
            && str_starts_with($transactionId, 'sim-')) {
            return $payload;
        }

        $base = config('services.midtrans.is_production')
            ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
        $url = $base.'/v2/'.rawurlencode($orderNumber).'/status';
        $response = Http::withBasicAuth((string) config('services.midtrans.server_key'), '')
            ->acceptJson()
            ->timeout(10)
            ->get($url);

        if (! $response->successful()) {
            throw new RuntimeException('Midtrans status verification is unavailable.');
        }

        $verified = $response->json();

        if (! is_array($verified)
            || ($verified['order_id'] ?? null) !== $orderNumber
            || ($verified['transaction_id'] ?? null) !== $transactionId
            || ($verified['transaction_status'] ?? null) !== $status->value
            || ! is_string($verified['gross_amount'] ?? null)
            || ! preg_match('/^\d{1,12}(?:\.\d{1,2})?$/D', $verified['gross_amount'])
            || bccomp($verified['gross_amount'], $grossAmount, 2) !== 0
            || (($verified['fraud_status'] ?? '') !== ($payload['fraud_status'] ?? ''))
        ) {
            throw new InvalidWebhookPayloadException('Notification differs from the current Midtrans transaction.');
        }

        return $verified;
    }

    private function targetStatus(PaymentStatus $status, string $fraudStatus): OrderStatus
    {
        return match ($status) {
            PaymentStatus::CAPTURE => $fraudStatus === 'accept'
                ? OrderStatus::PAID : OrderStatus::PENDING,
            PaymentStatus::SETTLEMENT => OrderStatus::PAID,
            PaymentStatus::EXPIRE => OrderStatus::EXPIRED,
            PaymentStatus::DENY, PaymentStatus::CANCEL, PaymentStatus::FAILURE,
            PaymentStatus::REFUND, PaymentStatus::CHARGEBACK => OrderStatus::FAILED,
            default => OrderStatus::PENDING,
        };
    }
}
