# Bookil browser QA evidence — 2026-09-29

This report records local browser QA and regression fixes on `session-1`, starting from `ac6883b1e378190b5657d384adc04c12d99b3f3a`. It is not staging acceptance or deployment approval. The final response identifies the commit containing these files and the CI result for that exact commit.

## Environment and boundaries

- Chrome through the connected browser extension, with desktop, phone and tablet viewport checks. Tested header widths: 320, 390, 768, 1024, 1280 and 1536 CSS pixels. Temporary viewport overrides were reset.
- Local HTTP server at `http://127.0.0.1:8002`; a separate PostgreSQL browser QA database, synthetic products and three synthetic users (verified customer, unverified customer and administrator). No existing customer database was reset.
- The PHP suite uses another dedicated PostgreSQL 18.4 database, PHP 8.5 and the installed dependencies. It does not run against SQLite.
- Payment credentials are blank, the payment simulator is disabled, and mail uses the log driver. No real purchase, external email delivery, production credential, deployment or history rewrite occurred.
- DOM evidence redacts signed URL signatures. Browser captures and CSV rows contain only synthetic QA data. `browser-observations.json` records the observations; before/after snapshots are retained rather than treating earlier failures as passes.
- The initial local download failed because the QA server was not using its isolated storage directory. The server environment was corrected before evaluating delivery headers. That fixture setup error is separate from the remaining Chrome download denial.

## Coverage and results

| Surface | Checks performed | Evidence | Result |
| --- | --- | --- | --- |
| Catalog `/` | Categories, pagination, title/author search, debounce, empty results/reset, price ordering, header search, Ctrl+K and Enter | `catalog-*.dom.txt`, `keyboard-search-final.dom.txt`, `lowercase-search-before.dom.txt`, `lowercase-search-after.dom.txt` | Observed; lowercase search initially failed on PostgreSQL and now finds the book |
| Product details | Metadata, entitlement notice, excerpt modal, guest login redirect, uploaded cover, buy-now modal | `product-*.dom.txt`, `uploaded-product-final.dom.txt`, `checkout-modal*.dom.txt` | Observed; cover URL initially pointed at the wrong directory and now loads the uploaded 120×160 PNG |
| FAQ and legal pages | Route rendering, navigation, FAQ search, phone layout | `faq*.dom.txt`, `terms*.dom.txt`, `privacy*.dom.txt`, `refund*.dom.txt` | Observed; business/legal promises still require owner confirmation |
| Authentication | Login rendering, wrong-password rejection, successful sign-in/out, register/forgot/reset/confirm page rendering | `login*.dom.txt`, `register*.dom.txt`, `forgot-password.dom.txt`, `reset-password.dom.txt`, `confirm-password.dom.txt` | Observed; account creation/password changes were not submitted through the browser |
| Email verification | Unverified customer library access, checkout redirects to verification, resend success message | `unverified-library-after.dom.txt`, `unverified-checkout-guard.dom.txt`, `verification-resend-success.dom.txt` | Observed locally; external delivery is not verified |
| Customer library `/dashboard`, `/library` | Own books, quota/expiry, order-history tab, invoice links, verified/unverified badge, phone/tablet layout | `dashboard*.dom.txt`, `customer-order-history.dom.txt`, `unverified-library-after.dom.txt` | Observed |
| Customer invoices | Paid/pending/failed/expired states, item metadata, unavailable-payment notice, retry on the same order | `invoice-*.dom.txt`, `real-ui-checkout-pending.dom.txt`, `payment-retry-same-order.dom.txt`, `database-proof.txt` | Observed; UI checkout creates one pending order/item without a payment; retry leaves the order count at 8 |
| Profile | Profile save and name persistence; security and account tabs render | `profile*.dom.txt`, `profile-saved.dom.txt` | Observed; password changes/account deletion were not submitted |
| Resource guards | Another customer's invoice/download denied; customer admin access denied; tampered download signature denied | `order-owner-denied.dom.txt`, `download-owner-denied.dom.txt`, `download-signature-denied.dom.txt`, `admin-customer-denied.dom.txt` | Observed; additional denial/throttle cases are covered by the PostgreSQL suite |
| Admin dashboard | Metrics, recent orders, sales summaries, sidebar navigation, actual CSV browser download | `admin-dashboard-desktop.dom.txt`, `sales.csv` | Observed; the exported fixture CSV contains 7 data rows, matching the database at export time |
| Admin products | List/filter, create/edit rendering, duplicate-slug error visible, successful edit, upload rejection/acceptance via real HTTP | `admin-product-*.dom.txt`, `http-upload.txt`, `database-proof.txt` | Edit and HTTP upload observed; browser file selection remains unverified |
| Admin categories | Create/edit and persisted result | `category-created.dom.txt`, `category-edited.dom.txt` | Observed |
| Admin orders | List/detail, mobile layout, expand raw synthetic payload, entitlement extension (+2 downloads/+7 days), audit actor/item/deltas | `admin-order*.dom.txt`, `admin-entitlement-extended.dom.txt`, `database-proof.txt` | Observed |
| Errors and legacy route | Error-page previews, missing route, `/tasks` removal | `missing-page.dom.txt`, `error-demo-404.dom.txt`, PostgreSQL routing tests | Observed; error previews are not evidence of a real HTTP error status |
| Private local PDF | Signed response, attachment disposition, response bytes, tampered local signature rejection | `runtime-after.txt`, `regression-tests.txt` | HTTP and regression tests verified; browser delivery remains unverified |

