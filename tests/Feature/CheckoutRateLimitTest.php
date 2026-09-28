<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

// Repeated real purchases must be throttled without duplicate Snap calls for an order.
it('allows ten real checkouts and rejects the eleventh before calling Snap', function (): void {
    $user = User::factory()->create();
    $products = Product::factory()->count(10)->create(['is_published' => true, 'price' => '100000.00']);
    config()->set('services.midtrans.server_key', 'test-checkout-key');
    config()->set('services.midtrans.is_production', false);
    Http::preventStrayRequests();
    Http::fake(['https://app.sandbox.midtrans.com/snap/v1/transactions' => function (Request $request): PromiseInterface {
        $number = $request['transaction_details']['order_id'];

        return Http::response(['token' => 'snap-'.$number, 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/'.$number]);
    }]);

    foreach ($products as $product) {
        $this->actingAs($user)->postJson('/checkout', ['product_id' => $product->id])
            ->assertCreated()->assertJsonPath('order.total_amount', '100000.00');
    }

    $this->actingAs($user)->postJson('/checkout', ['product_id' => $products->first()->id])->assertTooManyRequests();
    $this->assertDatabaseCount('orders', 10);
    $this->assertDatabaseCount('order_items', 10);
    Http::assertSentCount(10);
    $numbers = Http::recorded()->map(fn (array $pair): string => $pair[0]['transaction_details']['order_id']);
    expect($numbers->unique()->count())->toBe(10)
        ->and(Order::query()->whereNotNull('snap_token')->count())->toBe(10);
    fwrite(STDOUT, "CHECKOUT_CREATED=10 ELEVENTH_HTTP=429 SNAP_CALLS=10 DISTINCT_SNAP_ORDERS=10\n");
});
