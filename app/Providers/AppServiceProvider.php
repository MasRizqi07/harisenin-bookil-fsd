<?php

declare(strict_types=1);

namespace App\Providers;

use App\Http\Middleware\AuditRejectedDownload;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
        Vite::prefetch(concurrency: 3);

        RateLimiter::for('downloads', fn (Request $request): Limit => Limit::perMinute(30)
            ->by(($request->user()?->getAuthIdentifier() ?? $request->ip()).':'.$request->route('orderItem'))
            ->response(function (Request $request, array $headers): Response {
                AuditRejectedDownload::record($request, 'denied_throttled');

                return response('Too Many Requests', 429, $headers);
            }));
    }
}
