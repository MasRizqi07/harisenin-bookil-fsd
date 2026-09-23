<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\DownloadTokenFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DownloadToken extends Model
{
    /** @use HasFactory<DownloadTokenFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'order_item_id',
        'token',
        'expires_at',
        'download_count',
        'max_downloads',
    ];

    /** @var list<string> */
    protected $hidden = ['token'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'expires_at' => 'immutable_datetime',
            'download_count' => 'integer',
            'max_downloads' => 'integer',
        ];
    }

    /** @return BelongsTo<OrderItem, $this> */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
