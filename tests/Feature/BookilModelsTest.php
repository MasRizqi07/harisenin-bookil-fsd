<?php

declare(strict_types=1);

use App\Enums\FileType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\MassAssignmentException;
use Illuminate\Database\Eloquent\MissingAttributeException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\LazyLoadingViolationException;
use Illuminate\Support\Facades\Hash;

it('persists customer roles by default and hashes passwords', function (): void {
    $user = User::query()->create([
        'name' => 'Customer',
        'email' => 'customer@example.test',
        'password' => 'a-long-test-password',
    ])->refresh();

    expect($user->role)->toBe(UserRole::CUSTOMER)
        ->and(Hash::check('a-long-test-password', $user->password))->toBeTrue()
        ->and($user->toArray())->not->toHaveKeys(['password', 'remember_token'])
        ->and(User::factory()->admin()->create()->refresh()->role)->toBe(UserRole::ADMIN);
});

it('rejects privilege escalation through mass assignment', function (): void {
    $user = User::factory()->create();

    expect(fn () => $user->update(['role' => UserRole::ADMIN]))
        ->toThrow(MassAssignmentException::class);
    expect($user->refresh()->role)->toBe(UserRole::CUSTOMER);
});

it('casts all monetary values to fixed decimal strings', function (): void {
    $product = Product::factory()->create(['price' => '1234567.89']);
    $order = Order::factory()->create(['total_amount' => '1234567.89']);
    $item = OrderItem::factory()->for($order)->for($product)->create();
    $payment = Payment::factory()->for($order)->create();

    expect($product->refresh()->price)->toBe('1234567.89')
        ->and($item->refresh()->price)->toBe('1234567.89')
        ->and($order->refresh()->total_amount)->toBe('1234567.89')
        ->and($payment->refresh()->gross_amount)->toBe('1234567.89');
});

it('casts order statuses after a database round trip', function (OrderStatus $status): void {
    expect(Order::factory()->create(['status' => $status])->refresh()->status)->toBe($status);
})->with(OrderStatus::cases());

it('casts gateway statuses after a database round trip', function (PaymentStatus $status): void {
    expect(Payment::factory()->create(['transaction_status' => $status])
        ->refresh()->transaction_status)->toBe($status);
})->with(PaymentStatus::cases());

it('casts digital file types after a database round trip', function (FileType $type): void {
    expect(Product::factory()->create(['file_type' => $type])->refresh()->file_type)->toBe($type);
})->with(FileType::cases());

it('casts booleans, JSON, counters and immutable timestamps', function (): void {
    $product = Product::factory()->published()->create();
    $payment = Payment::factory()->create([
        'transaction_status' => PaymentStatus::SETTLEMENT,
        'raw_response' => ['transaction_status' => 'settlement'],
        'paid_at' => now(),
    ])->refresh();
    $token = DownloadToken::factory()->create()->refresh();

    expect(Category::factory()->create()->refresh()->is_active)->toBeTrue()
        ->and($product->refresh()->is_published)->toBeTrue()
        ->and($product->file_size)->toBeInt()
        ->and($payment->raw_response)->toBe(['transaction_status' => 'settlement'])
        ->and($payment->paid_at)->toBeInstanceOf(CarbonImmutable::class)
        ->and($token->expires_at)->toBeInstanceOf(CarbonImmutable::class)
        ->and($token->download_count)->toBe(0)
        ->and($token->max_downloads)->toBe(5);
});

it('does not serialize private asset paths or gateway payloads', function (): void {
    expect(Product::factory()->create()->toArray())->not->toHaveKey('file_path')
        ->and(Payment::factory()->create()->toArray())->not->toHaveKey('raw_response');
});

it('loads the purchase graph explicitly in both directions', function (): void {
    $product = Product::factory()->create();
    $order = Order::factory()->paid()->create(['total_amount' => $product->price]);
    $item = OrderItem::factory()->for($order)->for($product)->create();
    $payment = Payment::factory()->for($order)->create();
    $token = DownloadToken::factory()->for($item)->create();

    $order->load(['user.orders', 'items.product.category.products', 'items.downloadToken', 'payments']);
    $item->load(['order', 'product.orderItems']);
    $payment->load('order');
    $token->load('orderItem');

    expect($order->user->orders->sole()->is($order))->toBeTrue()
        ->and($order->items->sole()->is($item))->toBeTrue()
        ->and($order->items->sole()->product->category->products->sole()->is($product))->toBeTrue()
        ->and($order->items->sole()->downloadToken->is($token))->toBeTrue()
        ->and($order->payments->sole()->is($payment))->toBeTrue()
        ->and($item->order->is($order))->toBeTrue()
        ->and($item->product->orderItems->sole()->is($item))->toBeTrue()
        ->and($payment->order->is($order))->toBeTrue()
        ->and($token->orderItem->is($item))->toBeTrue();
});

it('retains the purchased price when the catalog price changes', function (): void {
    $product = Product::factory()->create(['price' => '125000.00']);
    $item = OrderItem::factory()->for($product)->create();
    $product->update(['price' => '150000.00']);

    expect($item->refresh()->price)->toBe('125000.00');
});

it('enables all Eloquent strictness safeguards', function (): void {
    expect(Model::preventsLazyLoading())->toBeTrue()
        ->and(Model::preventsSilentlyDiscardingAttributes())->toBeTrue()
        ->and(Model::preventsAccessingMissingAttributes())->toBeTrue();

    expect(fn () => new Product(['unknown_attribute' => 'value']))
        ->toThrow(MassAssignmentException::class);

    Product::factory()->count(2)->create();
    // Eloquent checks implicitly loaded relations on hydrated collections.
    $products = Product::query()->get();
    expect(fn () => $products->first()->category)->toThrow(LazyLoadingViolationException::class);

    $partial = Product::query()->select('id')->firstOrFail();
    expect(fn () => $partial->title)->toThrow(MissingAttributeException::class);
});

it('seeds categories idempotently without creating accounts or fictional assets', function (): void {
    $this->seed();
    $category = Category::query()->where('slug', 'ebooks')->firstOrFail();
    $category->update(['name' => 'Edited by admin', 'is_active' => false]);
    $this->seed();

    expect(Category::query()->count())->toBe(3)
        ->and($category->refresh()->name)->toBe('Edited by admin')
        ->and($category->is_active)->toBeFalse()
        ->and(User::query()->count())->toBe(0)
        ->and(Product::query()->count())->toBe(0);
});
