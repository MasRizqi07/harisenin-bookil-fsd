<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderPaidEvent;
use App\Mail\OrderReceipt;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Support\Facades\Mail;

class SendOrderReceipt implements ShouldQueueAfterCommit
{
    public function handle(OrderPaidEvent $event): void
    {
        $order = $event->order->refresh()->loadMissing(['user', 'items.product']);

        if ($order->status === OrderStatus::PAID) {
            Mail::to($order->user->email)->send(new OrderReceipt($order));
        }
    }
}
