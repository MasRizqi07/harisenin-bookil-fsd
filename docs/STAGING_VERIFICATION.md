# Staging verification — owner-executed Tier 2

This is a procedure and results template, not evidence of an executed deployment. Every result starts **NOT RUN**. The agent did not perform external gateway purchases, SMTP delivery, private bucket checks, Redis integration, proxy configuration, load testing or a backup/restore drill. Tier 3 remains outside this runbook.

## Record the environment first

| Field | Owner fills in |
| --- | --- |
| Release SHA and successful CI run URL | NOT RUN |
| Date, operator and staging HTTPS origin | NOT RUN |
| PHP/PostgreSQL/Redis versions | NOT RUN |
| Web server, Cloudflare settings and trusted CIDRs | NOT RUN |
| Separate staging database/bucket/Redis namespace | NOT RUN |
| Resend sender/domain verification and plan | NOT RUN |
| Backup destination and asset-version retention decision | NOT RUN |
| Restore RPO/RTO targets | NOT RUN |
| Catalogue load p95/error-rate thresholds selected before test | NOT RUN |

Use sandbox gateway credentials and staging-only identities/assets. Keep `MIDTRANS_IS_PRODUCTION=false`, `APP_DEBUG=false`, the simulator disabled, HTTPS enabled, an SMTP sender verified by the owner, and cache/session/queue on Redis. Run the scheduler and supervised worker. Confirm the 30-day/5-download copy in the product purchase box, checkout modal, receipt, FAQ and refund page. Review [CONTENT_TO_CONFIRM.md](CONTENT_TO_CONFIRM.md), including support mailbox ownership, contact details, legal/tax wording and service promises. Do not post credentials or full payment payloads as evidence.

Use the authenticated admin ledger for payment/audit inspection. For database evidence, select only IDs, order state, transaction status, expiry, quota, outcomes and counts. Redact customer identity, signature values, card metadata and all signed URLs. Record actual order numbers privately, using placeholders in shared evidence.

## 1. Real sandbox settlement and one paid event

1. In the **sandbox** Midtrans dashboard, set the notification URL to `https://<staging-origin>/webhooks/midtrans`. Confirm Cloudflare does not challenge server notifications.
2. To observe the real event count, the owner can temporarily register this staging-only observer in `AppServiceProvider::boot()` in an unmerged staging harness. The observer records a count only, without user data or payloads. It is not part of the release artifact:

   ```php
   if (app()->environment('staging')) {
       \Illuminate\Support\Facades\Event::listen(
           \App\Events\OrderPaidEvent::class,
           function (\App\Events\OrderPaidEvent $event): void {
               $key = 'staging:paid-events:'.$event->order->id;
               \Illuminate\Support\Facades\Cache::add($key, 0, now()->addHours(2));
               \Illuminate\Support\Facades\Cache::increment($key);
           },
       );
   }
   ```

3. Deploy that observer only on the isolated staging host, start with a new order and no existing counter, and remove it when these exercises end. Do not infer the event count solely from a payment row.
4. Register customer A, receive and follow the verification email, open a published product with an actual staging private file, acknowledge the displayed limits, and complete a sandbox QRIS or provider-documented test-card payment. Record the sandbox transaction ID without card data.
5. Wait for the **actual** gateway notification. Check the gateway delivery log, `/orders/{order_number}`, admin ledger and library. Read the event counter with an owner-controlled staging query, such as `Cache::get('staging:paid-events:'.$orderId, 0)` in Artisan Tinker. Record counts before and after.

Expected: webhook successful response; order paid with matching local amount; one Payment, one processed notification for settlement; one entitlement per item with zero used downloads, max 5 and expiry about 30 days after verified payment; event count 0→1; queued receipt delivered after commit with the authenticated order-page link and 30-day/5-download terms. No signed download URL appears in the email. Check SMTP verification and reset messages as well.

## 2. Real webhook replay

From the same sandbox dashboard, resend the identical settlement notification for the order from step 1. Keep the status unchanged at the provider. Compare local Payment count, event counter and receipt delivery count before/after.

Expected: response succeeds; the same order remains paid; exactly one Payment row for the external transaction; paid-event counter remains 1; no new receipt is scheduled. A different status is not an identical replay and must be tested separately below.

