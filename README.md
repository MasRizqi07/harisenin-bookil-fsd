# Bookil

[![Tests](https://github.com/MasRizqi07/harisenin-bookil-fsd/actions/workflows/tests.yml/badge.svg?branch=session-1)](https://github.com/MasRizqi07/harisenin-bookil-fsd/actions/workflows/tests.yml?query=branch%3Asession-1)

Bookil sells digital books using PHP 8.5, Laravel 13, Inertia v2, React 19, TypeScript and Tailwind CSS. Customers browse products, verify their email before checkout, pay through Midtrans Snap and access purchased files through authenticated, signed download routes. Initial access lasts 30 days from verified payment, with at most 5 file URL grants per purchased item. Administrators manage products, orders, categories, sales reports and audited entitlement extensions.

Local tests and a successful CI workflow establish code evidence only. Real Midtrans, SMTP, R2, Redis, proxy behavior, backups and capacity require the owner's staging verification. No go-live approval is implied.

## Local development

1. Install PHP 8.5 and required extensions, Node.js and a local database. Use PostgreSQL for row-lock evidence; SQLite supports quick checks but cannot prove PostgreSQL concurrency behavior.
2. Run `composer install` and `npm ci`. Copy `.env.example` to a local `.env`, generate a local application key with `php artisan key:generate`, and configure only development/sandbox services.
3. Run `php artisan migrate` and `npm run build`. Use `php artisan serve` and optionally `npm run dev` for hot reload.
4. Create any local admin through an owner-controlled process with a unique password. Publishing a product requires an actual PDF/EPUB/ZIP on its private disk. Public covers and private purchased assets must stay separate.
5. Local mail can use `MAIL_MAILER=log`; development/tests do not demonstrate delivery. Use the existing verification page to resend mail. Only checkout requires verified email; existing users retain library access.

The selected hosting topology is one Ubuntu LTS VPS with PHP 8.5-FPM, Nginx/Caddy, PostgreSQL, local Redis via the installed Predis package, Supervisor, cron, Cloudflare and private R2. Resend uses Laravel's SMTP driver without an additional package. [Deployment configuration](docs/DEPLOYMENT.md) and `.env.production.example` describe placeholders and required owner provisioning; they are not completed server configuration.

## Verification

The badge follows the workflow result rather than a hardcoded test count. CI runs PHP tests against PostgreSQL 16. Measured local counts and commit-specific CI evidence are recorded in [READINESS.md](docs/READINESS.md).

```bash
php artisan test
php vendor/bin/pint --test
npm run build
```

For real PostgreSQL testing, select a dedicated disposable test database through `DB_CONNECTION=pgsql` and test-only connection variables before running the suite. Never target an operational database. `phpunit.xml` defaults to SQLite for quick local runs; CI and the evidence gate override that configuration with PostgreSQL. The separate row-lock test requires PostgreSQL.

## Operational tools and limits

- `bookil:preflight` checks live-profile configuration without network requests and prints labels only. It does not prove that credentials, gateway, mail or storage work. It fails on normal sandbox mode by design.
- `bookil:reconcile {order_number}` fetches gateway status and uses the existing verified payment action. It does not provide a second money-mutation path.
- Download middleware denial logging is deduplicated per actor/item/outcome per 60 seconds. Daily pruning retains download attempts for 90 days and webhook notifications for 180 days; financial records and entitlement-extension audits are not pruned.
- Receipts are queued after commit, link to the authenticated order page and contain no signed download link. A supervised Redis worker is required. Replay/refund does not schedule an additional paid receipt; transport-level exactly-once SMTP delivery is not claimed.
- An admin may extend an existing paid entitlement with a reason; usage is preserved and actor/item/deltas/time are audited. Refunds or chargebacks revoke application download access. Already issued provider URLs can remain valid until their original 15-minute expiry.
- The payment simulator remains disabled by default, available only locally/in tests when explicitly enabled, and restricted to the order owner.

See [RUNBOOK.md](docs/RUNBOOK.md) for recovery, [STAGING_VERIFICATION.md](docs/STAGING_VERIFICATION.md) for the owner's NOT RUN results template, and [CONTENT_TO_CONFIRM.md](docs/CONTENT_TO_CONFIRM.md) for business/legal/contact review. Public history still contains the removed `taskku` database's two password hashes; the owner must rotate affected passwords and decide separately whether to purge history.
