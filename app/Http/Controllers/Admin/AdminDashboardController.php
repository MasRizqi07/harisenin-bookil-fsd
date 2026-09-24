<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminDashboardController extends Controller
{
    /**
     * Display the Executive Sales & Analytics Dashboard for Client Owner and Admin.
     */
    public function index(): Response
    {
        $grossRevenue = Order::query()
            ->where('status', OrderStatus::PAID)
            ->sum('total_amount');

        $totalOrders = Order::query()->count();
        $paidOrdersCount = Order::query()->where('status', OrderStatus::PAID)->count();
        $activeProductsCount = Product::query()->where('is_published', true)->count();
        $customersCount = User::query()->where('role', UserRole::CUSTOMER)->count();

        $recentTransactions = Order::query()
            ->with(['user', 'items.product', 'payments'])
            ->latest()
            ->limit(10)
            ->get();

        $topProducts = Product::query()
            ->withCount(['orderItems as sales_count'])
            ->orderByDesc('sales_count')
            ->limit(5)
            ->get(['id', 'title', 'price', 'cover_image_path', 'author']);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'gross_revenue' => (string) $grossRevenue,
                'total_orders' => $totalOrders,
                'paid_orders_count' => $paidOrdersCount,
                'active_products_count' => $activeProductsCount,
                'customers_count' => $customersCount,
            ],
            'recentTransactions' => $recentTransactions,
            'topProducts' => $topProducts,
        ]);
    }

    /**
     * Stream a real-time CSV report of all sales and orders.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $fileName = 'bookil-sales-report-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function (): void {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, [
                'Tanggal',
                'Nomor Pesanan',
                'Pelanggan',
                'Email',
                'Total Nominal (IDR)',
                'Status Pesanan',
                'Metode Pembayaran',
                'Jumlah Item',
            ]);

            Order::query()
                ->with(['user', 'items'])
                ->latest()
                ->chunk(200, function ($orders) use ($handle): void {
                    foreach ($orders as $order) {
                        fputcsv($handle, [
                            $order->created_at->format('Y-m-d H:i:s'),
                            $order->order_number,
                            $order->user?->name ?? 'User Terhapus',
                            $order->user?->email ?? '-',
                            (string) $order->total_amount,
                            $order->status->value,
                            $order->payment_method ?? '-',
                            $order->items->count(),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }
}