## 3. Gateway cancel, expiry and reversal

Create separate pending sandbox orders. Use the provider's supported sandbox controls to cancel one and let/simulate another expire. Create a separate settled order, then simulate refund; test chargeback if the provider supports it in the selected sandbox method. Resend the corresponding notifications if needed. Record each delivery/status, not just a UI badge.

Expected: cancel maps to failed and expire maps to expired after verification. Refund/chargeback of an existing settled transaction maps to failed and expires its entitlement; authenticated application download requests are rejected and no new paid receipt is sent. If a sandbox method does not support an exercise, record **NOT RUN** and the limitation rather than substituting a local simulator. Previously issued provider URLs can remain usable until their original 15-minute expiry.

## 4. Real private bucket and both signatures

1. With customer A and a paid order, open a fresh library page and request one application download. Save the response headers/redirect **privately** and follow the provider URL to obtain the real file. Compare checksum/size with the uploaded asset.
2. Confirm quota increases by one when the file URL is issued. Record the two URL expiry times without sharing either signature: the application signed route and the separate provider presigned object URL.
3. Change one character of the application route's `signature` query value and request it with customer A's session. Example shell outline, using private variables populated by the operator:

   ```bash
   curl --include --cookie "$STAGING_SESSION_COOKIE" "$TAMPERED_APPLICATION_URL"
   ```

4. Expected edited-signature response: HTTP 403, one deduplicated denied_signature audit outcome in the current window, quota unchanged by the denial. Do not replace the session cookie with a public token.
5. Take the successfully issued **provider** URL from step 1 and retry it after its declared expiry (at least 15 minutes plus clock margin). Request the same object without signing through the R2/S3 API. Inspect bucket public access, `r2.dev` and custom-domain configuration in the provider console.

Expected: initially valid file download; provider URL stops granting access after expiry; unsigned object request denied; no public access path. A Storage::fake test is not evidence for this step. Test the remaining-quota and expired-entitlement states with separate staging items so this exercise does not mask a signature failure with exhausted quota.

## 5. Cross-customer ownership

Register customer B and sign in using a separate browser profile/session. Request A's still-valid application signed download URL with B's session, before exhausting A's entitlement. Record HTTP status and quota before/after.

Expected: HTTP 403 from ownership authorization, denial audit for B, A's quota unchanged. B's library/order list must not contain A's order; requesting A's order page must return 403/404. Do not mistake an expired signature for ownership proof.

## 6. Actual Cloudflare/proxy path

With the real explicit Cloudflare CIDRs configured, access the storefront/order/library through its HTTPS staging hostname. Download as A and inspect the granted attempt's `ip_address` against the client IP used for this request.

Expected: generated application URL uses HTTPS; signature validates through TLS termination; audit IP is the forwarded client rather than Cloudflare/loopback. Direct spoofed forwarded headers from an untrusted origin peer must not change the client IP. Confirm the firewall rejects public origin access outside Cloudflare ranges. Keep CSP Report-Only.

## 7. Redis sessions, counters and queue

Use owner-controlled Redis inspection without listing secret values or session contents. Confirm the selected Redis databases/prefixes receive session and rate-limiter keys with TTLs, and verify Supervisor processes receipt jobs. Send 10 **real sandbox checkouts** within one minute as the same verified test user; the 11th must be 429. Do not pay all these pending orders merely to exercise the limiter.

For download rate limiting, a staging administrator can extend a paid item's max_downloads above 30 with a documented test reason, then send 31 valid signed requests within one minute. Expected: first 30 issue file URLs; the 31st is 429; quota stays at 30 for the denied request; middleware denial audit is deduplicated. Restore the intended test entitlement via cleanup, keeping the audit intact. If two app instances are used, alternate requests between them using the same shared Redis/session state and verify the limit still holds. The selected single VPS has one instance by default; record multi-instance testing as NOT RUN when absent.

## 8. CSP Report-Only console review

Open browser developer tools with console/network logs preserved. Load the storefront, product page, checkout modal, Snap popup and its payment-method screens, customer dashboard, and admin pages. Record every CSP violation with page, directive and origin. Confirm the response contains **Content-Security-Policy-Report-Only**, not an enforced replacement added by the proxy.

