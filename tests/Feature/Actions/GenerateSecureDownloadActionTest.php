<?php

declare(strict_types=1);

namespace Tests\Feature\Actions;

use App\Actions\Downloads\GenerateSecureDownloadAction;
use App\Exceptions\DownloadQuotaExceededException;
use App\Exceptions\DownloadTokenExpiredException;
use App\Exceptions\InvalidDownloadTokenException;
use App\Exceptions\OrderNotPaidException;
use App\Exceptions\UnauthorizedDownloadException;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('s3');
    config()->set('filesystems.private_disk', 's3');
});

it('issues a private URL and records one granted attempt for a paid owner', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create(['file_path' => 'private/ebooks/book.pdf']);
    $item = OrderItem::factory()->for($order)->for($product)->create();
    $quota = DownloadToken::factory()->create(['order_item_id' => $item->id]);
    Storage::disk('s3')->put($product->file_path, 'book');

    $url = app(GenerateSecureDownloadAction::class)->execute($user, $item->id, '127.0.0.1');

    expect($url)->toContain('book.pdf')->and($quota->refresh()->download_count)->toBe(1);
    $this->assertDatabaseHas('download_attempts', [
        'user_id' => $user->id, 'order_item_id' => $item->id,
        'ip_address' => '127.0.0.1', 'outcome' => 'granted',
    ]);
});

it('rejects a different customer even when they know the purchased item id', function (): void {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $item = OrderItem::factory()->for(Order::factory()->for($owner)->paid())->create();
    DownloadToken::factory()->create(['order_item_id' => $item->id]);

    expect(fn () => app(GenerateSecureDownloadAction::class)->execute($intruder, $item->id))
        ->toThrow(UnauthorizedDownloadException::class);
});

it('rejects an unpaid item even with an active quota record', function (): void {
    $user = User::factory()->create();
    $item = OrderItem::factory()->for(Order::factory()->for($user)->pending())->create();
    DownloadToken::factory()->create(['order_item_id' => $item->id]);

    expect(fn () => app(GenerateSecureDownloadAction::class)->execute($user, $item->id))
        ->toThrow(OrderNotPaidException::class);
});

it('rejects an expired entitlement', function (): void {
    $user = User::factory()->create();
    $item = OrderItem::factory()->for(Order::factory()->for($user)->paid())->create();
    DownloadToken::factory()->create(['order_item_id' => $item->id, 'expires_at' => now()->subMinute()]);

    expect(fn () => app(GenerateSecureDownloadAction::class)->execute($user, $item->id))
        ->toThrow(DownloadTokenExpiredException::class);
});

it('rejects an exhausted quota without incrementing it', function (): void {
    $user = User::factory()->create();
    $item = OrderItem::factory()->for(Order::factory()->for($user)->paid())->create();
    $quota = DownloadToken::factory()->create([
        'order_item_id' => $item->id, 'download_count' => 5, 'max_downloads' => 5,
    ]);

    expect(fn () => app(GenerateSecureDownloadAction::class)->execute($user, $item->id))
        ->toThrow(DownloadQuotaExceededException::class);
    expect($quota->refresh()->download_count)->toBe(5);
});

it('rejects an item without an entitlement record', function (): void {
    expect(fn () => app(GenerateSecureDownloadAction::class)->execute(User::factory()->create(), 999999))
        ->toThrow(InvalidDownloadTokenException::class);
});

it('does not consume quota when the private asset is missing', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create(['file_path' => 'private/ebooks/missing.pdf']);
    $item = OrderItem::factory()->for($order)->for($product)->create();
    $quota = DownloadToken::factory()->create(['order_item_id' => $item->id]);

    expect(fn () => app(GenerateSecureDownloadAction::class)->execute($user, $item->id))
        ->toThrow(\RuntimeException::class);

    expect($quota->refresh()->download_count)->toBe(0);
    $this->assertDatabaseHas('download_attempts', ['user_id' => $user->id, 'outcome' => 'storage_error']);
});
