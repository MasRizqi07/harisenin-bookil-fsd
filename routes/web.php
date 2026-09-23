<?php

declare(strict_types=1);

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Bookil Storefront Catalog
Route::get('/', [ProductCatalogController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [ProductCatalogController::class, 'show'])->name('products.show');

// Checkout & Customer Orders (Requires Authentication)
Route::middleware('auth')->group(function (): void {
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/orders/{order:order_number}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::get('/downloads/{token}', [DownloadController::class, 'download'])->name('downloads.process');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Midtrans Webhook (Excluded from CSRF in bootstrap/app.php)
Route::post('/webhooks/midtrans', [PaymentWebhookController::class, 'handle'])->name('webhooks.midtrans');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
Route::get('/tasks/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggle'])->name('tasks.toggle');
Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

require __DIR__ . '/auth.php';
