<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class BookilCatalogSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'ebooks' => 'E-Books',
            'templates' => 'Templates',
            'digital-resources' => 'Digital Resources',
        ] as $slug => $name) {
            Category::query()->firstOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'description' => null, 'is_active' => true],
            );
        }
    }
}
