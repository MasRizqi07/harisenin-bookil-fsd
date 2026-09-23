<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Orders\CreateOrderAction;
use App\Http\Requests\CheckoutRequest;
use App\Models\User;
use App\Services\MidtransSnapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class CheckoutController extends Controller
{
    /**
     * Process checkout: lock prices, create order, request Midtrans Snap token, and redirect to order invoice.
     */
    public function store(
        CheckoutRequest $request,
        CreateOrderAction $createOrder,
        MidtransSnapService $snapService,
    ): RedirectResponse|JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $order = $createOrder->execute(
            $user,
            [(int) $request->validated('product_id')],
            $request->validated('notes')
        );

        $snap = $snapService->createTransaction($order);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'order' => $order,
                'snap_token' => $snap['snap_token'],
                'redirect_url' => $snap['redirect_url'],
                'order_url' => route('orders.show', $order->order_number),
            ], 201);
        }

        return redirect()->route('orders.show', $order->order_number)
            ->with('snap_token', $snap['snap_token'])
            ->with('success', 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.');
    }
}

