<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\MidtransSnapService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CustomerOrderController extends Controller
{
    /**
     * Display order invoice, payment dialog status, and digital download assets.
     */
    public function show(
        Order $order,
        MidtransSnapService $snapService,
    ): Response {
        Gate::authorize('view', $order);

        $order->loadMissing([
            'user',
            'items.product.category',
            'items.downloadToken',
            'payments',
        ]);

        if ($order->status === OrderStatus::PAID) {
            $order->items->each(function ($item): void {
                if ($item->downloadToken?->expires_at->isFuture()
                    && $item->downloadToken->download_count < $item->downloadToken->max_downloads) {
                    $item->setAttribute('download_url', URL::temporarySignedRoute(
                        'downloads.process', now()->addMinutes(15), ['orderItem' => $item->id]
                    ));
                }
            });
        }

        $snapToken = $order->snap_token;
        if (! $snapToken && $order->status === OrderStatus::PENDING) {
            try {
                $snapData = $snapService->createTransaction($order);
                $snapToken = $snapData['snap_token'];
            } catch (Throwable) {
                // Allow viewing order even if gateway token fails
                $snapToken = null;
            }
        }

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'snapToken' => $snapToken,
            'midtransClientKey' => (string) config('services.midtrans.client_key'),
            'midtransIsProduction' => (bool) config('services.midtrans.is_production', false),
            'paymentSimulatorEnabled' => app()->environment(['local', 'testing'])
                && (bool) config('bookil.payment_simulator_enabled', false),
        ]);
    }
}
