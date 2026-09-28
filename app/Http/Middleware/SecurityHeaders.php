<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        foreach ([
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=()',
            'Content-Security-Policy-Report-Only' => "default-src 'self'; script-src 'self' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net; font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net; img-src 'self' data:; connect-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com; frame-src https://app.midtrans.com https://app.sandbox.midtrans.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
        ] as $header => $value) {
            $response->headers->set($header, $value);
        }
        if (app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        return $response;
    }
}
