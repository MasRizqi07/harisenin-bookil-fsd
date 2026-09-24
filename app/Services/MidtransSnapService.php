<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
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
        $serverKey = (string) config('services.midtrans.server_key');
        $isProduction = (bool) config('services.midtrans.is_production', false);

        $endpoint = $isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $order->loadMissing(['user', 'items.product']);

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) round((float) $order->total_amount),
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
            ],
            'item_details' => $order->items->map(fn ($item): array => [
                'id' => (string) $item->product_id,
                'price' => (int) round((float) $item->price),
                'quantity' => 1,
                'name' => mb_substr($item->product->title, 0, 50),
            ])->values()->all(),
        ];

        // In local or test environments without a valid remote Midtrans key, provide a fallback mock token immediately
        if (app()->environment(['local', 'testing']) && empty($serverKey)) {
            $mockToken = 'mock-snap-'.Str::random(32);

            return [
                'snap_token' => $mockToken,
                'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$mockToken}",
            ];
        }

        try {
            $httpClient = Http::withBasicAuth($serverKey, '')
                ->acceptJson()
                ->asJson()
                ->timeout(10);

            // Bypass SSL certificate verification in non-production environments to avoid Windows cURL error 60
            if (! $isProduction) {
                $httpClient = $httpClient->withoutVerifying();
            }

            $response = $httpClient->post($endpoint, $payload);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'snap_token' => (string) ($data['token'] ?? ''),
                    'redirect_url' => (string) ($data['redirect_url'] ?? ''),
                ];
            }

            if (app()->environment(['local', 'testing'])) {
                report(new RuntimeException("Midtrans API Error [{$response->status()}]: {$response->body()}"));

                $mockToken = 'mock-snap-'.Str::random(32);

                return [
                    'snap_token' => $mockToken,
                    'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$mockToken}",
                ];
            }

            throw new RuntimeException(
                "Midtrans Snap API request failed: [{$response->status()}] {$response->body()}"
            );
        } catch (\Throwable $e) {
            if (app()->environment(['local', 'testing'])) {
                report($e);

                $mockToken = 'mock-snap-'.Str::random(32);

                return [
                    'snap_token' => $mockToken,
                    'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/{$mockToken}",
                ];
            }

            throw $e;
        }
    }
}
