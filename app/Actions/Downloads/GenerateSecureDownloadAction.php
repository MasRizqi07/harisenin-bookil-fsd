<?php

declare(strict_types=1);

namespace App\Actions\Downloads;

use App\Enums\OrderStatus;
use App\Exceptions\DownloadQuotaExceededException;
use App\Exceptions\DownloadTokenExpiredException;
use App\Exceptions\InvalidDownloadTokenException;
use App\Exceptions\OrderNotPaidException;
use App\Exceptions\UnauthorizedDownloadException;
use App\Models\DownloadAttempt;
use App\Models\DownloadToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class GenerateSecureDownloadAction
{
    public function execute(User $user, int $orderItemId, ?string $ipAddress = null, ?string $signatureHash = null): string
    {
        try {
            return DB::transaction(function () use ($user, $orderItemId, $ipAddress, $signatureHash): string {
                $token = DownloadToken::query()->where('order_item_id', $orderItemId)
                    ->lockForUpdate()->first();

                if ($token === null) {
                    throw new InvalidDownloadTokenException('Download entitlement was not found.');
                }

                $item = $token->orderItem()->with(['order', 'product'])->firstOrFail();

                if (Gate::forUser($user)->denies('download', $item)) {
                    throw new UnauthorizedDownloadException('You do not own this purchased product.');
                }

                if ($item->order->status !== OrderStatus::PAID) {
                    throw new OrderNotPaidException('Order is not paid or settled.');
                }

                if ($token->expires_at->isPast()) {
                    throw new DownloadTokenExpiredException('Download entitlement has expired.');
                }

                if ($token->download_count >= $token->max_downloads) {
                    throw new DownloadQuotaExceededException('Maximum download quota exceeded for this item.');
                }

                $disk = Storage::disk((string) config('filesystems.private_disk'));
                if (! $disk->exists($item->product->file_path)) {
                    throw new RuntimeException('The private digital asset is unavailable.');
                }

                $url = $disk->temporaryUrl($item->product->file_path, now()->addMinutes(15));

                $token->increment('download_count');
                DownloadAttempt::query()->create([
                    'user_id' => $user->id,
                    'order_item_id' => $item->id,
                    'download_token_id' => $token->id,
                    'access_signature_hash' => $signatureHash,
                    'ip_address' => $ipAddress,
                    'outcome' => 'granted',
                    'attempted_at' => now(),
                ]);

                return $url;
            }, attempts: 3);
        } catch (Throwable $exception) {
            DownloadAttempt::query()->create([
                'user_id' => $user->id,
                'order_item_id' => null,
                'download_token_id' => null,
                'access_signature_hash' => $signatureHash,
                'ip_address' => $ipAddress,
                'outcome' => match (true) {
                    $exception instanceof UnauthorizedDownloadException => 'denied_owner',
                    $exception instanceof OrderNotPaidException => 'denied_unpaid',
                    $exception instanceof DownloadTokenExpiredException => 'denied_expired',
                    $exception instanceof DownloadQuotaExceededException => 'denied_quota',
                    $exception instanceof InvalidDownloadTokenException => 'denied_missing',
                    default => 'storage_error',
                },
                'attempted_at' => now(),
            ]);

            throw $exception;
        }
    }
}
