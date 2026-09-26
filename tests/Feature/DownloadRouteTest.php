<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\DownloadAttempt;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

beforeEach(function (): void {
    Storage::fake('s3');
    config()->set('filesystems.private_disk', 's3');
});

it('requires authentication to access digital downloads', function (): void {
    $response = $this->get('/downloads/some-token-value');

    $response->assertRedirect('/login');
});

it('redirects to the private presigned URL for an authorized customer', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $product = Product::factory()->create([
        'file_path' => 'private/ebooks/architecture.pdf',
    ]);
    $orderItem = OrderItem::factory()->for($order)->for($product)->create();
    Storage::disk('s3')->put($product->file_path, 'book');

    $downloadToken = DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'download_count' => 0,
        'max_downloads' => 5,
        'expires_at' => now()->addDays(14),
    ]);

    $response = $this->actingAs($user)->get(URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $orderItem->id]));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('architecture.pdf')
        ->and($downloadToken->refresh()->download_count)->toBe(1)
        ->and(DownloadAttempt::query()->where('user_id', $user->id)->where('outcome', 'granted')->count())->toBe(1);
});

it('returns 403 when a user attempts to download an item they do not own', function (): void {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $order = Order::factory()->for($owner)->paid()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
    ]);

    $response = $this->actingAs($intruder)->get(URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $orderItem->id]));

    $response->assertForbidden();
    $this->assertDatabaseHas('download_attempts', ['user_id' => $intruder->id, 'outcome' => 'denied_owner']);
});

it('returns 403 when attempting to download an unpaid order item', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->pending()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
    ]);

    $response = $this->actingAs($user)->get(URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $orderItem->id]));

    $response->assertForbidden();
});

it('returns 410 when attempting to download with an expired entitlement', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($user)->get(URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $orderItem->id]));

    $response->assertStatus(410);
});

it('returns 429 when maximum download quota has been exceeded', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'download_count' => 5,
        'max_downloads' => 5,
    ]);

    $response = $this->actingAs($user)->get(URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $orderItem->id]));

    $response->assertStatus(429);
});

it('rejects unsigned download URLs', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/downloads/999999');

    $response->assertForbidden();
});

it('rejects a hand-edited signature without charging quota', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $item = OrderItem::factory()->for($order)->create();
    $quota = DownloadToken::factory()->create(['order_item_id' => $item->id]);
    $url = URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $item->id]);

    $this->actingAs($user)->get(str_replace('signature=', 'signature=x', $url))->assertForbidden();

    expect($quota->refresh()->download_count)->toBe(0);
});

it('rejects an expired route signature before charging the download quota', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $item = OrderItem::factory()->for($order)->create();
    $token = DownloadToken::factory()->create(['order_item_id' => $item->id]);
    $url = URL::temporarySignedRoute('downloads.process', now()->addMinute(), ['orderItem' => $item->id]);

    $this->travel(2)->minutes();
    $this->actingAs($user)->get($url)->assertForbidden();

    expect($token->refresh()->download_count)->toBe(0);
});
