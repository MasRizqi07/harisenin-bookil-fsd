<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\FileType;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'author',
        'description',
        'price',
        'cover_image_path',
        'file_path',
        'file_type',
        'file_size',
        'is_published',
    ];

    /** @var list<string> */
    protected $hidden = ['file_path'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'file_type' => FileType::class,
            'file_size' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
