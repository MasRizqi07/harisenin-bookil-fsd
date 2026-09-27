<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Gate;
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
        Gate::authorize('viewAnyAsAdmin', Order::class);

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
            ->withCount(['orderItems as sales_count' => fn (Builder $query) => $query
                ->whereHas('order', fn (Builder $orders) => $orders->where('status', OrderStatus::PAID))])
            ->orderByDesc('sales_count')
            ->limit(5)
            ->get(['id', 'title', 'price', 'cover_image_path', 'author']);

        $statusCounts = Order::query()->select('status')
            ->selectRaw('COUNT(*) AS total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Charts attribute paid revenue to the order creation date.
        $today = now()->toImmutable();
        $dailyTotals = Order::query()
            ->where('status', OrderStatus::PAID)
            ->where('created_at', '>=', $today->startOfMonth()->subMonths(11))
            ->selectRaw('DATE(created_at) AS day, SUM(total_amount) AS revenue')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('day')
            ->pluck('revenue', 'day');

        $monthlyTotals = [];
        foreach ($dailyTotals as $day => $revenue) {
            $month = substr((string) $day, 0, 7);
            $monthlyTotals[$month] = bcadd($monthlyTotals[$month] ?? '0.00', (string) $revenue, 2);
        }

        $dailyRevenue = [];
        for ($daysAgo = 29; $daysAgo >= 0; $daysAgo--) {
            $day = $today->subDays($daysAgo)->toDateString();
            $dailyRevenue[] = [
                'period' => $day,
                'amount' => bcadd('0.00', (string) ($dailyTotals[$day] ?? '0.00'), 2),
            ];
        }

        $monthlyRevenue = [];
        for ($monthsAgo = 11; $monthsAgo >= 0; $monthsAgo--) {
            $month = $today->startOfMonth()->subMonths($monthsAgo)->format('Y-m');
            $monthlyRevenue[] = ['period' => $month, 'amount' => $monthlyTotals[$month] ?? '0.00'];
        }

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
            'dailyRevenue' => $dailyRevenue,
            'monthlyRevenue' => $monthlyRevenue,
            'orderStatusBreakdown' => collect(OrderStatus::cases())->mapWithKeys(
                fn (OrderStatus $status) => [$status->value => (int) ($statusCounts[$status->value] ?? 0)]
            ),
        ]);
    }

    /**
     * Stream a real-time CSV report of all sales and orders.
     */
    public function exportCsv(): StreamedResponse
    {
        Gate::authorize('viewAnyAsAdmin', Order::class);

        $fileName = 'bookil-sales-report-'.now()->format('Y-m-d-His').'.csv';

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
            ], escape: '');

            Order::query()
                ->with('user')
                ->withCount('items')
                ->chunkById(200, function ($orders) use ($handle): void {
                    foreach ($orders as $order) {
                        fputcsv($handle, [
                            $order->created_at->format('Y-m-d H:i:s'),
                            $order->order_number,
                            $this->spreadsheetSafe($order->user?->name ?? 'User Terhapus'),
                            $this->spreadsheetSafe($order->user?->email ?? '-'),
                            (string) $order->total_amount,
                            $order->status->value,
                            $this->spreadsheetSafe($order->payment_method ?? '-'),
                            $order->items_count,
                        ], escape: '');
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }

    private function spreadsheetSafe(string $value): string
    {
        return preg_match('/^[\s\x00-\x1f]*[=+\-@]/u', $value) === 1 ? "'".$value : $value;
    }
}
