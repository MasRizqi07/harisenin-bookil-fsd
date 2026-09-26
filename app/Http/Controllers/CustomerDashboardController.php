<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    /**
     * Display customer portal with personal e-book library, active download quotas, and order history.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Digital Library: all paid order items with download tokens and products
        $libraryItems = OrderItem::query()
            ->whereHas('order', function ($query) use ($user): void {
                $query->where('user_id', $user->id)
                    ->where('status', OrderStatus::PAID);
            })
            ->with([
                'product.category',
                'downloadToken',
                'order' => fn ($q) => $q->select(['id', 'order_number', 'updated_at']),
            ])
            ->latest()
            ->get();

        $libraryItems->each(function (OrderItem $item): void {
            if ($item->downloadToken?->expires_at->isFuture()
                && $item->downloadToken->download_count < $item->downloadToken->max_downloads) {
                $item->setAttribute('download_url', URL::temporarySignedRoute(
                    'downloads.process', now()->addMinutes(15), ['orderItem' => $item->id]
                ));
            }
        });

        // 2. Complete Order History: all statuses
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items.product', 'payments'])
            ->latest()
            ->paginate(10);

        // 3. Quick aggregate statistics
        $totalBooks = $libraryItems->count();
        $totalOrders = Order::query()->where('user_id', $user->id)->count();
        $activeDownloads = $libraryItems->filter(function (OrderItem $item): bool {
            $token = $item->downloadToken;
            if (! $token) {
                return false;
            }

            return $token->download_count < $token->max_downloads && $token->expires_at->isFuture();
        })->count();

        return Inertia::render('Dashboard', [
            'library' => $libraryItems,
            'orders' => $orders,
            'stats' => [
                'total_books' => $totalBooks,
                'total_orders' => $totalOrders,
                'active_downloads' => $activeDownloads,
            ],
        ]);
    }
}
