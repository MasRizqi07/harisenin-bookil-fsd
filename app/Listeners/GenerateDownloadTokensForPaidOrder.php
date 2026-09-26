<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaidEvent;
use App\Models\DownloadToken;

class GenerateDownloadTokensForPaidOrder
{
    /**
     * Handle the event.
     */
    public function handle(OrderPaidEvent $event): void
    {
        $order = $event->order;
        $order->loadMissing('items.downloadToken');

        foreach ($order->items as $item) {
            if ($item->downloadToken !== null) {
                continue;
            }

            DownloadToken::firstOrCreate(
                ['order_item_id' => $item->id],
                [
                    'expires_at' => now()->addDays(30),
                    'download_count' => 0,
                    'max_downloads' => 5,
                ]
            );
        }
    }
}