Compare origins with [DEPLOYMENT.md](DEPLOYMENT.md). Review any additional gateway partner, font or cover origin; propose the smallest justified policy changes. Do not change to an enforced policy during this agent's task. The owner must approve an enforcement change after a repeat console/payment check.

## 9. Backup and restore drill

Follow [RUNBOOK.md](RUNBOOK.md)'s database-and-asset restore procedure. Take a staging PostgreSQL archive, record timestamp/checksum, restore into a new empty DB and isolated app instance, and restore matching object/cover snapshots. Never overwrite the active staging database as the test setup.

Expected: app boots against the fresh restored DB; counts/totals/order ownership/quota match the backup; representative private downloads succeed; deleted/replaced asset recovery is demonstrated using the selected versioned backup strategy. Record elapsed time and measured data loss window against the owner's RPO/RTO. No restore result is pre-filled.

## 10. Catalogue smoke load

The owner chooses `ab` or `k6`, fixes target concurrency/duration and acceptance thresholds before running, and confines load to staging catalogue/product GET routes. Example low-volume starting command:

```bash
ab -n 200 -c 10 https://<staging-origin>/
```

Record p95 latency, non-success/error rate, host utilization and the selected caching/Cloudflare configuration. Include at least one published product URL. Increase load only under the owner's capacity plan. Do not load test checkout/webhooks against real Midtrans, and do not interpret a Cloudflare-cached catalogue run as evidence of database capacity. Expected results are the preselected thresholds; the agent supplies no fabricated performance target or measured result.

## 11. Isolated production-profile preflight

Ordinary sandbox staging has `APP_ENV=staging` and `MIDTRANS_IS_PRODUCTION=false`, so the strict command should fail those live-profile checks. Verify that failure first.

For a configuration-only pass exercise, create a **separate offline staging release copy**, with no web server/worker serving it and no shared config cache. Use the owner's staging environment values, set APP_ENV and the gateway mode **for this process only**, and run:

```bash
php artisan config:clear
APP_ENV=production MIDTRANS_IS_PRODUCTION=true php artisan bookil:preflight
```

Run `config:clear` only inside the isolated copy. Ensure debug false, HTTPS staging URL, a nonempty **sandbox** server key, s3 private disk, simulator false, smtp mailer and explicit proxy ranges. The command performs no network requests, does not authenticate the key and never prints it. Expected: exit 0 and only pass/fail labels. This proves profile validation, not live credentials or gateway operation. Discard the offline copy afterwards; never change the running staging site's sandbox configuration or start a live worker using this profile.

## Results — owner fills after execution

Attach redacted raw HTTP/status output, DB counts, console exports or provider evidence. Missing/unsupported steps remain NOT RUN; passing local/CI tests do not fill this table.

| Step | Result (PASS / FAIL / NOT RUN) | Evidence link or redacted raw output | Operator / date | Follow-up |
| --- | --- | --- | --- | --- |
| 1 Sandbox purchase, entitlement, event count and receipt | NOT RUN | | | |
| 2 Replay, one payment/event/receipt | NOT RUN | | | |
| 3 Cancel and expiry | NOT RUN | | | |
| 3 Refund and chargeback/revocation | NOT RUN | | | |
| 4 Actual private file, unsigned denial, 15-minute expiry | NOT RUN | | | |
| 4 Edited application signature, audit and unchanged quota | NOT RUN | | | |
| 5 Customer B versus A ownership | NOT RUN | | | |
| 6 Proxy HTTPS, signature, IP and origin firewall | NOT RUN | | | |
| 7 Redis sessions/counters/queue, single-instance limits | NOT RUN | | | |
| 7 Shared limits across two app instances, if applicable | NOT RUN | | | |
| 8 CSP Report-Only, all required pages/payment screens | NOT RUN | | | |
| 9 Fresh database and matching asset restore | NOT RUN | | | |
| 10 Catalogue/product p95 and error rate | NOT RUN | | | |
| 11 Strict sandbox failure and isolated profile exit 0 | NOT RUN | | | |
| Content, support mailbox, provider plan and backup strategy approvals | NOT RUN | | | |

Remove staging-only observers after recording results. The owner decides whether Tier 2 evidence is sufficient and separately authorizes any Tier 3 work. Do not store actual credentials, session cookies, signatures or raw card-containing webhook bodies in this document.
