<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\DownloadAttempt;
use App\Models\OrderItem;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditRejectedDownload
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        if ($response->getStatusCode() === 403 && ! $request->hasValidSignature()) {
            self::record($request, 'denied_signature');
        }

        return $response;
    }

    public static function record(Request $request, string $outcome): void
    {
        $requestedId = (int) $request->route('orderItem');
        $signature = $request->query('signature');

        DownloadAttempt::query()->create([
            'user_id' => $request->user()?->id,
            'order_item_id' => $requestedId > 0
                ? OrderItem::query()->whereKey($requestedId)->value('id') : null,
            'download_token_id' => null,
            'access_signature_hash' => hash('sha256', is_string($signature) ? $signature : ''),
            'ip_address' => $request->ip(),
            'outcome' => $outcome,
            'attempted_at' => now(),
        ]);
    }
}
