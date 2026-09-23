<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\FileType;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'title' => fake()->sentence(4),
            'slug' => fake()->unique()->slug(),
            'author' => fake()->name(),
            'description' => fake()->paragraph(),
            'price' => (string) fake()->numberBetween(10000, 500000).'.00',
            'cover_image_path' => null,
            'file_path' => 'products/'.Str::uuid().'/book.pdf',
            'file_type' => FileType::PDF,
            'file_size' => fake()->numberBetween(1024, 10485760),
            'is_published' => false,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes): array => ['is_published' => true]);
    }
}