## Minimal fixes and ladder

| Fix | Ladder rung | Specific runtime proof |
| --- | --- | --- |
| Reload missing invoice relationships after Snap refresh/error | 2 — reuse Eloquent `loadMissing` | Pending invoice shows the original title/author; regression test fakes HTTP 500 and preserves pending status/no payment |
| Validate description before the non-null database write | 3/5 — existing Form Request rules | Empty create/update return 422; initial multipart omission produced 500; corrected valid upload returns 302 |
| Return local files as attachments | 3 — Laravel `serveUsing` and streamed `download` | HTTP 200, 218 bytes, attachment header; signed local rejection test passes; Chrome remains blocked |
| Case-insensitive public catalog search | 3 — Laravel `whereLike`/`orWhereLike` | `laravel` initially returned 0; now shows QA Laravel Guide; title/author/description cases each tested on PostgreSQL |
| Connect edit form errors/processing to its existing form helper | 2 — Inertia `useForm`/`transform` | Duplicate slug is visibly rejected; subsequent valid edit is persisted |
| Correct cover path and small-file size formatting | 5 — existing URL/format helpers | Actual cover DOM uses `/storage/covers/...`; natural size is 120×160; 218 bytes is displayed instead of 0 KB |
| Wire keyboard open and server catalog search to the existing palette | 2/6 — reuse the palette/query route, minimal callback | Native Ctrl+K opens the palette; Enter navigates to filtered catalog |
| Fix phone/tablet header and admin detail wrapping | 5 — existing Tailwind classes | Header scroll widths stay within each of the six tested viewport widths; admin detail goes from overflow to 375 pixels at a 390-pixel viewport |
| Remove duplicate/dead footer links, fake operational health and unsupported page-count/author-verification labels | 1 — remove unsupported UI content | Before/after DOM and screenshots |
| Derive email badge from actual user data; remove permanent download spinner; use Bookil title fallback | 2/5 — existing props and presentation | Unverified customer's badge reflects its state; download controls remain ordinary native links |

No higher-rung mechanism was added where an earlier rung satisfied the requirement. No dependency, migration, second money-mutation path, custom signature algorithm or replacement dashboard was added. Protected Actions/services/policies, signed route, webhook controller, row-lock test, CSV sanitizer and CI workflow remain unchanged from the baseline.

## Unverified and owner review

1. **Chrome private PDF delivery:** a direct browser click still ends at `ERR_BLOCKED_BY_CLIENT`; no fresh download event/file was confirmed after the attachment change. The HTTP response and streamed-body test pass. The cause has not been established, and no browser protection was bypassed. See `download-browser-blocked-after.png`.
2. **Chrome file selection:** the extension still reports that file URL access is unavailable after the owner indicated it was enabled. The UI file-picker upload is not counted as passing. Actual authenticated HTTP multipart uploads accept the PDF/cover and reject bad MIME/missing published file. See `http-upload.txt`.
3. **External integrations:** live Snap popup, sandbox payment/webhook, real R2/S3 expiry, SMTP delivery, Redis across instances, real Cloudflare proxy, restore drill and load acceptance remain NOT RUN here. The owner-run `docs/STAGING_VERIFICATION.md` results are unchanged.
4. **Browser password changes/deletion/printing:** page rendering was inspected; these mutations/printing were not performed. The suite covers password/auth/deletion paths, which does not substitute for browser execution. The copy-order button was clicked, but clipboard content was not confirmed.
5. **Content ownership:** `docs/CONTENT_TO_CONFIRM.md` remains the owner's review queue. Additional visible claims requiring confirmation include the catalog/card 4.9 rating and editorial choice, under-two-second fulfillment, fixed Indonesian language/device compatibility, and checkout/invoice tax wording. These are not certified by UI tests. Support mailbox ownership remains a human check.
6. **Historical data:** old `taskku` password hashes remain in the public Git history. Password rotation and any purge decision remain with the owner. History was not rewritten.
7. **Initial failed test fixture:** a first case-insensitive-search test run called a nonexistent factory state. The raw failure is retained in `test-fixture-failure.txt`; the fixture now uses the existing `is_published` attribute. The final suite output below is a separate rerun, not a restatement of the failed run.

## Evidence gate

```text
PHASE/TASK — Browser QA and the minimal regressions above
LADDER     — 1, 2, 3, 5 and minimal 6; no unnecessary higher-rung mechanism or dependency added
EVIDENCE   — Verbatim command/runtime output below; DOM, screenshots and database rows above
STATUS     — Local code checks verified; full browser delivery/upload and Tier 2/Tier 3 unverified as listed
```

