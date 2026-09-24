<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('displays category listing for admin', function (): void {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['name' => 'Data Science']);

    $response = $this->actingAs($admin)->get('/admin/categories');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('Admin/Categories/Index')
            ->has('categories', 1)
            ->where('categories.0.id', $category->id)
    );
});

it('allows admin to store a new category', function (): void {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/categories', [
        'name' => 'Cyber Security',
        'slug' => 'cyber-security',
        'description' => 'Security engineering and penetration testing.',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', [
        'name' => 'Cyber Security',
        'slug' => 'cyber-security',
    ]);
});

it('allows admin to update category', function (): void {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['name' => 'Old Category']);

    $response = $this->actingAs($admin)->put("/admin/categories/{$category->id}", [
        'name' => 'Renamed Category',
        'slug' => 'renamed-category',
        'description' => 'Updated description.',
        'is_active' => false,
    ]);

    $response->assertRedirect();
    expect($category->fresh()->name)->toBe('Renamed Category')
        ->and($category->fresh()->is_active)->toBeFalse();
});

it('prevents deletion of category if it contains products', function (): void {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs($admin)->delete("/admin/categories/{$category->id}");

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

it('allows deletion of category if it contains no products', function (): void {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/categories/{$category->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
