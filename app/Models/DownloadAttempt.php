<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DownloadAttempt extends Model
{
    use MassPrunable;

    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = [
        'user_id', 'order_item_id', 'download_token_id',
        'access_signature_hash', 'ip_address', 'outcome', 'attempted_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['attempted_at' => 'immutable_datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('attempted_at', '<', now()->subDays(90));
    }

    /** @return BelongsTo<OrderItem, $this> */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /** @return BelongsTo<DownloadToken, $this> */
    public function downloadToken(): BelongsTo
    {
        return $this->belongsTo(DownloadToken::class);
    }
}
