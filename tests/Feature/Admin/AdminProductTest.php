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

beforeEach(fn () => config()->set('filesystems.private_disk', 's3'));

it('displays products list on admin product index', function (): void {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['title' => 'Building Cloud APIs']);

    $response = $this->actingAs($admin)->get('/admin/products');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
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
    Storage::fake('s3');
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['is_published' => true]);
    Storage::disk('s3')->put($product->file_path, 'book');

    $response = $this->actingAs($admin)->patch("/admin/products/{$product->id}/toggle-publish");

    $response->assertRedirect();
    expect($product->fresh()->is_published)->toBeFalse();

    $this->actingAs($admin)->patch("/admin/products/{$product->id}/toggle-publish");
    expect($product->fresh()->is_published)->toBeTrue();
});

it('allows admin to update an existing product', function (): void {
    Storage::fake('s3');
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'title' => 'Original Book Title',
        'price' => '100000.00',
    ]);
    Storage::disk('s3')->put($product->file_path, 'book');

    $response = $this->actingAs($admin)->put("/admin/products/{$product->id}", [
        'category_id' => $product->category_id,
        'title' => 'Updated Book Title',
        'author' => $product->author,
        'price' => 125000,
        'file_type' => $product->file_type->value,
        'description' => 'Updated synopsis',
        'is_published' => true,
    ]);

    $response->assertRedirect('/admin/products');
    expect($product->fresh()->title)->toBe('Updated Book Title')
        ->and((string) $product->fresh()->price)->toBe('125000.00')
        ->and($product->fresh()->file_type->value)->toBe($product->file_type->value);
});

it('rejects creating a product without a private digital asset', function (): void {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $this->actingAs($admin)->post('/admin/products', [
        'category_id' => $category->id,
        'title' => 'Missing Asset',
        'author' => 'Jane Doe',
        'price' => 10000,
        'file_type' => 'pdf',
        'is_published' => true,
    ])->assertSessionHasErrors('digital_file');

    $this->assertDatabaseMissing('products', ['title' => 'Missing Asset']);
});

it('rejects a file whose extension differs from the selected product format', function (): void {
    Storage::fake('s3');
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $this->actingAs($admin)->post('/admin/products', [
        'category_id' => $category->id,
        'title' => 'Mismatched Asset',
        'author' => 'Jane Doe',
        'price' => 10000,
        'file_type' => 'epub',
        'digital_file' => UploadedFile::fake()->create('book.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('digital_file');

    $this->assertDatabaseMissing('products', ['title' => 'Mismatched Asset']);
});

it('rejects executable uploads as digital products', function (): void {
    Storage::fake('s3');
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $this->actingAs($admin)->post('/admin/products', [
        'category_id' => $category->id,
        'title' => 'Unsafe Upload',
        'author' => 'Jane Doe',
        'price' => 10000,
        'file_type' => 'pdf',
        'is_published' => true,
        'digital_file' => UploadedFile::fake()->create('payload.exe', 100, 'application/octet-stream'),
    ])->assertSessionHasErrors('digital_file');

    $this->assertDatabaseMissing('products', ['title' => 'Unsafe Upload']);
});

it('blocks publication when the private asset is missing', function (): void {
    Storage::fake('s3');
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['is_published' => false, 'file_path' => 'private/ebooks/missing.pdf']);

    $this->actingAs($admin)->patch("/admin/products/{$product->id}/toggle-publish")
        ->assertSessionHas('error');

    expect($product->refresh()->is_published)->toBeFalse();
});

it('does not allow replacing a private asset after a customer has purchased it', function (): void {
    Storage::fake('s3');
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['file_type' => 'pdf']);
    $order = Order::factory()->create();
    OrderItem::factory()->for($order)->for($product)->create();

    $this->actingAs($admin)->put("/admin/products/{$product->id}", [
        'category_id' => $product->category_id,
        'title' => $product->title,
        'author' => $product->author,
        'price' => $product->price,
        'file_type' => 'pdf',
        'digital_file' => UploadedFile::fake()->create('replacement.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors('digital_file');

    expect($product->refresh()->file_path)->not->toContain('replacement');
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
