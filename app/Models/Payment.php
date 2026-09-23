<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'order_id',
        'external_transaction_id',
        'payment_type',
        'gross_amount',
        'transaction_status',
        'raw_response',
        'paid_at',
    ];

    /** @var list<string> */
    protected $hidden = ['raw_response'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'transaction_status' => PaymentStatus::class,
            'raw_response' => 'array',
            'paid_at' => 'immutable_datetime',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
