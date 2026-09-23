<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

it('enforces unique business identifiers', function (string $model, string $column): void {
    $first = $model::factory()->create();

    expect(fn () => $model::factory()->create([$column => $first->getRawOriginal($column)]))
        ->toThrow(QueryException::class);
})->with([
    'category slug' => [Category::class, 'slug'],
    'product slug' => [Product::class, 'slug'],
    'order number' => [Order::class, 'order_number'],
    'gateway transaction' => [Payment::class, 'external_transaction_id'],
    'token digest' => [DownloadToken::class, 'token'],
]);

it('allows only one copy of a digital product per order', function (): void {
    $item = OrderItem::factory()->create();

    expect(fn () => OrderItem::factory()->create([
        'order_id' => $item->order_id,
        'product_id' => $item->product_id,
    ]))->toThrow(QueryException::class);
});

it('keeps one quota record per purchased item', function (): void {
    $token = DownloadToken::factory()->create();

    expect(fn () => DownloadToken::factory()->create(['order_item_id' => $token->order_item_id]))
        ->toThrow(QueryException::class);
});

it('rejects orphan foreign keys', function (string $model, string $column): void {
    $record = $model::factory()->make();
    $record->{$column} = 999999999;

    expect(fn () => $record->save())
        ->toThrow(QueryException::class);
})->with([
    'product category' => [Product::class, 'category_id'],
    'order customer' => [Order::class, 'user_id'],
    'item order' => [OrderItem::class, 'order_id'],
    'payment order' => [Payment::class, 'order_id'],
    'token item' => [DownloadToken::class, 'order_item_id'],
]);

it('rejects an orphan product even through direct database writes', function (): void {
    $order = Order::factory()->create();

    expect(fn () => DB::table('order_items')->insert([
        'order_id' => $order->id,
        'product_id' => 999999999,
        'price' => '100.00',
    ]))->toThrow(QueryException::class);
});

it('protects referenced catalog and financial records from deletion', function (string $relation): void {
    $item = OrderItem::factory()->create();
    $item->load(['product.category', 'order.user']);

    $model = match ($relation) {
        'category' => $item->product->category,
        'product' => $item->product,
        'user' => $item->order->user,
    };

    expect(fn () => $model->delete())->toThrow(QueryException::class);
})->with(['category', 'product', 'user']);

it('protects orders that have gateway transactions', function (): void {
    $order = Order::factory()->create();
    Payment::factory()->for($order)->create();

    expect(fn () => $order->delete())->toThrow(QueryException::class);
});

it('cascades order deletion to its items and tokens', function (): void {
    $token = DownloadToken::factory()->create();
    $token->load('orderItem.order');
    $order = $token->orderItem->order;
    $productId = $token->orderItem->product_id;

    $order->delete();

    expect(OrderItem::query()->count())->toBe(0)
        ->and(DownloadToken::query()->count())->toBe(0)
        ->and(Product::query()->find($productId))->not->toBeNull();
});

it('cascades item deletion to its token', function (): void {
    $token = DownloadToken::factory()->create();
    $token->load('orderItem');
    $token->orderItem->delete();

    expect(DownloadToken::query()->count())->toBe(0);
});

it('applies safe database defaults without factory defaults', function (): void {
    $product = Product::factory()->make();
    $attributes = $product->getAttributes();
    unset($attributes['is_published']);
    $productId = DB::table('products')->insertGetId($attributes);

    $order = Order::factory()->make();
    $attributes = $order->getAttributes();
    unset($attributes['status']);
    $orderId = DB::table('orders')->insertGetId($attributes);

    $item = OrderItem::factory()->create(['order_id' => $orderId, 'product_id' => $productId]);
    $tokenId = DB::table('download_tokens')->insertGetId([
        'order_item_id' => $item->id,
        'token' => hash('sha256', random_bytes(32)),
        'expires_at' => now()->addMinutes(15),
    ]);

    expect(DB::table('products')->where('id', $productId)->value('is_published'))->toBeFalsy()
        ->and(DB::table('orders')->where('id', $orderId)->value('status'))->toBe('pending')
        ->and(DownloadToken::query()->findOrFail($tokenId)->download_count)->toBe(0)
        ->and(DownloadToken::query()->findOrFail($tokenId)->max_downloads)->toBe(5);
});

it('enforces status enums at the database boundary', function (string $model, string $column): void {
    $record = $model::factory()->create();

    expect(fn () => DB::table($record->getTable())->where('id', $record->id)->update([$column => 'invalid']))
        ->toThrow(QueryException::class);
})->with([
    'user role' => [User::class, 'role'],
    'order status' => [Order::class, 'status'],
    'payment status' => [Payment::class, 'transaction_status'],
    'file type' => [Product::class, 'file_type'],
]);
