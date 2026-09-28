<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

// A customer must not increase their own download allowance through the admin endpoint.
it('rejects customer entitlement extensions without changing quota or audit', function (): void {
    $token = DownloadToken::factory()->create();
    $this->actingAs($token->orderItem->order->user)->postJson(route('admin.entitlements.extend', $token->order_item_id), [
        'additional_downloads' => 3, 'additional_days' => 7, 'reason' => 'Replacement device',
    ])->assertForbidden();
    expect($token->refresh()->max_downloads)->toBe(5);
    $this->assertDatabaseCount('entitlement_extensions', 0);
});

// An approved support extension must preserve usage and record the administrator and exact deltas.
it('extends entitlement from the later of now and expiry with an audit row', function (bool $expired): void {
    $this->freezeSecond();
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $expiry = $expired ? now()->subDay() : now()->addDays(10);
    $token = DownloadToken::factory()->create(['expires_at' => $expiry, 'download_count' => 5]);
    $expected = ($expired ? now() : $expiry->copy())->addDays(7);

    $this->actingAs($admin)->post(route('admin.entitlements.extend', $token->order_item_id), [
        'additional_downloads' => 3, 'additional_days' => 7, 'reason' => 'Replacement device approved',
    ])->assertRedirect();
    expect($token->refresh()->max_downloads)->toBe(8)
        ->and($token->download_count)->toBe(5)
        ->and($token->expires_at->equalTo($expected))->toBeTrue();
    $this->assertDatabaseHas('entitlement_extensions', [
        'actor_id' => $admin->id, 'order_item_id' => $token->order_item_id,
        'additional_downloads' => 3, 'additional_days' => 7, 'reason' => 'Replacement device approved',
    ]);
    $this->assertDatabaseCount('entitlement_extensions', 1);
    fwrite(STDOUT, 'EXTENSION_EXPIRED='.(int) $expired." MAX_DOWNLOADS=5->8 USED_DOWNLOADS=5 AUDIT_ROWS=1\n");
})->with([false, true]);

// A support action must not reinstate a reversed or unpaid purchase.
it('rejects extensions for a non-paid order', function (): void {
    $item = OrderItem::factory()->for(Order::factory()->failed())->create();
    $token = DownloadToken::factory()->create(['order_item_id' => $item->id]);
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $this->actingAs($admin)->postJson(route('admin.entitlements.extend', $item), [
        'additional_downloads' => 1, 'additional_days' => 0, 'reason' => 'Invalid reinstatement',
    ])->assertUnprocessable()->assertJsonValidationErrors('reason');
    expect($token->refresh()->max_downloads)->toBe(5);
    $this->assertDatabaseCount('entitlement_extensions', 0);
});

// An empty or negative support adjustment must not create misleading audit history.
it('rejects an empty extension and negative download deltas', function (int $downloads): void {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    $token = DownloadToken::factory()->create();
    $this->actingAs($admin)->postJson(route('admin.entitlements.extend', $token->order_item_id), [
        'additional_downloads' => $downloads, 'additional_days' => 0, 'reason' => 'Invalid adjustment',
    ])->assertUnprocessable()->assertJsonValidationErrors('additional_downloads');
    $this->assertDatabaseCount('entitlement_extensions', 0);
})->with([0, -1]);
