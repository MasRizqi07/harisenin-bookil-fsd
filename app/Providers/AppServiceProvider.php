<?php

declare(strict_types=1);

namespace App\Providers;

use App\Http\Middleware\AuditRejectedDownload;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpFoundation\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::shouldBeStrict();
        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        Storage::disk('local')->serveUsing(fn (Request $request, string $path, array $headers): Response => Storage::disk('local')->download($path, headers: $headers)
        );

        RateLimiter::for('downloads', function (Request $request): array {
            $identity = (string) ($request->user()?->getAuthIdentifier() ?? $request->ip());
            $itemId = filter_var($request->route('orderItem'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            $response = function (Request $request, array $headers): Response {
                AuditRejectedDownload::record($request, 'denied_throttled');

                return response('Too Many Requests', 429, $headers);
            };
            $limits = [Limit::perMinute(30)->by('user:'.$identity)->response($response)];
            if ($itemId !== false) {
                $limits[] = Limit::perMinute(30)->by('item:'.$identity.':'.$itemId)->response($response);
            }

            return $limits;
        });
    }
}
