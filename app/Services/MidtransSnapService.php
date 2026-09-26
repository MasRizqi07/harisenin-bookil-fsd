<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MidtransSnapService
{
    /**
     * Create Midtrans Snap payment transaction token and redirect URL.
     *
     * @return array{snap_token: string, redirect_url: string}
     */
    public function createTransaction(Order $order): array
    {
        return Cache::lock('midtrans-snap-order:'.$order->id, 20)
            ->block(12, fn (): array => $this->createLockedTransaction($order));
    }

    /** @return array{snap_token: string, redirect_url: string} */
    private function createLockedTransaction(Order $order): array
    {
        $order->refresh();
        if ($order->status !== OrderStatus::PENDING) {
            throw new RuntimeException('Only pending orders can start a Snap transaction.');
        }

        if ($order->snap_token !== null && $order->snap_redirect_url !== null) {
            return ['snap_token' => $order->snap_token, 'redirect_url' => $order->snap_redirect_url];
        }

        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            throw new RuntimeException('Midtrans server key is not configured.');
        }
        $isProduction = (bool) config('services.midtrans.is_production', false);

        $endpoint = $isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $order->loadMissing(['user', 'items.product']);

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => $this->rupiahAmount($order->total_amount),
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
            ],
            'item_details' => $order->items->map(fn ($item): array => [
                'id' => (string) $item->product_id,
                'price' => $this->rupiahAmount($item->price),
                'quantity' => 1,
                'name' => mb_substr($item->product->title, 0, 50),
            ])->values()->all(),
        ];

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()->asJson()->timeout(10)->post($endpoint, $payload);

        if (! $response->successful()) {
            throw new RuntimeException("Midtrans Snap API request failed with status {$response->status()}.");
        }

        $data = $response->json();
        if (! is_array($data) || empty($data['token']) || empty($data['redirect_url'])) {
            throw new RuntimeException('Midtrans Snap returned an invalid transaction response.');
        }

        $order->update([
            'snap_token' => (string) $data['token'],
            'snap_redirect_url' => (string) $data['redirect_url'],
        ]);

        return [
            'snap_token' => (string) $data['token'],
            'redirect_url' => (string) $data['redirect_url'],
        ];
    }

    private function rupiahAmount(string $amount): int
    {
        if (! preg_match('/^\d{1,12}\.00$/D', $amount)) {
            throw new RuntimeException('Midtrans IDR amounts must be whole rupiah.');
        }

        return (int) substr($amount, 0, -3);
    }
}
