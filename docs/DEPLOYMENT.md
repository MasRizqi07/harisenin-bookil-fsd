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

The scheduler needs `* * * * * cd /srv/bookil/current && php artisan schedule:run >> /dev/null 2>&1` for daily audit pruning. A supervised queue worker is required for the receipt listener. Cache, sessions, and queues use Redis in the placeholder template.

Resend uses Laravel's existing SMTP transport; no new package is required. The owner must verify the sender domain and ownership of `support@bookil.com`. The [free plan](https://resend.com/pricing) has a 100-email daily limit; the owner requires a paid plan before launch.

Midtrans notifications remain exempt from CSRF at `/webhooks/midtrans`. No changing Midtrans IP range is embedded in application code. The owner must configure the gateway notification URL and ensure Cloudflare challenges do not intercept this endpoint.

Application source has no `Log::` calls and one `report($exception)` call in checkout. The explicit Snap failure messages contain a status code or a static description, not credentials or payloads. Full gateway payloads are persisted in payment/notification records, not deliberately emitted to application logs. Keep PHP `zend.exception_ignore_args=On`, debug disabled, and do not log request bodies, Authorization headers, or signed query strings in web-server/observability configuration. Review staging logs before acceptance.

## Environment matrix

The owner provisions all credentials outside Git. No example below contains a working credential. Use a separate database, bucket, Redis namespace and sender domain for staging. Do not share live customer data with local tests.

| Setting | Development/tests | Staging | Selected live configuration |
| --- | --- | --- | --- |
| PHP / Node build | PHP 8.5 / locked npm packages | Same release artifact | PHP 8.5-FPM; Node only needed to build assets |
| APP_ENV / APP_DEBUG | local or testing / debug may be enabled locally | staging / false | production / false |
| APP_URL | localhost | Real staging HTTPS origin | Owner's HTTPS origin |
| APP_KEY | Local generated key | Separate staging key | Owner-managed persistent key; preserve across releases/restores |
| APP_BEHIND_PROXY | false | true behind Cloudflare | true |
| TRUSTED_PROXIES | Empty unless testing explicit proxy | Explicit current Cloudflare CIDRs | Explicit current Cloudflare CIDRs; never wildcard |
| DB_CONNECTION | SQLite quick checks; PostgreSQL for evidence | PostgreSQL, separate DB | PostgreSQL on loopback/private interface |
| Redis client | Installed predis | predis | predis; no new dependency |
| CACHE_STORE / SESSION_DRIVER / QUEUE_CONNECTION | array/sync for automated tests | redis / redis / redis | redis / redis / redis |
| SESSION_SECURE_COOKIE / SAME_SITE / ENCRYPT / LIFETIME | Environment-specific | true / lax / true / 120 | true / lax / true / 120 |
| PRIVATE_DISK / S3 adapter | Storage fake or local private files | s3 adapter pointing to private staging R2 | s3 adapter pointing to private R2 |
| AWS_ENDPOINT / REGION / PATH_STYLE | Test-only configuration | Staging R2 account endpoint / auto / true | Owner's R2 account endpoint / auto / true |
| AWS_BUCKET / ACCESS_KEY_ID / SECRET_ACCESS_KEY | No live credential | Staging bucket-scoped credential | Owner-managed bucket-scoped credential |
| MIDTRANS_IS_PRODUCTION | false | false for all sandbox purchases | true; only the owner enters live keys |
| MIDTRANS_SERVER_KEY / CLIENT_KEY | Fake values | Sandbox values managed by owner | Live values managed by owner |
| BOOKIL_PAYMENT_SIMULATOR_ENABLED | Optional local only | false | false |
| MAIL_MAILER | log; Mail::fake in tests | smtp using owner-selected Resend relay | smtp using owner-selected Resend relay |
| MAIL_SCHEME / HOST / PORT / USERNAME | Local choice | smtps / smtp.resend.com / 465 / resend | Same relay parameters |
| MAIL_PASSWORD / FROM_ADDRESS | No live secret | Separate sender/API key managed by owner | Owner-managed Resend key and verified sender |
| LOG_CHANNEL / STACK / LEVEL | Local debug configuration | stack / daily / warning | stack / daily / warning |

