<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\Payments\ProcessPaymentWebhookAction;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class BookilReconcileCommand extends Command
{
    protected $signature = 'bookil:reconcile {order_number}';

    protected $description = 'Reconcile one order through the existing verified payment action';

    public function handle(ProcessPaymentWebhookAction $action): int
    {
        $order = Order::query()->where('order_number', (string) $this->argument('order_number'))->first();
        if ($order === null) {
            $this->error('FAIL order not found.');

            return self::FAILURE;
        }

        $serverKey = (string) config('services.midtrans.server_key');
        if (trim($serverKey) === '') {
            $this->error('FAIL Midtrans credentials are not configured.');

            return self::FAILURE;
        }

        try {
            $base = config('services.midtrans.is_production') ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
            $response = Http::withBasicAuth($serverKey, '')->acceptJson()->timeout(10)
                ->get($base.'/v2/'.rawurlencode($order->order_number).'/status');
            $payload = $response->json();
            if (! $response->successful() || ! is_array($payload) || ($payload['order_id'] ?? null) !== $order->order_number) {
                $this->error('FAIL Midtrans returned an unavailable or invalid order status.');

                return self::FAILURE;
            }

            $before = $order->status->value;
            $action->execute($payload);
            $this->info($order->order_number.': '.$before.' -> '.$order->refresh()->status->value);

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error('FAIL reconciliation rejected ('.class_basename($exception).').');

            return self::FAILURE;
        }
    }
}
