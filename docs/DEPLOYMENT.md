# Deployment configuration

This document describes configuration, not an executed deployment. Tier 2 and Tier 3 are not verified.

## CSP inventory

The application sends `Content-Security-Policy-Report-Only`. The owner must review browser console violations before choosing an enforced policy.

| Origin | Observed use | Source |
| --- | --- | --- |
| Application origin | Vite assets, API calls, public cover images, inline Ziggy configuration | `resources/views/app.blade.php`, `resources/js/app.tsx` |
| `https://app.sandbox.midtrans.com` | Sandbox Snap script and payment frame | `resources/js/Pages/Orders/Show.tsx` |
| `https://app.midtrans.com` | Live-mode Snap script and payment frame | `resources/js/Pages/Orders/Show.tsx` |
| `https://fonts.googleapis.com` | Google Fonts and Material Symbols CSS | `resources/views/app.blade.php` |
| `https://fonts.gstatic.com` | Google font files | `resources/views/app.blade.php` |
| `https://fonts.bunny.net` | Figtree CSS and font files | `resources/views/app.blade.php` |

Inline scripts/styles are included in the report-only draft because Blade emits Ziggy configuration and React uses inline layout styles. No reporting collector is installed; collect console violations manually on staging. Payment partners reached inside Snap must be checked there rather than guessed from static source.

The unused starter Blade layout references `code.jquery.com`; the unused Welcome page references `laravel.com`. Neither is a current storefront route and neither is added to the policy. External cover URLs imported into the database may generate reports and need owner review.

## Selected topology

The owner selected one Ubuntu LTS VPS, PHP 8.5-FPM, Nginx or Caddy, PostgreSQL, local Redis with the installed Predis client, Supervisor, cron, Cloudflare, and private R2 storage. No container is required for the selected hosting setup.

Use `.env.production.example` as a placeholder template, never as a completed configuration. Keep origin HTTP(S) access restricted to [Cloudflare source ranges](https://www.cloudflare.com/ips/) and set the same explicit ranges in `TRUSTED_PROXIES`; do not use `*`. Keep database/Redis ports private. The owner must maintain the firewall rules as [Cloudflare ranges change](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/).

`bookil:preflight` is read-only and prints check names, never values. It performs no gateway, mail, storage, or database connectivity validation. Proxy configuration warnings make the command fail. Sandbox mode intentionally fails the live-mode check.

The scheduler needs `* * * * * cd /srv/bookil/current && php artisan schedule:run >> /dev/null 2>&1` for daily audit pruning. A supervised queue worker is required when the receipt listener is added. Cache, sessions, and queues use Redis in the placeholder template.

Resend uses Laravel's existing SMTP transport; no new package is required. The owner must verify the sender domain and ownership of `support@bookil.com`. The [free plan](https://resend.com/pricing) has a 100-email daily limit; the owner requires a paid plan before launch.

Midtrans notifications remain exempt from CSRF at `/webhooks/midtrans`. No changing Midtrans IP range is embedded in application code. The owner must configure the gateway notification URL and ensure Cloudflare challenges do not intercept this endpoint.

Application source has no `Log::` calls and one `report($exception)` call in checkout. The explicit Snap failure messages contain a status code or a static description, not credentials or payloads. Full gateway payloads are persisted in payment/notification records, not deliberately emitted to application logs. Keep PHP `zend.exception_ignore_args=On`, debug disabled, and do not log request bodies, Authorization headers, or signed query strings in web-server/observability configuration. Review staging logs before acceptance.
