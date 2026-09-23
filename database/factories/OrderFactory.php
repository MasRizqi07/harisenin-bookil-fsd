<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Order> */
class OrderFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'order_number' => 'BK-' . Str::ulid(),
            'user_id' => User::factory(),
            // A bare order has no line items. Set a matching total when attaching items.
            'total_amount' => '0.00',
            'status' => OrderStatus::PENDING,
            'payment_method' => null,
            'notes' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes): array => ['status' => OrderStatus::PENDING]);
    }

    public function paid(): static
    {
        return $this->state(fn(array $attributes): array => ['status' => OrderStatus::PAID]);
    }

    public function failed(): static
    {
        return $this->state(fn(array $attributes): array => ['status' => OrderStatus::FAILED]);
    }

    public function expired(): static
    {
        return $this->state(fn(array $attributes): array => ['status' => OrderStatus::EXPIRED]);
    }
}
