<?php

declare(strict_types=1);

use App\Events\OrderPaidEvent;
use App\Mail\OrderReceipt;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

uses(TestCase::class);

// A rolled-back settlement must send no email, while entitlement creation stays inside the transaction.
it('queues the receipt only after the real outer transaction commits', function (bool $commit): void {
    $this->artisan('migrate')->assertSuccessful();
    config()->set('queue.default', 'sync');
    Mail::fake();
    $item = OrderItem::factory()->for(Order::factory()->paid())->create();
    $order = $item->order;
    $product = $item->product;
    $category = $product->category;
    $user = $order->user;

    try {
        DB::beginTransaction();
        OrderPaidEvent::dispatch($order);
        expect(DownloadToken::query()->where('order_item_id', $item->id)->exists())->toBeTrue();
        Mail::assertNothingSent();
        if ($commit) {
            DB::commit();
            Mail::assertSentCount(1);
            Mail::assertSent(OrderReceipt::class);
        } else {
            DB::rollBack();
            Mail::assertNothingSent();
            expect(DownloadToken::query()->where('order_item_id', $item->id)->exists())->toBeFalse();
        }
        fwrite(STDOUT, 'REAL_TRANSACTION='.($commit ? 'COMMIT' : 'ROLLBACK').' RECEIPTS_BEFORE=0 RECEIPTS_AFTER='.(int) $commit."\n");
    } finally {
        if (DB::transactionLevel() > 0) {
            DB::rollBack();
        }
        $order->delete();
        $product->delete();
        $category->delete();
        $user->delete();
    }
})->with([true, false]);
