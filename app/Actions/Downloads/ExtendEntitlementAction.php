<?php

declare(strict_types=1);

namespace App\Actions\Downloads;

use App\Enums\OrderStatus;
use App\Models\DownloadToken;
use App\Models\EntitlementExtension;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ExtendEntitlementAction
{
    public function execute(User $actor, OrderItem $item, int $downloads, int $days, string $reason): DownloadToken
    {
        Gate::forUser($actor)->authorize('viewAnyAsAdmin', Order::class);

        if ($downloads < 0 || $days < 0 || $downloads + $days === 0 || trim($reason) === '') {
            throw ValidationException::withMessages(['reason' => 'Provide a reason and a positive extension.']);
        }

        return DB::transaction(function () use ($actor, $item, $downloads, $days, $reason): DownloadToken {
            $order = Order::query()->lockForUpdate()->findOrFail($item->order_id);
            $token = DownloadToken::query()->where('order_item_id', $item->id)->lockForUpdate()->first();

            if ($order->status !== OrderStatus::PAID || $token === null) {
                throw ValidationException::withMessages(['reason' => 'Only a paid item with an existing entitlement can be extended.']);
            }

            $token->max_downloads += $downloads;
            if ($days > 0) {
                $token->expires_at = ($token->expires_at->isFuture() ? $token->expires_at : now())->addDays($days);
            }
            $token->save();

            EntitlementExtension::query()->create([
                'actor_id' => $actor->id, 'order_item_id' => $item->id,
                'additional_downloads' => $downloads, 'additional_days' => $days, 'reason' => trim($reason),
            ]);

            return $token;
        }, 3);
    }
}
