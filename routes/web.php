<?php

declare(strict_types=1);

use App\Actions\Payments\ProcessPaymentWebhookAction;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\ProfileController;
use App\Models\Order;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

// 1. Storefront & Public Catalog
Route::get('/', [ProductCatalogController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [ProductCatalogController::class, 'show'])->name('products.show');

// Public Support & Legal Pages
Route::get('/faq', fn () => Inertia::render('Support/Faq'))->name('support.faq');
Route::get('/terms', fn () => Inertia::render('Legal/Terms'))->name('legal.terms');
Route::get('/privacy', fn () => Inertia::render('Legal/Privacy'))->name('legal.privacy');
Route::get('/refund-policy', fn () => Inertia::render('Legal/RefundPolicy'))->name('legal.refund-policy');
Route::get('/errors/{code?}', fn ($code = 404) => Inertia::render('Errors/ErrorPage', ['status' => (int) $code]))->name('errors.show');

// 2. Customer Portal & Checkout (Authenticated)
Route::middleware('auth')->group(function (): void {
    // Digital Library & Customer Portal
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::get('/library', [CustomerDashboardController::class, 'index'])->name('customer.library');

    // Checkout with Rate Limiter
    Route::post('/checkout', [CheckoutController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('checkout.store');

    // Customer Invoices & Orders
    Route::get('/orders/{order:order_number}', [CustomerOrderController::class, 'show'])
        ->name('orders.show');

    // Digital Download Engine with Rate Limiter
    Route::get('/downloads/{orderItem}', [DownloadController::class, 'download'])
        ->middleware(['signed', 'throttle:30,1'])
        ->name('downloads.process');

    // User Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 3. Admin & Owner Management Portal
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/reports/sales/csv', [AdminDashboardController::class, 'exportCsv'])->name('reports.sales.csv');
    Route::get('/export/csv', [AdminDashboardController::class, 'exportCsv'])->name('export.csv');

    // Products Management
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::patch('/products/{product}/toggle-publish', [AdminProductController::class, 'togglePublish'])->name('products.toggle-publish');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

    // Categories Management
    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    // Orders Ledger & Audit
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
});

// 4. Midtrans Webhook (Excluded from CSRF in bootstrap/app.php)
Route::post('/webhooks/midtrans', [PaymentWebhookController::class, 'handle'])->name('webhooks.midtrans');

// Local Development Payment Simulator for Sandbox & Manual Testing
if (app()->environment(['local', 'testing']) && config('bookil.payment_simulator_enabled', false)) {
    Route::post('/dev/orders/{order:order_number}/simulate-paid', function (Order $order, ProcessPaymentWebhookAction $action) {
        abort_unless(auth()->check() && auth()->id() === $order->user_id, 403);
        $serverKey = (string) config('services.midtrans.server_key');
        $statusCode = '200';
        $grossAmount = (string) $order->total_amount;
        $sig = hash('sha512', $order->order_number.$statusCode.$grossAmount.$serverKey);

        $action->execute([
            'order_id' => $order->order_number,
            'transaction_id' => 'sim-'.Str::uuid(),
            'transaction_status' => 'settlement',
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'payment_type' => 'qris',
            'signature_key' => $sig,
            'settlement_time' => now()->toIso8601String(),
        ]);

        return redirect()->route('orders.show', $order->order_number)
            ->with('success', 'Simulasi pembayaran Midtrans berhasil diselesaikan! E-book kini dapat langsung diunduh.');
    })->middleware('auth')->name('dev.orders.simulate-paid');
}

require __DIR__.'/auth.php';