The following output is copied directly from the captured terminal files. Exit codes for the final full suite, Pint and frontend build are 0.

### regression-tests.txt

```text

   PASS  Tests\Feature\BrowserRegressionTest
  ✓ it serves a signed local PDF as an attachment with its security headers intact                               1.16s  
  ✓ it rejects a tampered local asset signature without returning the PDF                                        0.09s  
  ✓ it keeps pending invoice product metadata when Snap is unavailable                                           0.31s  
  ✓ it rejects an empty product description before writing to the database with ('create')                       0.12s  
  ✓ it rejects an empty product description before writing to the database with ('update')                       0.11s  
  ✓ it finds published catalog entries regardless of search capitalization with ('title')                        0.11s  
  ✓ it finds published catalog entries regardless of search capitalization with ('author')                       0.08s  
  ✓ it finds published catalog entries regardless of search capitalization with ('description')                  0.08s  

  Tests:    8 passed (81 assertions)
  Duration: 2.40s


```

### tests-postgres.txt

```text

   PASS  Tests\Unit\ExampleTest
  ✓ that true is true                                                                                            0.02s  

   PASS  Tests\Feature\Actions\CreateOrderActionTest
  ✓ it creates an order with server-calculated totals and order items                                            1.17s  
  ✓ it accepts a simple array of product id integers                                                             0.12s  
  ✓ it deduplicates items if the same product is sent multiple times                                             0.12s  
  ✓ it rejects order creation if any product is unpublished                                                      0.11s  
  ✓ it rejects order creation if any product does not exist                                                      0.09s  
  ✓ it rejects order creation with empty items                                                                   0.07s  

   PASS  Tests\Feature\Actions\GenerateSecureDownloadActionTest
  ✓ it issues a private URL and records one granted attempt for a paid owner                                     0.13s  
  ✓ it rejects a different customer even when they know the purchased item id                                    0.11s  
  ✓ it rejects an unpaid item even with an active quota record                                                   0.12s  
  ✓ it rejects an expired entitlement                                                                            0.23s  
  ✓ it rejects an exhausted quota without incrementing it                                                        0.26s  
  ✓ it rejects an item without an entitlement record                                                             0.09s  
  ✓ it does not consume quota when the private asset is missing                                                  0.11s  

   PASS  Tests\Feature\Actions\ProcessPaymentWebhookActionTest
  ✓ it successfully processes a settlement webhook and updates order to paid                                     0.17s  
  ✓ it automatically generates download tokens via listener when order settles                                   0.20s  
  ✓ it rejects webhooks with spoofed or invalid signatures                                                       0.07s  
  ✓ it is strictly idempotent on repeated settlement webhooks                                                    0.23s  
  ✓ it maps expire status to expired order status                                                                0.11s  
  ✓ it maps cancel and deny statuses to failed order status                                                      0.11s  
  ✓ it rejects a signed notification whose amount differs from the locked order price                            0.09s  
  ✓ it rejects status tampering despite a valid notification signature                                           0.10s  
  ✓ it preserves one webhook receipt and one payment on duplicate delivery                                       0.16s  
  ✓ it revokes an existing entitlement after a gateway-confirmed refund                                          0.13s  
  ✓ it does not revoke a paid order for a different denied transaction                                           0.14s  

   PASS  Tests\Feature\Admin\AdminCategoryTest
  ✓ it displays category listing for admin                                                                       0.26s  
  ✓ it allows admin to store a new category                                                                      0.09s  
  ✓ it allows admin to update category                                                                           0.08s  
  ✓ it prevents deletion of category if it contains products                                                     0.09s  
  ✓ it allows deletion of category if it contains no products                                                    0.08s  

   PASS  Tests\Feature\Admin\AdminDashboardTest
  ✓ it redirects unauthenticated guests away from admin dashboard                                                0.07s  
  ✓ it forbids normal customers from accessing admin dashboard with 403                                          0.07s  
  ✓ it allows admin users to view executive dashboard with analytics and ledger                                  0.13s  
  ✓ it streams a sales CSV report for administrator                                                              0.10s  
  ✓ it streams every order across chunks and neutralizes spreadsheet formulas from customer data                 0.37s  
  ✓ it denies every admin route to a customer who knows its URL                                                  0.20s  

   PASS  Tests\Feature\Admin\AdminOrderTest
  ✓ it displays orders list on admin order index with filtering                                                  0.18s  
  ✓ it displays order detail and payment audit ledger for admin                                                  0.20s  

   PASS  Tests\Feature\Admin\AdminProductTest
  ✓ it displays products list on admin product index                                                             0.11s  
  ✓ it allows admin to create a new e-book with cover image and digital file                                     0.14s  
  ✓ it allows admin to toggle publish state of an e-book                                                         0.11s  
  ✓ it allows admin to update an existing product                                                                0.10s  
  ✓ it rejects creating a product without a private digital asset                                                0.09s  
  ✓ it rejects a file whose extension differs from the selected product format                                   0.10s  
  ✓ it rejects executable uploads as digital products                                                            0.08s  
  ✓ it blocks publication when the private asset is missing                                                      0.21s  
  ✓ it does not allow replacing a private asset after a customer has purchased it                                0.12s  
  ✓ it prevents deletion of products that have been purchased by customers                                       0.20s  
  ✓ it allows deletion of products with no transaction history                                                   0.09s  

   PASS  Tests\Feature\Auth\AuthenticationTest
  ✓ login screen can be rendered                                                                                 0.08s  
  ✓ users can authenticate using the login screen                                                                0.08s  
  ✓ users can not authenticate with invalid password                                                             0.31s  
  ✓ users can logout                                                                                             0.10s  

   PASS  Tests\Feature\Auth\EmailVerificationTest
  ✓ email verification screen can be rendered                                                                    0.20s  
  ✓ email can be verified                                                                                        0.09s  
  ✓ email is not verified with invalid hash                                                                      0.08s  

   PASS  Tests\Feature\Auth\PasswordConfirmationTest
  ✓ confirm password screen can be rendered                                                                      0.08s  
  ✓ password can be confirmed                                                                                    0.07s  
  ✓ password is not confirmed with invalid password                                                              0.30s  

   PASS  Tests\Feature\Auth\PasswordResetTest
  ✓ reset password link screen can be rendered                                                                   0.10s  
  ✓ reset password link can be requested                                                                         0.27s  
  ✓ reset password screen can be rendered                                                                        0.30s  
  ✓ password can be reset with valid token                                                                       0.33s  

   PASS  Tests\Feature\Auth\PasswordUpdateTest
  ✓ password can be updated                                                                                      0.10s  
  ✓ correct password must be provided to update password                                                         0.09s  

   PASS  Tests\Feature\Auth\RegistrationTest
  ✓ registration screen can be rendered                                                                          0.08s  
  ✓ new users can register                                                                                       0.17s  

   PASS  Tests\Feature\BookilConstraintsTest
  ✓ it enforces unique business identifiers with dataset "category slug"                                         0.09s  
  ✓ it enforces unique business identifiers with dataset "product slug"                                          0.09s  
  ✓ it enforces unique business identifiers with dataset "order number"                                          0.08s  
  ✓ it enforces unique business identifiers with dataset "gateway transaction"                                   0.09s  
  ✓ it allows only one copy of a digital product per order                                                       0.22s  
  ✓ it keeps one quota record per purchased item                                                                 0.10s  
  ✓ it rejects orphan foreign keys with dataset "product category"                                               0.07s  
  ✓ it rejects orphan foreign keys with dataset "order customer"                                                 0.07s  
  ✓ it rejects orphan foreign keys with dataset "item order"                                                     0.10s  
  ✓ it rejects orphan foreign keys with dataset "payment order"                                                  0.09s  
  ✓ it rejects orphan foreign keys with dataset "token item"                                                     0.25s  
  ✓ it rejects an orphan product even through direct database writes                                             0.08s  
  ✓ it protects referenced catalog and financial records from deletion with ('category')                         0.09s  
  ✓ it protects referenced catalog and financial records from deletion with ('product')                          0.11s  
  ✓ it protects referenced catalog and financial records from deletion with ('user')                             0.11s  
  ✓ it protects orders that have gateway transactions                                                            0.11s  
  ✓ it cascades order deletion to its items and tokens                                                           0.15s  
  ✓ it cascades item deletion to its token                                                                       0.12s  
  ✓ it applies safe database defaults without factory defaults                                                   0.10s  
  ✓ it enforces status enums at the database boundary with dataset "user role"                                   0.10s  
  ✓ it enforces status enums at the database boundary with dataset "order status"                                0.10s  
  ✓ it enforces status enums at the database boundary with dataset "payment status"                              0.10s  
  ✓ it enforces status enums at the database boundary with dataset "file type"                                   0.11s  

   PASS  Tests\Feature\BookilModelsTest
  ✓ it persists customer roles by default and hashes passwords                                                   0.12s  
  ✓ it rejects privilege escalation through mass assignment                                                      0.19s  
  ✓ it casts all monetary values to fixed decimal strings                                                        0.10s  
  ✓ it casts order statuses after a database round trip with (App\Enums\OrderStatus Enum (PENDING, 'pending'))   0.08s  
  ✓ it casts order statuses after a database round trip with (App\Enums\OrderStatus Enum (PAID, 'paid'))         0.08s  
  ✓ it casts order statuses after a database round trip with (App\Enums\OrderStatus Enum (FAILED, 'failed'))     0.10s  
  ✓ it casts order statuses after a database round trip with (App\Enums\OrderStatus Enum (EXPIRED, 'expired'))   0.09s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (PENDING, 'pending… 0.11s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (CAPTURE, 'capture… 0.14s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (SETTLEMENT, 'sett… 0.11s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (DENY, 'deny'))     0.10s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (CANCEL, 'cancel')… 0.10s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (EXPIRE, 'expire')… 0.10s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (FAILURE, 'failure… 0.08s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (REFUND, 'refund')… 0.08s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (CHARGEBACK, 'char… 0.12s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (PARTIAL_REFUND, '… 0.08s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (PARTIAL_CHARGEBAC… 0.22s  
  ✓ it casts gateway statuses after a database round trip with (App\Enums\PaymentStatus Enum (AUTHORIZE, 'autho… 0.14s  
  ✓ it casts digital file types after a database round trip with (App\Enums\FileType Enum (PDF, 'pdf'))          0.15s  
  ✓ it casts digital file types after a database round trip with (App\Enums\FileType Enum (EPUB, 'epub'))        0.09s  
  ✓ it casts digital file types after a database round trip with (App\Enums\FileType Enum (ZIP, 'zip'))          0.10s  
  ✓ it casts booleans, JSON, counters and immutable timestamps                                                   0.11s  
  ✓ it does not serialize private asset paths or gateway payloads                                                0.09s  
  ✓ it loads the purchase graph explicitly in both directions                                                    0.13s  
  ✓ it retains the purchased price when the catalog price changes                                                0.11s  
  ✓ it enables all Eloquent strictness safeguards                                                                0.21s  
  ✓ it seeds categories idempotently without creating accounts or fictional assets                               0.14s  
PASS APP_ENV
PASS APP_DEBUG
PASS APP_URL
PASS MIDTRANS_SERVER_KEY
PASS MIDTRANS_IS_PRODUCTION
PASS PRIVATE_DISK
PASS BOOKIL_PAYMENT_SIMULATOR_ENABLED
PASS MAIL_MAILER
PASS TRUSTED_PROXIES
PREFLIGHT_REJECTED=FAIL APP_DEBUG EXIT=1
PREFLIGHT_REJECTED=FAIL APP_ENV EXIT=1
PREFLIGHT_REJECTED=FAIL APP_URL EXIT=1
PREFLIGHT_REJECTED=FAIL MIDTRANS_SERVER_KEY EXIT=1
PREFLIGHT_REJECTED=FAIL MIDTRANS_IS_PRODUCTION EXIT=1
PREFLIGHT_REJECTED=FAIL PRIVATE_DISK EXIT=1
PREFLIGHT_REJECTED=FAIL BOOKIL_PAYMENT_SIMULATOR_ENABLED EXIT=1
PREFLIGHT_REJECTED=FAIL MAIL_MAILER EXIT=1
PREFLIGHT_REJECTED=FAIL MAIL_MAILER EXIT=1
PREFLIGHT_REJECTED=WARN TRUSTED_PROXIES EXIT=1
PREFLIGHT_REJECTED=WARN TRUSTED_PROXIES EXIT=1

   PASS  Tests\Feature\BookilPreflightTest
  ✓ it passes the synthetic deployment profile without printing its secret value                                 0.23s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "debug"                                0.08s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "environment"                          0.17s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "URL scheme"                           0.08s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "missing key"                          0.06s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "sandbox mode"                         0.07s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "local storage"                        0.07s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "simulator"                            0.08s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "log mailer"                           0.18s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "array mailer"                         0.07s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "missing proxies"                      0.10s  
  ✓ it fails preflight for each incorrect deployment setting with dataset "wildcard proxy"                       0.10s  
RECONCILE=pending->paid->paid PAYMENTS=1 PAID_EVENTS=1 STATUS_API_REQUESTS=3
RECONCILE_WRONG_AMOUNT_EXIT=1 PAYMENTS=0 ORDER_STATUS=pending
RECONCILE_OUTAGE_EXIT=1 PAYMENTS=0 ORDER_STATUS=pending

   PASS  Tests\Feature\BookilReconcileTest
  ✓ it reconciles a pending order and treats a repeat reconciliation as a no-op                                  0.17s  
  ✓ it rejects amount mismatch without recording a payment                                                       0.11s  
  ✓ it fails cleanly during a Midtrans outage                                                                    0.08s  
  ✓ it rejects a status response identifying a different order                                                   0.10s  

   PASS  Tests\Feature\BrowserRegressionTest
  ✓ it serves a signed local PDF as an attachment with its security headers intact                               0.08s  
  ✓ it rejects a tampered local asset signature without returning the PDF                                        0.09s  
  ✓ it keeps pending invoice product metadata when Snap is unavailable                                           0.17s  
  ✓ it rejects an empty product description before writing to the database with ('create')                       0.11s  
  ✓ it rejects an empty product description before writing to the database with ('update')                       0.12s  
  ✓ it finds published catalog entries regardless of search capitalization with ('title')                        0.10s  
  ✓ it finds published catalog entries regardless of search capitalization with ('author')                       0.13s  
  ✓ it finds published catalog entries regardless of search capitalization with ('description')                  0.14s  

   PASS  Tests\Feature\CatalogTest
  ✓ it displays published products on the storefront catalog                                                     0.11s  
  ✓ it does not leak unpublished products on the catalog                                                         0.11s  
  ✓ it filters catalog products by category slug                                                                 0.24s  
  ✓ it searches products by title and author                                                                     0.14s  
  ✓ it displays product detail page for a published product                                                      0.12s  
  ✓ it returns 404 for unpublished product detail page                                                           0.09s  
CHECKOUT_CREATED=10 ELEVENTH_HTTP=429 SNAP_CALLS=10 DISTINCT_SNAP_ORDERS=10

   PASS  Tests\Feature\CheckoutRateLimitTest
  ✓ it allows ten real checkouts and rejects the eleventh before calling Snap                                    0.41s  

   PASS  Tests\Feature\CheckoutTest
  ✓ it requires authentication to checkout                                                                       0.23s  
  ✓ it validates product_id is required and must exist                                                           0.11s  
  ✓ it rejects checkout of an unpublished product                                                                0.08s  
  ✓ it creates an order and retrieves snap token from midtrans                                                   0.12s  
  ✓ it allows customer to view their order invoice                                                               0.35s  
  ✓ it forbids customers from viewing orders belonging to another user                                           0.12s  
  ✓ it reuses the stored Snap session when a pending order is viewed repeatedly                                  0.15s  
  ✓ it does not invent a Snap token when the gateway is unavailable                                              0.12s  
UNVERIFIED_CHECKOUT_HTTP=403 LIBRARY_HTTP=200 ORDER_ROWS=0
VERIFICATION_EMAILS=6 SEVENTH_HTTP=429

   PASS  Tests\Feature\CustomerIntegrityTest
  ✓ it requires verification only for checkout and keeps browsing and the library open                           0.13s  
  ✓ it resends verification mail six times and throttles the seventh attempt                                     0.09s  

   PASS  Tests\Feature\CustomerLibraryTest
  ✓ it redirects unauthenticated users from personal library dashboard                                           0.18s  
  ✓ it displays customer personal digital library with active tokens and order history                           0.46s  
PROXY_SIGNED_SCHEME=https DOWNLOAD_HTTP=302 AUDIT_IP=203.0.113.55

   PASS  Tests\Feature\DeploymentWiringTest
  ✓ it accepts a signed download behind a trusted HTTPS proxy and records the client IP                          0.44s  
  ✓ it ignores forwarded IPs from an untrusted peer                                                              0.15s  
  ✓ it adds report-only browser headers and omits HSTS during testing                                            0.20s  
  ✓ it adds HSTS only in the production environment                                                              0.23s  
  ✓ it throttles repeated guest auth submissions with ('/register')                                              0.28s  
  ✓ it throttles repeated guest auth submissions with ('/forgot-password')                                       0.22s  
  ✓ it throttles repeated guest auth submissions with ('/reset-password')                                        0.22s  
BAD_SIGNATURE_REQUESTS=200 DENIED_SIGNATURE_ROWS=1 DENIED_THROTTLED_ROWS=1 QUOTA=0
THROTTLED_REQUESTS=100 DENIED_THROTTLED_ROWS=1 QUOTA_BEFORE=30 QUOTA_AFTER=30
ROTATED_IDS=50 THROTTLED_RESPONSES=20 AUDIT_ROWS=2
PRUNE_DOWNLOAD_ROWS=2->1 PRUNE_WEBHOOK_ROWS=2->1 PAYMENTS=1 ORDERS=1 ITEMS=1

   PASS  Tests\Feature\DownloadAuditRetentionTest
  ✓ it bounds audit writes for 200 bad signatures without consuming quota                                        2.84s  
  ✓ it records only one denial for 100 throttled requests and preserves quota                                    2.13s  
  ✓ it shares a throttle bucket across 50 nonexistent item ids                                                   0.51s  
  ✓ it prunes old audit rows while retaining recent rows and financial records                                   0.20s  

   PASS  Tests\Feature\DownloadRouteTest
  ✓ it requires authentication to access digital downloads                                                       0.08s  
  ✓ it redirects to the private presigned URL for an authorized customer                                         0.18s  
  ✓ it returns 403 when a user attempts to download an item they do not own                                      0.19s  
  ✓ it returns 403 when attempting to download an unpaid order item                                              0.18s  
  ✓ it returns 410 when attempting to download with an expired entitlement                                       1.95s  
  ✓ it returns 429 when maximum download quota has been exceeded                                                 0.15s  
  ✓ it rejects unsigned download URLs                                                                            0.10s  
  ✓ it logs a hand-edited signature denial without charging quota                                                0.23s  
  ✓ it rejects an expired route signature before charging the download quota                                     0.14s  
  ✓ it logs the 31st signed download as throttled without charging quota                                         0.49s  
EXTENSION_EXPIRED=0 MAX_DOWNLOADS=5->8 USED_DOWNLOADS=5 AUDIT_ROWS=1
EXTENSION_EXPIRED=1 MAX_DOWNLOADS=5->8 USED_DOWNLOADS=5 AUDIT_ROWS=1

   PASS  Tests\Feature\EntitlementExtensionTest
  ✓ it rejects customer entitlement extensions without changing quota or audit                                   0.14s  
  ✓ it extends entitlement from the later of now and expiry with an audit row with (false)                       0.11s  
  ✓ it extends entitlement from the later of now and expiry with an audit row with (true)                        0.12s  
  ✓ it rejects extensions for a non-paid order                                                                   0.17s  
  ✓ it rejects an empty extension and negative download deltas with (0)                                          0.17s  
  ✓ it rejects an empty extension and negative download deltas with (-1)                                         0.16s  

   PASS  Tests\Feature\ExampleTest
  ✓ it returns a successful response                                                                             0.14s  
SETTLEMENT_RECEIPTS=1 REPLAY_RECEIPTS=1 REFUND_RECEIPTS=1 PAYMENT_ROWS=1 DOWNLOAD_LINKS_IN_MAIL=0

   PASS  Tests\Feature\OrderReceiptTest
  ✓ it sends one receipt on settlement and none on replay or refund                                              0.34s  
WEBHOOK_HTTP=500 PAYMENT_ROWS=0 WEBHOOK_ROWS=0 ORDER_STATUS=pending

   PASS  Tests\Feature\PaymentWebhookRouteTest
  ✓ it returns a retryable error without recording payment when the status API is unavailable                    0.12s  
  ✓ it processes a valid midtrans webhook via POST without CSRF verification                                     0.18s  
  ✓ it rejects midtrans webhooks with an invalid signature with 401                                              0.24s  
  ✓ it handles duplicate webhook notifications idempotently with HTTP 200                                        0.22s  

   PASS  Tests\Feature\ProfileTest
  ✓ profile page is displayed                                                                                    0.09s  
  ✓ profile information can be updated                                                                           0.09s  
  ✓ email verification status is unchanged when the email address is unchanged                                   0.12s  
  ✓ user can delete their account                                                                                0.12s  
  ✓ correct password must be provided to delete account                                                          0.11s  

   PASS  Tests\Feature\RoutingGuardsTest
  ✓ it returns 404 for both legacy task endpoints                                                                0.11s  
  ✓ it keeps the download audit throttle and signature middleware in order                                       0.09s  

   PASS  Tests\Migrations\BookilMigrationTest
  ✓ it upgrades existing users and reverses only the Bookil migrations                                           0.57s  

   PASS  Tests\Migrations\PostgresRowLockTest
  ✓ it blocks a second connection from locking an order held by the first connection                             0.71s  
REAL_TRANSACTION=COMMIT RECEIPTS_BEFORE=0 RECEIPTS_AFTER=1
REAL_TRANSACTION=ROLLBACK RECEIPTS_BEFORE=0 RECEIPTS_AFTER=0

   PASS  Tests\Migrations\ReceiptCommitBoundaryTest
  ✓ it queues the receipt only after the real outer transaction commits with (true)                              0.20s  
  ✓ it queues the receipt only after the real outer transaction commits with (false)                             0.16s  

  Tests:    205 passed (1265 assertions)
  Duration: 38.28s


```

