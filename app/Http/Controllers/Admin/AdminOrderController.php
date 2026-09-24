<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of all customer orders & transactions.
     */
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with(['user', 'items.product', 'payments'])
            ->when($request->filled('status'), function (Builder $query) use ($request): void {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = '%'.trim((string) $request->input('search')).'%';
                $query->where(function (Builder $sub) use ($search): void {
                    $sub->where('order_number', 'like', $search)
                        ->orWhereHas('user', function (Builder $userQuery) use ($search): void {
                            $userQuery->where('name', 'like', $search)
                                ->orWhere('email', 'like', $search);
                        });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'status' => (string) $request->input('status', ''),
                'search' => (string) $request->input('search', ''),
            ],
            'statuses' => array_column(OrderStatus::cases(), 'value'),
        ]);
    }

    /**
     * Display detailed order ledger, item breakdown, and gateway webhook payloads.
     */
    public function show(Order $order): Response
    {
        $order->loadMissing([
            'user',
            'items.product.category',
            'items.downloadToken',
            'payments',
        ]);

        $order->items->each(function ($item): void {
            $item->downloadToken?->makeVisible('token');
        });

        $order->payments->each(function ($payment): void {
            $payment->makeVisible('raw_response');
        });

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }
}
