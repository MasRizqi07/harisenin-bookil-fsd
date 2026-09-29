<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

// A buyer must receive the local PDF as a download instead of a browser-blocked inline document.
it('serves a signed local PDF as an attachment with its security headers intact', function (): void {
    $path = 'browser-regression/'.Str::uuid().'.pdf';
    $contents = "%PDF-1.4\nBrowser regression fixture\n%%EOF\n";
    $disk = Storage::disk('local');
    $disk->put($path, $contents);

    try {
        $this->get($disk->temporaryUrl($path, now()->addMinutes(15)))
            ->assertOk()
            ->assertDownload(basename($path))
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
            ->assertStreamedContent($contents);
    } finally {
        $disk->delete($path);
    }
});

// An attacker must not bypass the local asset signature after attachment delivery is enabled.
it('rejects a tampered local asset signature without returning the PDF', function (): void {
    $path = 'browser-regression/'.Str::uuid().'.pdf';
    $disk = Storage::disk('local');
    $disk->put($path, '%PDF-1.4 private fixture');

    try {
        $url = preg_replace('/signature=[a-f0-9]+/', 'signature='.str_repeat('0', 64), $disk->temporaryUrl($path, now()->addMinutes(15)));

        $this->get($url)->assertForbidden()->assertDontSee('private fixture');
    } finally {
        $disk->delete($path);
    }
});

// A gateway outage must not hide the purchased product details when a customer views a pending invoice.
it('keeps pending invoice product metadata when Snap is unavailable', function (): void {
    config(['services.midtrans.server_key' => 'qa-test-server-key']);
    Http::fake(['app.sandbox.midtrans.com/*' => Http::response([], 500)]);
    Http::preventStrayRequests();
    $customer = User::factory()->create();
    $product = Product::factory()->published()->create();
    $order = Order::factory()->pending()->for($customer)->create(['total_amount' => $product->price]);
    OrderItem::factory()->for($order)->for($product)->create(['price' => $product->price]);

    $this->actingAs($customer)->get(route('orders.show', $order->order_number))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('Orders/Show')
            ->where('snapToken', null)
            ->where('order.items.0.product.title', $product->title)
            ->where('order.items.0.product.author', $product->author)
            ->has('order.items.0.product.category'));

    Http::assertSentCount(1);
    expect($order->fresh()->status)->toBe(OrderStatus::PENDING);
    $this->assertDatabaseCount('payments', 0);
});

// An admin leaving the description empty must receive validation errors instead of a database constraint failure.
it('rejects an empty product description before writing to the database', function (string $operation): void {
    Storage::fake('local');
    config(['filesystems.private_disk' => 'local']);
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $originalDescription = $product->description;
    $data = [
        'category_id' => $product->category_id,
        'title' => 'Browser validation fixture',
        'author' => 'QA author',
        'description' => '',
        'price' => '99000',
        'file_type' => 'pdf',
        'is_published' => false,
        'digital_file' => UploadedFile::fake()->create('book.pdf', 10, 'application/pdf'),
    ];

    $response = $operation === 'create'
        ? $this->actingAs($admin)->postJson(route('admin.products.store'), $data)
        : $this->actingAs($admin)->putJson(route('admin.products.update', $product), $data);

    $response->assertUnprocessable()->assertJsonValidationErrors('description');
    $this->assertDatabaseCount('products', 1);
    expect($product->fresh()->description)->toBe($originalDescription);
})->with(['create', 'update']);

// A reader using different capitalization must find published books without discovering matching drafts.
it('finds published catalog entries regardless of search capitalization', function (string $field): void {
    $product = Product::factory()->published()->create([$field => 'Laravel Browser Fixture']);
    Product::factory()->create([$field => 'Laravel Browser Fixture Draft', 'is_published' => false]);

    $this->get(route('products.index', ['search' => 'laravel browser']))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.id', $product->id));
})->with(['title', 'author', 'description']);
