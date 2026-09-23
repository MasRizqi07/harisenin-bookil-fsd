<?php

declare(strict_types=1);

namespace Tests\Feature;

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

    $rawToken = Str::random(64);
    $downloadToken = DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
        'download_count' => 0,
        'max_downloads' => 5,
        'expires_at' => now()->addDays(14),
    ]);

    $response = $this->actingAs($user)->get("/downloads/{$rawToken}");

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('architecture.pdf')
        ->and($downloadToken->refresh()->download_count)->toBe(1);
});

it('returns 403 when a user attempts to download an item they do not own', function (): void {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $order = Order::factory()->for($owner)->paid()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
    ]);

    $response = $this->actingAs($intruder)->get("/downloads/{$rawToken}");

    $response->assertForbidden();
});

it('returns 403 when attempting to download an unpaid order item', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->pending()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
    ]);

    $response = $this->actingAs($user)->get("/downloads/{$rawToken}");

    $response->assertForbidden();
});

it('returns 410 when attempting to download with an expired token', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($user)->get("/downloads/{$rawToken}");

    $response->assertStatus(410);
});

it('returns 429 when maximum download quota has been exceeded', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->paid()->create();
    $orderItem = OrderItem::factory()->for($order)->create();

    $rawToken = Str::random(32);
    DownloadToken::factory()->create([
        'order_item_id' => $orderItem->id,
        'token' => hash('sha256', $rawToken),
        'download_count' => 5,
        'max_downloads' => 5,
    ]);

    $response = $this->actingAs($user)->get("/downloads/{$rawToken}");

    $response->assertStatus(429);
});

it('returns 404 for a non-existent download token', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/downloads/non_existent_token_123');

    $response->assertNotFound();
});

