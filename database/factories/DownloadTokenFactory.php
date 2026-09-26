<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DownloadToken> */
class DownloadTokenFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'order_item_id' => OrderItem::factory()->for(Order::factory()->paid()),
            'expires_at' => now()->addMinutes(15),
            'download_count' => 0,
            'max_downloads' => 5,
        ];
    }
}
