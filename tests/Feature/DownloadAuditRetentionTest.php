<?php

declare(strict_types=1);

use App\Models\DownloadAttempt;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\WebhookNotification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

beforeEach(function (): void {
    $this->freezeTime();
    Storage::fake('s3');
    config()->set('filesystems.private_disk', 's3');
});

// An authenticated attacker must not create an audit row for every forged request.
it('bounds audit writes for 200 bad signatures without consuming quota', function (): void {
    $user = User::factory()->create();
    $item = OrderItem::factory()->for(Order::factory()->for($user)->paid())->create();
    $quota = DownloadToken::factory()->create(['order_item_id' => $item->id]);

    for ($attempt = 0; $attempt < 200; $attempt++) {
        $this->actingAs($user)->get('/downloads/'.$item->id.'?signature=invalid')
            ->assertStatus($attempt < 30 ? 403 : 429);
    }

    $signatureRows = DownloadAttempt::query()->where('outcome', 'denied_signature')->count();
    $throttledRows = DownloadAttempt::query()->where('outcome', 'denied_throttled')->count();
    expect($signatureRows)->toBe(1)->and($throttledRows)->toBe(1)
        ->and($quota->refresh()->download_count)->toBe(0);
    fwrite(STDOUT, "BAD_SIGNATURE_REQUESTS=200 DENIED_SIGNATURE_ROWS={$signatureRows} DENIED_THROTTLED_ROWS={$throttledRows} QUOTA=0\n");
});

// Repeated valid links after the rate limit must not grow the audit table or consume quota.
it('records only one denial for 100 throttled requests and preserves quota', function (): void {
    $user = User::factory()->create();
    $product = Product::factory()->create(['file_path' => 'private/ebooks/audit.pdf']);
    $item = OrderItem::factory()->for(Order::factory()->for($user)->paid())->for($product)->create();
    $quota = DownloadToken::factory()->create(['order_item_id' => $item->id, 'max_downloads' => 200]);
    Storage::disk('s3')->put($product->file_path, 'fixture');
    $url = URL::temporarySignedRoute('downloads.process', now()->addMinutes(15), ['orderItem' => $item->id]);
    for ($attempt = 0; $attempt < 30; $attempt++) {
        $this->actingAs($user)->get($url)->assertRedirect();
    }
    for ($attempt = 0; $attempt < 100; $attempt++) {
        $this->actingAs($user)->get($url)->assertTooManyRequests();
    }

    $rows = DownloadAttempt::query()->where('outcome', 'denied_throttled')->count();
    expect($rows)->toBe(1)->and($quota->refresh()->download_count)->toBe(30);
    fwrite(STDOUT, "THROTTLED_REQUESTS=100 DENIED_THROTTLED_ROWS={$rows} QUOTA_BEFORE=30 QUOTA_AFTER=30\n");
});

// Rotating nonexistent item IDs must not bypass the shared customer rate limit.
it('shares a throttle bucket across 50 nonexistent item ids', function (): void {
    $user = User::factory()->create();
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $this->actingAs($user)->get('/downloads/'.(1000000000 + $attempt).'?signature=invalid')
            ->assertStatus($attempt < 30 ? 403 : 429);
    }
    expect(DownloadAttempt::query()->count())->toBe(2);
    fwrite(STDOUT, "ROTATED_IDS=50 THROTTLED_RESPONSES=20 AUDIT_ROWS=2\n");
});

// Retention must delete expired audit data while preserving recent records and financial history.
it('prunes old audit rows while retaining recent rows and financial records', function (): void {
    $order = Order::factory()->paid()->create();
    $item = OrderItem::factory()->for($order)->create();
    Payment::factory()->for($order)->create();
    foreach ([91, 89] as $days) {
        DownloadAttempt::query()->create(['order_item_id' => $item->id, 'outcome' => 'granted', 'attempted_at' => now()->subDays($days)]);
    }
    foreach ([181, 179] as $days) {
        WebhookNotification::query()->forceCreate([
            'order_id' => $order->id, 'external_transaction_id' => 'retention-test',
            'event_key' => hash('sha256', (string) $days), 'transaction_status' => 'settlement',
            'payload' => [], 'result' => 'processed', 'created_at' => now()->subDays($days),
        ]);
    }

    $this->artisan('model:prune')->assertExitCode(0);
    $this->assertDatabaseCount('download_attempts', 1);
    $this->assertDatabaseCount('webhook_notifications', 1);
    $this->assertDatabaseCount('payments', 1);
    $this->assertDatabaseCount('orders', 1);
    $this->assertDatabaseCount('order_items', 1);
    fwrite(STDOUT, "PRUNE_DOWNLOAD_ROWS=2->1 PRUNE_WEBHOOK_ROWS=2->1 PAYMENTS=1 ORDERS=1 ITEMS=1\n");
});