### pint.txt

```text
{"tool":"pint","result":"passed"}

```

### build.txt

```text

> build
> tsc && vite build

vite v6.4.3 building for production...
transforming...
✓ 1036 modules transformed.
rendering chunks...
computing gzip size...
public/build/manifest.json                                     14.00 kB │ gzip:   1.51 kB
public/build/assets/app-CEP842_i.css                           89.31 kB │ gzip:  14.20 kB
public/build/assets/EntitlementNotice-B-rPxIec.js               0.17 kB │ gzip:   0.16 kB
public/build/assets/TextInput-Dh6dOu9Z.js                       0.76 kB │ gzip:   0.45 kB
public/build/assets/GuestLayout-C7rQCKRQ.js                     0.96 kB │ gzip:   0.54 kB
public/build/assets/ConfirmPassword-D7P80s2s.js                 1.08 kB │ gzip:   0.60 kB
public/build/assets/BookCoverImage-DHS6jy7_.js                  1.09 kB │ gzip:   0.63 kB
public/build/assets/VerifyEmail-q6f_KS7W.js                     1.21 kB │ gzip:   0.68 kB
public/build/assets/ResetPassword-BfuQ4HJf.js                   1.68 kB │ gzip:   0.66 kB
public/build/assets/StatusBadge-CoJs-Fxn.js                     1.70 kB │ gzip:   0.54 kB
public/build/assets/ApplicationLogo-UMHYxHU8.js                 1.72 kB │ gzip:   0.67 kB
public/build/assets/ForgotPassword-C54z7Qmx.js                  2.34 kB │ gzip:   1.06 kB
public/build/assets/UpdateProfileInformationForm-BORPutWc.js    3.77 kB │ gzip:   1.42 kB
public/build/assets/AuthLayout-yUqlXr_p.js                      4.41 kB │ gzip:   1.51 kB
public/build/assets/UpdatePasswordForm-B_zaz1-2.js              4.56 kB │ gzip:   1.42 kB
public/build/assets/Login-CictK-oC.js                           4.74 kB │ gzip:   1.62 kB
public/build/assets/Register-CJSgeKcm.js                        5.31 kB │ gzip:   1.54 kB
public/build/assets/Privacy-BgTvcSNP.js                         6.35 kB │ gzip:   1.98 kB
public/build/assets/ErrorPage-Cy1x60s-.js                       6.52 kB │ gzip:   2.46 kB
public/build/assets/AdminLayout-DgxKF_7L.js                     6.57 kB │ gzip:   1.91 kB
public/build/assets/Index-R2KaZtfe.js                           6.66 kB │ gzip:   2.26 kB
public/build/assets/Index-BkOWRgOn.js                           7.07 kB │ gzip:   2.10 kB
public/build/assets/InstantCheckoutModal-B0zU4Muv.js            7.25 kB │ gzip:   2.27 kB
public/build/assets/Index-Wo1HB8gy.js                           7.28 kB │ gzip:   2.47 kB
public/build/assets/RefundPolicy-M-NlF--7.js                    7.93 kB │ gzip:   2.49 kB
public/build/assets/Edit-CS3rYPjt.js                            8.43 kB │ gzip:   2.20 kB
public/build/assets/Terms-BBgpqrQ4.js                           9.44 kB │ gzip:   2.83 kB
public/build/assets/CommandPalette-l1gGHXa9.js                  9.93 kB │ gzip:   3.21 kB
public/build/assets/Show-DMHpU-Mf.js                           10.30 kB │ gzip:   2.94 kB
public/build/assets/Show-DF4wYVlZ.js                           10.84 kB │ gzip:   3.05 kB
public/build/assets/Form-CxnOcr4Q.js                           11.13 kB │ gzip:   2.88 kB
public/build/assets/Dashboard-C7gX71FP.js                      11.80 kB │ gzip:   3.04 kB
public/build/assets/Dashboard-CVmS8phM.js                      11.83 kB │ gzip:   3.09 kB
public/build/assets/Show-Bo9_7v3W.js                           12.36 kB │ gzip:   3.06 kB
public/build/assets/StoreLayout-C4iQ1Cvs.js                    13.57 kB │ gzip:   3.33 kB
public/build/assets/Index-DwrPIEsc.js                          13.72 kB │ gzip:   3.82 kB
public/build/assets/transition-Ch9XUemw.js                     14.94 kB │ gzip:   5.92 kB
public/build/assets/Faq-VkAV49KH.js                            16.91 kB │ gzip:   4.77 kB
public/build/assets/Welcome-C09ztJfg.js                        19.29 kB │ gzip:   5.86 kB
public/build/assets/DeleteUserForm-Dyfz6fFj.js                 34.81 kB │ gzip:  12.57 kB
public/build/assets/app-sZfrJ-xo.js                           440.86 kB │ gzip: 143.37 kB
✓ built in 5.03s

```

