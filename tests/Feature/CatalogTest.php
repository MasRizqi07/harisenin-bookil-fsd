<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

it('displays published products on the storefront catalog', function (): void {
    $publishedProduct = Product::factory()->create([
        'title' => 'Mastering Laravel 13',
        'is_published' => true,
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.id', $publishedProduct->id)
    );
});

it('does not leak unpublished products on the catalog', function (): void {
    Product::factory()->create([
        'title' => 'Unpublished Draft Ebook',
        'is_published' => false,
    ]);
    Product::factory()->create([
        'title' => 'Published Ebook',
        'is_published' => true,
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Published Ebook')
    );
});

it('filters catalog products by category slug', function (): void {
    $techCategory = Category::factory()->create(['name' => 'Technology', 'slug' => 'technology', 'is_active' => true]);
    $cookCategory = Category::factory()->create(['name' => 'Cooking', 'slug' => 'cooking', 'is_active' => true]);

    $techProduct = Product::factory()->create([
        'category_id' => $techCategory->id,
        'title' => 'Modern PHP Guide',
        'is_published' => true,
    ]);
    Product::factory()->create([
        'category_id' => $cookCategory->id,
        'title' => 'Delicious Recipes',
        'is_published' => true,
    ]);

    $response = $this->get('/?category=technology');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.id', $techProduct->id)
    );
});

it('searches products by title and author', function (): void {
    $targetProduct = Product::factory()->create([
        'title' => 'Refactoring Systems',
        'author' => 'Martin Fowler',
        'is_published' => true,
    ]);
    Product::factory()->create([
        'title' => 'Design Patterns',
        'author' => 'Gang of Four',
        'is_published' => true,
    ]);

    $response = $this->get('/?search=Fowler');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.id', $targetProduct->id)
    );
});

it('displays product detail page for a published product', function (): void {
    $product = Product::factory()->create([
        'title' => 'Domain Driven Design with PHP',
        'is_published' => true,
    ]);

    $response = $this->get("/products/{$product->slug}");

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Products/Show')
            ->where('product.id', $product->id)
            ->where('product.title', 'Domain Driven Design with PHP')
    );
});

it('returns 404 for unpublished product detail page', function (): void {
    $product = Product::factory()->create([
        'is_published' => false,
    ]);

    $response = $this->get("/products/{$product->slug}");

    $response->assertNotFound();
});
