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
use Illuminate\Support\Str;

beforeEach(function (): void {
    Storage::fake('s3');
    config()->set('filesystems.private_disk', 's3');
});

it('generates a 15-minute temporary presigned URL and increments download count', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create([
        'file_path' => 'private/ebooks/mastering-laravel.pdf',
    ]);
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();

    $rawToken = Str::random(64);
    $tokenHash = hash('sha256', $rawToken);

    $downloadToken = DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => $tokenHash,
        'download_count' => 0,
        'max_downloads' => 5,
        'expires_at' => now()->addDays(7),
    ]);

    $action = app(GenerateSecureDownloadAction::class);
    $url = $action->execute($user, $rawToken);

    expect($url)->toBeString()
        ->and($url)->toContain('mastering-laravel.pdf')
        ->and($downloadToken->refresh()->download_count)->toBe(1);
});

it('resolves download when passed the stored token hash directly', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create(['file_path' => 'private/ebooks/book.epub']);
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();

    $tokenHash = hash('sha256', Str::random(32));
    $downloadToken = DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => $tokenHash,
        'download_count' => 0,
        'max_downloads' => 5,
    ]);

    $action = app(GenerateSecureDownloadAction::class);
    $url = $action->execute($user, $tokenHash);

    expect($url)->toBeString()
        ->and($downloadToken->refresh()->download_count)->toBe(1);
});

it('rejects download attempts by unauthorized users', function (): void {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();

    $order = Order::factory()->for($owner)->paid()->create();
    $product = Product::factory()->create();
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
    ]);

    $action = app(GenerateSecureDownloadAction::class);

    expect(fn () => $action->execute($intruder, $rawToken))
        ->toThrow(UnauthorizedDownloadException::class);
});

it('rejects downloads for unpaid orders', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->pending()->create();
    $product = Product::factory()->create();
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
    ]);

    $action = app(GenerateSecureDownloadAction::class);

    expect(fn () => $action->execute($user, $rawToken))
        ->toThrow(OrderNotPaidException::class);
});

it('rejects downloads when token has expired', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create();
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
        'expires_at' => now()->subMinute(),
    ]);

    $action = app(GenerateSecureDownloadAction::class);

    expect(fn () => $action->execute($user, $rawToken))
        ->toThrow(DownloadTokenExpiredException::class);
});

it('rejects downloads when maximum download quota is exhausted', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create();
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
        'download_count' => 5,
        'max_downloads' => 5,
    ]);

    $action = app(GenerateSecureDownloadAction::class);

    expect(fn () => $action->execute($user, $rawToken))
        ->toThrow(DownloadQuotaExceededException::class);
});

it('rejects download attempts with invalid or non-existent token', function (): void {
    $user = User::factory()->create();
    $action = app(GenerateSecureDownloadAction::class);

    expect(fn () => $action->execute($user, 'completely_unknown_token'))
        ->toThrow(InvalidDownloadTokenException::class);
});