### http-upload.txt

```text
BAD MIME HTTP 422
{"message":"The digital file field must be a file of type: pdf, epub, zip. (and 1 more error)","errors":{"digital_file":["The digital file field must be a file of type: pdf, epub, zip.","Format berkas harus sesuai dengan format yang dipilih."]}}
MISSING FILE HTTP 422
{"message":"The digital file field is required.","errors":{"digital_file":["The digital file field is required."]}}
VALID UPLOAD HTTP 302
Location: http://127.0.0.1:8002/admin/products
Product ID: 22
Private file exists: yes
File size: 218
Published: yes
COVER HTTP 200 image/png

```

### runtime-after.txt

```text
HTTP 200
Content-Type: application/pdf
Content-Disposition: attachment; filename=browser-sample.pdf
Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox
X-Frame-Options: DENY
Received bytes: 218
Product 20 persisted slug: qa-digital-book-20
Granted attempts: 3
Ownership denials: 1
Entitlement extensions: 1

```

### database-proof.txt

```text
DB_DRIVER=pgsql
UI_CHECKOUT_ORDER=BK-01M3P9K6JRBH5HSAZEV8RWQK78 STATUS=pending TOTAL=30000.00 ITEMS=1 PAYMENTS=0
ORDER_ROWS_AFTER_RETRY=8
UI_UPDATED_PRODUCT_TITLE=QA HTTP Uploaded Book Updated SLUG=qa-http-upload FILE_SIZE=218
PRIVATE_FILE_EXISTS=yes
EXTENSION_ROWS=1 ACTOR=3 ITEM=2 DOWNLOAD_DELTA=2 DAY_DELTA=7
DOWNLOAD_OUTCOMES={"denied_signature":1,"storage_error":1,"denied_owner":1,"granted":3}

```