The [SMTP relay](https://resend.com/features/smtp-service) uses Laravel's existing transport. The owner must check sender DNS, provider plan, deliverability and reset/verification/receipt messages. The daily free-plan limit applies across all message types, not just receipts. `MAIL_MAILER=log` or `array` fails preflight. Browser-facing customer claims still require review in [CONTENT_TO_CONFIRM.md](CONTENT_TO_CONFIRM.md).

`.env.production.example` is tracked; `.env.production` and `.env` are ignored. Copy the example only into the owner's secret configuration process. `APP_KEY` and all credential fields are intentionally blank. The template cannot pass preflight as-is.

## Origin and process configuration

Terminate TLS at Cloudflare and also use TLS between Cloudflare and the origin, with Full (strict) validation. Restrict public origin ports to the current Cloudflare IPv4/IPv6 ranges and restrict SSH separately. Bind PostgreSQL and Redis to loopback or private interfaces, require the owner's authentication settings, and keep them off public ingress.

Let Laravel receive the actual trusted proxy peer as `REMOTE_ADDR` and the forwarded client/protocol headers. If Nginx/Caddy rewrites the peer address, review how that interacts with Laravel's trust configuration; do not blindly enable two competing real-IP mechanisms. Do not trust arbitrary clients' forwarded headers. Verify both HTTPS signed links and audit IPs through the actual proxy before acceptance.

Point the web root at `/srv/bookil/current/public`, never the repository root. Deny access to dotfiles and configuration. Only `storage/` and `bootstrap/cache/` need application write permissions. `public/storage` may link public covers; it must never link private e-book storage. Retain the public cover files in shared persistent storage across releases. Set PHP upload/post limits consistently with the Form Request digital-file size limit.

Configure HTTP access logs to record paths without query strings on signed download routes; do not capture gateway bodies, Authorization headers or mail credentials. Keep database payment audit records subject to administrator authorization. Log rotation does not replace database backups.

## Release procedure (owner executes)

Use a new release directory for each SHA. Confirm the workflow success for that SHA before preparing the release. Take a restorable database backup and preserve current public covers and private objects. Coordinate maintenance and worker drain for migrations that cannot run while the old code serves traffic.

The required build/migration/cache order, within the prepared release directory, is:

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan bookil:preflight
```

This procedure assumes PHP 8.5 extensions including bcmath, fileinfo, mbstring, openssl, PDO and pdo_pgsql, the installed Predis package, the owner-provisioned environment, shared storage, and writable cache directories. Never use `migrate:fresh` or demo seeds on an operational database.

Keep cached configuration inside its release directory. Run these commands under the application user so ownership stays correct. Switch `/srv/bookil/current` atomically only after all checks succeed; then reload PHP-FPM as required for its opcache settings, restart workers gracefully and run the owner's smoke checks. `event:cache` must include the synchronous entitlement listener and the queued receipt listener. Queue connection Redis is required for deferred delivery; `sync` is for local tests.

`bookil:preflight` intentionally validates a live configuration profile and therefore fails on ordinary sandbox staging settings. A separate isolated, read-only configuration-profile check is described in [STAGING_VERIFICATION.md](STAGING_VERIFICATION.md); it does not validate credentials or authorize live traffic. Do not change the running staging gateway to live mode to make the check pass.

## Scheduler and queue supervision

Install this cron entry under the application account, adjusting paths to the actual layout:

```cron
* * * * * cd /srv/bookil/current && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

`model:prune` runs daily. Download-attempt retention is 90 days and webhook-notification retention is 180 days. Orders, items, payments and entitlement-extension audits are not pruned by these models. The owner sets database backup retention separately. Confirm scheduler execution with `php artisan schedule:list` and the staging prune drill.

Example Supervisor process for the new receipt listener:

```ini
[program:bookil-worker]
command=/usr/bin/php /srv/bookil/current/artisan queue:work redis --sleep=3 --tries=3 --timeout=60
directory=/srv/bookil/current
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stopwaitsecs=90
redirect_stderr=true
stdout_logfile=/var/log/bookil-worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
```

Use the actual application account and provision log permissions. Keep queue `retry_after` longer than the worker timeout. Set an SMTP transport timeout below the worker timeout; observe failed jobs and provider errors. After each code/config release, run `php artisan queue:restart` using the same Redis cache as the workers. Verify Supervisor has started the replacement worker. A receipt job is scheduled only after a committed first paid transition; webhook replay and refund do not schedule a new receipt. Queue delivery is at least once: a worker lost after SMTP accepts a message can retry it. No transport-level exactly-once guarantee is claimed.

## Private object storage and backup

Keep R2 public access, `r2.dev` access and public custom domains disabled for purchased objects. Scope the application credential to the required bucket. Do not set public object ACLs or `AWS_URL` to a public purchase bucket. A browser receives an expiring GET URL only after application authentication, policy and quota checks. Verify that unsigned object requests fail. Public cover images use a separate public disk.

For AWS S3, enable bucket versioning, Block Public Access and owner-controlled retention/lifecycle rules for old versions. Do not expire current purchased assets because a customer's download allowance expired. Multipart temporary uploads may have a bounded cleanup policy. Retain backups and old release assets long enough to support a restore and outstanding URLs.

R2 does not currently implement `GetBucketVersioning` or `PutBucketVersioning` in its [S3 compatibility matrix](https://developers.cloudflare.com/r2/api/s3/api/). Do not document a nonexistent R2 versioning switch. The owner must select a recovery strategy: keep R2 plus a separate versioned S3 backup, or use versioned S3 as primary storage. That infrastructure decision and the backup/restore drill are not executed by the agent. Product replacement can delete the previous object through the existing management flow; copying only today's current R2 state is not equivalent to historical versions. The chosen backup process must preserve overwritten/deleted assets as well as the database-to-object-key mapping.

## Rollback

If preflight or caches fail before activation, keep the previous release active and fix the candidate. If smoke checks fail after activation, place the application in the owner's maintenance process, drain workers, switch to the previously compatible release, reload FPM and restart workers. Keep the same persistent `APP_KEY`, data and object storage.

Do not blindly run `migrate:rollback` after orders or payments were written under a new schema. Confirm schema compatibility first; prefer a forward correction. If a restore is necessary, stop writes, restore a verified backup into a fresh database, reconcile payments received since the backup via the existing command and owner-controlled gateway records, then validate totals, entitlements and private objects before resuming traffic. See [RUNBOOK.md](RUNBOOK.md). Rotating `APP_KEY` is not a normal rollback step and invalidates encrypted cookies and existing signed application URLs.
