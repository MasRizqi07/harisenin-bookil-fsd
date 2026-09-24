<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('displays products list on admin product index', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['title' => 'Building Cloud APIs']);

    $response = $this->actingAs($admin)->get('/admin/products');

    $response->assertOk();
    $response->assertInertia(
        fn(Assert $page) => $page
            ->component('Admin/Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.id', $product->id)
    );
});

it('allows admin to create a new e-book with cover image and digital file', function (): void {
    Storage::fake('public');
    Storage::fake('local');
    Storage::fake('s3');

    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $cover = UploadedFile::fake()->image('cover.jpg', 600, 800);
    $digitalFile = UploadedFile::fake()->create('book.pdf', 1024, 'application/pdf');

    $response = $this->actingAs($admin)->post('/admin/products', [
        'category_id' => $category->id,
        'title' => 'Architecting High Throughput Systems',
        'author' => 'Jane Doe',
        'price' => 199000,
        'file_type' => 'pdf',
        'description' => 'A comprehensive book on systems architecture.',
        'is_published' => true,
        'cover_image' => $cover,
        'digital_file' => $digitalFile,
    ]);

    $response->assertRedirect('/admin/products');
    $this->assertDatabaseHas('products', [
        'title' => 'Architecting High Throughput Systems',
        'author' => 'Jane Doe',
        'price' => '199000.00',
        'file_type' => 'pdf',
        'is_published' => true,
    ]);
});

it('allows admin to toggle publish state of an e-book', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['is_published' => true]);

    $response = $this->actingAs($admin)->patch("/admin/products/{$product->id}/toggle-publish");

    $response->assertRedirect();
    expect($product->fresh()->is_published)->toBeFalse();

    $this->actingAs($admin)->patch("/admin/products/{$product->id}/toggle-publish");
    expect($product->fresh()->is_published)->toBeTrue();
});

it('allows admin to update an existing product', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'title' => 'Original Book Title',
        'price' => '100000.00',
    ]);

    $response = $this->actingAs($admin)->put("/admin/products/{$product->id}", [
        'category_id' => $product->category_id,
        'title' => 'Updated Book Title',
        'author' => $product->author,
        'price' => 125000,
        'file_type' => 'epub',
        'description' => 'Updated synopsis',
        'is_published' => true,
    ]);

    $response->assertRedirect('/admin/products');
    expect($product->fresh()->title)->toBe('Updated Book Title')
        ->and((string) $product->fresh()->price)->toBe('125000.00')
        ->and($product->fresh()->file_type->value)->toBe('epub');
});

it('prevents deletion of products that have been purchased by customers', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->create();

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    $response = $this->actingAs($admin)->delete("/admin/products/{$product->id}");

    $response->assertRedirect();
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});

it('allows deletion of products with no transaction history', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/products/{$product->id}");

    $response->assertRedirect('/admin/products');
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});
