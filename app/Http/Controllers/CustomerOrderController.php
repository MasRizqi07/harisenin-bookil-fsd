<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\MidtransSnapService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CustomerOrderController extends Controller
{
    /**
     * Display order invoice, payment dialog status, and digital download assets.
     */
    public function show(
        Request $request,
        Order $order,
        MidtransSnapService $snapService,
    ): Response {
        if ($order->user_id !== $request->user()?->id) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat pesanan ini.');
        }

        $order->loadMissing([
            'user',
            'items.product.category',
            'items.downloadToken',
            'payments',
        ]);

        $snapToken = session('snap_token');
        if (!$snapToken && $order->status === OrderStatus::PENDING) {
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
        ]);
    }
}

