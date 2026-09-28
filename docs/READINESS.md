# Bookil evidence status

Branch: `session-1`. Evidence snapshot SHA: `68fd094fd9d8a6698207737ccc7fdfbd7d214531`; implementation checkpoint: `83619af800dddee317bb38043f3e93e37a52e2ac`. The documentation checkpoint containing this status is identified by `git rev-parse HEAD` and its matching workflow run; recording a Git file's own future commit hash inside that same file would be self-referential.

This document separates code evidence from owner-run integration and operational acceptance. It does not authorize deployment. The final evidence report supplies the documentation HEAD, origin parity and completed CI result for that exact SHA.

## Verified locally

- Dedicated PostgreSQL 18.4 test database on PHP 8.5: full `php artisan test --compact --colors=never` produced **197 passed (1184 assertions)** after Phase F. The suite ran on real PostgreSQL, not SQLite.
- The existing two-connection row-lock test checks PostgreSQL SQLSTATE `55P03` with a 500 ms lock timeout and bounded elapsed time. SQLite cannot supply that evidence.
- `php vendor/bin/pint --test` returned `{"tool":"pint","result":"passed"}`; `npm run build` (TypeScript plus Vite) exited 0.
- Runtime assertions cover real checkouts with fake Snap responses (10 created, 11th HTTP 429), global download limiting across rotated nonexistent IDs, bounded middleware denial rows and unchanged denied-request quota, retention, trusted HTTPS forwarding/client IP, preflight failures and auth route throttles.
- Customer integrity checks cover unverified checkout HTTP 403 while the library remains HTTP 200, verification resend HTTP 429 on attempt 7, one settlement receipt with no bearer links, no additional replay/refund receipt, and real commit/rollback receipt boundaries.
- Admin entitlement tests prove customer rejection, preserved usage, expiry math, a 5-to-8 quota change and recorded actor/item/deltas/reason. Reconciliation proves pending-to-paid, repeat no-op, one payment/event, amount rejection, outage and wrong-order rejection.

## Verified in CI

[Phase E run 36445052868](https://github.com/MasRizqi07/harisenin-bookil-fsd/actions/runs/36445052868) for `83619af800dddee317bb38043f3e93e37a52e2ac` returned API `status=completed`, `conclusion=success`. Its downloaded job log records **197 passed (1184 assertions)**. It runs the existing workflow against PostgreSQL 16, PHP 8.5, Pint and the frontend build. This is commit-specific evidence, not an inference from a push.

[Phase F run 36445487800](https://github.com/MasRizqi07/harisenin-bookil-fsd/actions/runs/36445487800) for `68fd094fd9d8a6698207737ccc7fdfbd7d214531` returned API `status=completed`, `conclusion=success`. The final documentation checkpoint requires its own completed workflow result and local/remote SHA comparison in the final evidence report. The [README workflow badge](../README.md) tracks `session-1`; it does not hardcode a count.

## Not verified — Tier 2

All entries in [STAGING_VERIFICATION.md](STAGING_VERIFICATION.md) start NOT RUN. The owner has not supplied results for:

- Real Midtrans sandbox purchase, actual notifications/replay, provider cancel/expire/refund/chargeback and event counts.
- Actual private R2/S3 delivery, unsigned object denial and 15-minute provider URL expiry.
- Cross-customer behavior and signed links through the actual Cloudflare/origin configuration.
- Redis sessions, counters and workers on the chosen host; shared limits if a second app instance is used.
- Resend SMTP sender verification, paid plan, receipt/reset/verification delivery and support mailbox ownership.
- CSP Report-Only console review across catalogue, payment popup, library and admin.
- PostgreSQL plus asset backup/restore into a fresh environment, recovery objectives and deleted/replaced object recovery.
- Catalogue/product smoke-load p95/error rate on staging.
- Read-only live-profile preflight using the isolated staging procedure.

Fake HTTP/Storage/Mail integrations are test evidence only. No real gateway/storage/SMTP service result is substituted by them.

## Owner decisions and reviews still open

- Select R2 recovery: R2 with separate versioned S3 backups, or versioned S3 as primary storage. R2's compatibility matrix does not implement bucket versioning; deployment docs state the limitation instead of claiming it exists.
- Confirm mailbox/domain ownership, provider plan, legal/tax/support claims and contact details in CONTENT_TO_CONFIRM.md.
- Supply Tier 2 evidence and separately decide any Tier 3 work. CSP remains Report-Only until owner review.
- Decide whether to purge `taskku` from public Git history. The two old password hashes are already exposed; rotate affected/reused passwords. No history rewrite was performed.

## Tier 3

Live credentials, DNS activation, deployment approval and real payments are owner-controlled and NOT verified. The agent did not request or enter live secrets, deploy the site, run real payments or rewrite history.
