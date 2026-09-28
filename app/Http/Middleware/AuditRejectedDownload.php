<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\DownloadAttempt;
use App\Models\OrderItem;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        $requestedId = filter_var($request->route('orderItem'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $itemId = $requestedId !== false
            ? OrderItem::query()->whereKey($requestedId)->value('id') : null;
        $identity = $request->user() !== null ? 'user:'.$request->user()->id : 'ip:'.$request->ip();
        $key = 'download-denial:'.hash('sha256', $identity.':'.($itemId ?? 'missing').':'.$outcome);

        if (! Cache::add($key, true, now()->addSeconds(60))) {
            return;
        }

        $signature = $request->query('signature');

        DownloadAttempt::query()->create([
            'user_id' => $request->user()?->id,
            'order_item_id' => $itemId,
            'download_token_id' => null,
            'access_signature_hash' => hash('sha256', is_string($signature) ? $signature : ''),
            'ip_address' => $request->ip(),
            'outcome' => $outcome,
            'attempted_at' => now(),
        ]);
    }
}
