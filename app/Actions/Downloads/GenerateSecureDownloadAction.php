<?php

declare(strict_types=1);

namespace App\Actions\Downloads;

use App\Enums\OrderStatus;
use App\Exceptions\DownloadQuotaExceededException;
use App\Exceptions\DownloadTokenExpiredException;
use App\Exceptions\InvalidDownloadTokenException;
use App\Exceptions\OrderNotPaidException;
use App\Exceptions\UnauthorizedDownloadException;
use App\Models\DownloadToken;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class GenerateSecureDownloadAction
{
    /**
     * Validate ownership, paid status, token validity, and quota,
     * then atomically increment download count and return a 15-minute presigned URL.
     */
    public function execute(User $user, string $token): string
    {
        // Find token either by direct hash match or sha256 of plaintext token
        $lookupToken = DownloadToken::query()
            ->where('token', $token)
            ->orWhere('token', hash('sha256', $token))
            ->first();

        if (! $lookupToken) {
            throw new InvalidDownloadTokenException('Download token not found or invalid.');
        }

        return DB::transaction(function () use ($user, $lookupToken): string {
            /** @var DownloadToken $downloadToken */
            $downloadToken = DownloadToken::query()
                ->where('id', $lookupToken->id)
                ->lockForUpdate()
                ->firstOrFail();

            $orderItem = $downloadToken->orderItem()->with(['order', 'product'])->firstOrFail();
            $order = $orderItem->order;
            $product = $orderItem->product;

            // 1. Validate ownership
            if ($order->user_id !== $user->id) {
                throw new UnauthorizedDownloadException('You do not own this purchased product.');
            }

            // 2. Validate order status
            if ($order->status !== OrderStatus::PAID) {
                throw new OrderNotPaidException('Order is not paid or settled.');
            }

            // 3. Validate token expiration
            if ($downloadToken->expires_at !== null && $downloadToken->expires_at->isPast()) {
                throw new DownloadTokenExpiredException('Download token has expired.');
            }

            // 4. Validate download quota
            if ($downloadToken->download_count >= $downloadToken->max_downloads) {
                throw new DownloadQuotaExceededException('Maximum download quota exceeded for this item.');
            }

            // Atomically increment quota
            $downloadToken->increment('download_count');

            // Generate time-limited presigned URL (15 minutes expiration)
            $diskName = (string) config('filesystems.private_disk', 's3');

            // Fallback to local disk if S3 bucket is unconfigured (common in local/testing environments)
            if ($diskName === 's3' && empty(config('filesystems.disks.s3.bucket'))) {
                $diskName = 'local';
            }

            try {
                return Storage::disk($diskName)->temporaryUrl(
                    $product->file_path,
                    CarbonImmutable::now()->addMinutes(15)
                );
            } catch (\Throwable $e) {
                if ($diskName !== 'local' && app()->environment(['local', 'testing'])) {
                    report($e);

                    return Storage::disk('local')->temporaryUrl(
                        $product->file_path,
                        CarbonImmutable::now()->addMinutes(15)
                    );
                }

                throw $e;
            }
        });
    }
}
