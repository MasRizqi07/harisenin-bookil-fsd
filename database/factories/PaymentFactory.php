<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'external_transaction_id' => (string) Str::uuid(),
            'payment_type' => 'bank_transfer',
            'gross_amount' => fn (array $attributes): string => Order::query()
                ->findOrFail($attributes['order_id'])->total_amount,
            'transaction_status' => PaymentStatus::PENDING,
            'raw_response' => [],
            'paid_at' => null,
        ];
    }
}
