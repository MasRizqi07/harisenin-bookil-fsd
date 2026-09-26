<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\OrderItem;
use App\Models\User;

class OrderItemPolicy
{
    public function download(User $user, OrderItem $item): bool
    {
        return $item->order->user_id === $user->id;
    }
}
