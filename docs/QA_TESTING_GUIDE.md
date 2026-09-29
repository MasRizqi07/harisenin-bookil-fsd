# 🧪 Master QA & Testing Strategy Guide — Bookil

**Document Title:** Bookil Platform Quality Assurance, Verification & Automated Testing Reference  
**Version:** 1.1.0 (Production-Grade QA Baseline)  
**Status:** Approved / Active Baseline  
**Audience:** Lead QA Engineers, SDET (Software Development Engineers in Test), Security Auditors, Technical Reviewers  
**Date:** September 2026  
**Automated Evidence:** 204 Passed Pest Tests (1,260 Assertions) on PostgreSQL  

---

## 📑 Daftar Isi

1. [Filosofi QA & Strategi Pengujian (Test Pyramid)](#1-filosofi-qa--strategi-pengujian-test-pyramid)
2. [Lingkungan Pengujian & Konfigurasi Basis Data](#2-lingkungan-pengujian--konfigurasi-basis-data)
3. [Inventaris & Struktur Test Suite Pest PHP](#3-inventaris--struktur-test-suite-pest-php)
4. [Panduan Eksekusi Tes Otomatis (Test Execution Guide)](#4-panduan-eksekusi-tes-otomatis-test-execution-guide)
5. [Matriks Skenario Pengujian Menyeluruh (Test Scenarios Matrix)](#5-matriks-skenario-pengujian-menyeluruh-test-scenarios-matrix)
   * [5.1 Storefront, Discovery & Command Palette](#51-storefront-discovery--command-palette)
   * [5.2 Otentikasi, Guard Email & Otorisasi Peran](#52-otentikasi-guard-email--otorisasi-peran)
   * [5.3 Checkout, Row Locking & Anti-Price Tampering](#53-checkout-row-locking--anti-price-tampering)
   * [5.4 Webhook Idempotency & Verifikasi SHA-512](#54-webhook-idempotency--verifikasi-sha-512)
   * [5.5 Secure Download Engine, Quota & Token Expiry](#55-secure-download-engine-quota--token-expiry)
   * [5.6 Admin Entitlement Extension & Audit Trail](#56-admin-entitlement-extension--audit-trail)
   * [5.7 Admin Executive Analytics & Streaming CSV Export](#57-admin-executive-analytics--streaming-csv-export)
6. [Panduan Simulasi Pembayaran & Webhook Midtrans](#6-panduan-simulasi-pembayaran--webhook-midtrans)
7. [Checklist Pengujian Manual Antarmuka (Browser QA Across Viewports)](#7-checklist-pengujian-manual-antarmuka-browser-qa-across-viewports)
8. [Log Verifikasi Regresi & Perbaikan Bug (Browser Regressions)](#8-log-verifikasi-regresi--perbaikan-bug-browser-regressions)
9. [Kriteria Kelulusan & Quality Sign-Off](#9-kriteria-kelulusan--quality-sign-off)

---

## 1. Filosofi QA & Strategi Pengujian (Test Pyramid)

Sistem penjaminan mutu (**Quality Assurance**) pada **Bookil** dirancang untuk memastikan keandalan mutlak pada transaksi finansial, perlindungan hak cipta berkas digital, dan stabilitas antarmuka pengguna responsif.

```text
               / \
              /   \
             / E2E \          <-- Browser QA (Chrome Viewports 320px-1536px)
            / Browser\            DOM validation, Attachment stream verification
           /-----------\
          / Integration \      <-- Feature Tests (Controllers, Webhooks,
         /  & Security   \         Middleware Guards, Rate Limiters, Signatures)
        /-----------------\
       /    Concurrency    \   <-- PostgreSQL Row-Lock Concurrency Tests
      /      & Actions      \      (SQLSTATE 55P03, bcadd precision, Atomic Updates)
     /-----------------------\
    /       Unit Tests        \ <-- Models, Enums, Exceptions, Casts,
   /      & Constraints        \    Foreign Keys, Cascade/Restrict Integrity
  /-----------------------------\
```

### Pilar Pengujian Mutu:
1. **Real PostgreSQL Concurrency Evidence:** Pengetesan konkurensi tidak mengandalkan SQLite in-memory, melainkan dieksekusi langsung pada PostgreSQL dengan *two-connection row lock* dan limit timeout 500ms.
2. **Zero False Positives:** Setiap pengujian memverifikasi *state changes* di basis data nyata, bukan sekadar memeriksa status kode HTTP.
3. **Idempotency Verification:** Skenario pengujian menguji respon sistem terhadap *event* duplikat untuk memastikan saldo dan token tidak terduplikasi.
4. **Strict Eloquent Enforcement:** Mengaktifkan deteksi otomatis *N+1 queries* dan pelanggaran *mass-assignment* selama test suite berjalan.

---

## 2. Lingkungan Pengujian & Konfigurasi Basis Data

| Komponen | Pengujian Lokal Cepat | Pengujian Integrasi & CI Penuh (Evidence Gate) |
| :--- | :--- | :--- |
| **Database Engine** | SQLite (`:memory:`) | **PostgreSQL 16 / 18.4 (Dedicated Test DB)** |
| **Row Lock Validation** | N/A (SQLite tidak mendukung row-lock) | **PostgreSQL Two-Connection Test (`55P03`)** |
| **Storage Driver** | `Storage::fake('private_disk')` | `Storage::fake('private_disk')` & Local Attachment |
| **Queue Connection** | `sync` | `sync` / Redis Test Workers |
| **Mail Driver** | `log` / `Mail::fake()` | `Mail::fake()` (Asserting Queue Boundaries) |
| **Payment Gateway** | Fake Responses / Simulator | Fake Responses + Webhook Signature Computation |

---

## 3. Inventaris & Struktur Test Suite Pest PHP

Suite pengujian Bookil terdiri dari **204 pengujian otomatis dengan 1,260 assertions** yang terbagi ke dalam kategori:

```text
tests/
├── Feature/
│   ├── Actions/
│   │   ├── CreateOrderActionTest.php               # Kalkulasi desimal bcadd & row locking
│   │   ├── ProcessPaymentWebhookActionTest.php     # Signature SHA-512 & idempotency
│   │   └── GenerateSecureDownloadActionTest.php    # Quota decrements & presigned generation
│   ├── Admin/
│   │   ├── AdminCategoryTest.php                   # CRUD & restrictOnDelete
│   │   ├── AdminDashboardTest.php                  # KPI metrics & CSV export UTF-8 BOM
│   │   ├── AdminOrderTest.php                      # Audit viewer & payload inspector
│   │   └── AdminProductTest.php                    # Product CRUD & toggle publish
│   ├── Auth/
│   │   ├── AuthenticationTest.php                  # Login, logout, throttle
│   │   ├── EmailVerificationTest.php               # Verified middleware guard
│   │   ├── PasswordConfirmationTest.php            # Security re-auth
│   │   ├── PasswordResetTest.php                   # Token-based password recovery
│   │   ├── PasswordUpdateTest.php                  # Password mutation
│   │   └── RegistrationTest.php                    # Role customer assignment
│   ├── BookilConstraintsTest.php                   # DB schema & foreign key rules
│   ├── BookilModelsTest.php                        # Casts, relationships, enums
│   ├── BookilPreflightTest.php                     # CLI diagnostic preflight
│   ├── BookilReconcileTest.php                     # CLI payment reconciliation
│   ├── BrowserRegressionTest.php                   # 8 Browser regression safeguards
│   ├── CatalogTest.php                             # Search, categories, sorting, pagination
│   ├── CheckoutRateLimitTest.php                   # Rate limiter (10 req/min)
│   ├── CheckoutTest.php                            # Full instant checkout flow
│   ├── CustomerIntegrityTest.php                   # Customer boundary isolation
│   ├── CustomerLibraryTest.php                     # Library, quota bar, invoice views
│   ├── DeploymentWiringTest.php                    # Middlewares & routes registration
│   ├── DownloadAuditRetentionTest.php              # MassPrunable daily pruning
│   ├── DownloadRouteTest.php                       # HMAC signed URL & authorization
│   ├── EntitlementExtensionTest.php                # Admin extension (+quota, +days)
│   ├── OrderReceiptTest.php                        # Transactional receipt queue
│   ├── PaymentWebhookRouteTest.php                 # Webhook endpoint security
│   ├── ProfileTest.php                             # Profile update & deletion
│   └── RoutingGuardsTest.php                       # 403/404 route boundaries
├── Migrations/
│   ├── BookilMigrationTest.php                     # Schema migration integrity
│   ├── PostgresRowLockTest.php                     # PostgreSQL 55P03 row lock proof
│   └── ReceiptCommitBoundaryTest.php               # DB commit before email dispatch
└── Unit/
    └── ExampleTest.php                             # Basic unit sanity
```

---

## 4. Panduan Eksekusi Tes Otomatis (Test Execution Guide)

### 4.1 Menjalankan Seluruh Test Suite
```bash
# Menjalankan seluruh pengujian (Pest PHP)
php artisan test

# Menjalankan pengujian dengan output ringkas
php artisan test --compact

# Menjalankan pengujian tanpa warna untuk pencatatan log
php artisan test --compact --colors=never
```

### 4.2 Menjalankan Pengujian Spesifik
```bash
# Uji penguncian baris PostgreSQL (Concurrency Test)
php artisan test tests/Migrations/PostgresRowLockTest.php

# Uji proteksi regresi browser
php artisan test tests/Feature/BrowserRegressionTest.php

# Uji alur checkout dan webhook
php artisan test tests/Feature/CheckoutTest.php tests/Feature/PaymentWebhookRouteTest.php

# Uji perpanjangan kuota admin
php artisan test tests/Feature/EntitlementExtensionTest.php
```

### 4.3 Verifikasi Kualitas & Standardisasi Format Kode
```bash
# Format kode sesuai standar PSR-12 ketat
php vendor/bin/pint --test

# Typechecking TypeScript frontend
npm run typecheck

# Build aset frontend produksi
npm run build
```

---

## 5. Matriks Skenario Pengujian Menyeluruh (Test Scenarios Matrix)

### 5.1 Storefront, Discovery & Command Palette
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CAT-01** | Tampilkan katalog produk aktif | Akses `GET /` | Hanya produk dengan `is_published = true` yang muncul; draf tidak muncul. | Positif |
| **TC-CAT-02** | Pencarian teks case-insensitive | Kata kunci `"laravel"`, `"LARAVEL"`, `"LaRaVeL"` | Mengembalikan hasil buku yang sama tanpa terpengaruh huruf besar/kecil. | Positif |
| **TC-CAT-03** | Filter berdasarkan kategori | Parameter `category=ebooks` | Menampilkan hanya produk yang berelasi dengan kategori `ebooks`. | Positif |
| **TC-CAT-04** | Pengurutan harga terendah | Parameter `sort=price_asc` | Daftar produk diurutkan dari harga terendah ke tertinggi. | Positif |
| **TC-CAT-05** | Hasil pencarian kosong | Kata kunci tidak dikenal `"xyz123abc"` | Menampilkan Empty State ramah disertai tombol "Reset Semua Filter". | Boundary |
| **TC-CAT-06** | Navigasi Command Palette | Tekan `Ctrl + K` di browser | Membuka modal Command Palette dan auto-focus pada input pencarian. | UI / E2E |

### 5.2 Otentikasi, Guard Email & Otorisasi Peran
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Registrasi akun baru | POST data registrasi valid | User dibuat dengan peran default `customer` (Mass-Assignment role dicegah). | Keamanan |
| **TC-AUTH-02** | Proteksi rute admin dari customer | User customer akses `GET /admin/dashboard` | Mengembalikan **HTTP 403 Forbidden**. | Keamanan |
| **TC-AUTH-03** | Guard verifikasi email pada checkout | User belum verifikasi email klik checkout | Dialihkan ke rute verifikasi email dengan pesan informatif. | Bisnis |
| **TC-AUTH-04** | Akses library tanpa verifikasi email | User belum verifikasi email akses `/library` | Mengembalikan **HTTP 200 OK** (Buku yang pernah dibeli tetap dapat diakses). | Bisnis |
| **TC-AUTH-05** | Throttle resend email verifikasi | Trigger resend 7 kali berturut-turut | Permintaan ke-7 mengembalikan **HTTP 429 Too Many Requests**. | Boundary |

### 5.3 Checkout, Row Locking & Anti-Price Tampering
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CHK-01** | Instant checkout produk aktif | POST `/checkout` dengan `product_id` valid | Order dibuat dengan status `pending`, nomor `BK-[ULID]`, dan Snap Token diterima. | Positif |
| **TC-CHK-02** | Pencegahan manipulasi harga klien | Klien mengirim `total_amount: 1000` di form | Backend mengabaikan input klien; total dihitung via `bcadd` dari DB produk. | Keamanan |
| **TC-CHK-03** | Pembelian produk yang ditarik/draf | POST `/checkout` dengan produk `is_published=false` | Melempar `ProductUnavailableException` (**HTTP 409 Conflict**). | Negatif |
| **TC-CHK-04** | Concurrency Row-Lock Test | Dua transaksi konkuren mengunci baris produk yang sama | Transaksi kedua menunggu atau melempar kode PostgreSQL `SQLSTATE 55P03` saat lock timeout 500ms tercapai. | Konkurensi |
| **TC-CHK-05** | Rate limiter checkout | Trigger checkout 11 kali dalam 1 menit | Permintaan ke-11 menghasilkan **HTTP 429 Too Many Requests**. | Boundary |

### 5.4 Webhook Idempotency & Verifikasi SHA-512
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-WH-01** | Webhook settlement valid | Signature `SHA-512` cocok, status `settlement` | Order berubah menjadi `PAID`, download token SHA-256 dibuat, event di-dispatch. | Positif |
| **TC-WH-02** | Webhook dengan signature palsu | Hacker memalsukan nilai `signature_key` | Melempar `InvalidSignatureException` (**HTTP 403 Forbidden**); status order tidak berubah. | Keamanan |
| **TC-WH-03** | Nominal pembayaran tidak sesuai | `gross_amount` Midtrans beda dengan total tagihan | Melempar `PaymentAmountMismatchException` (**HTTP 422 Unprocessable**). | Keamanan |
| **TC-WH-04** | Webhook duplikat (Idempotensi) | Midtrans mengirim payload settlement yang sama 2x | Permintaan kedua mengembalikan **HTTP 200 OK** tanpa memicu event atau menduplikasi token. | Idempoten |
| **TC-WH-05** | Reversal transaksi (Refund/Chargeback) | Webhook status `refund` / `chargeback` | Status order dicabut; hak akses unduh dinonaktifkan secara otomatis. | Bisnis |

### 5.5 Secure Download Engine, Quota & Token Expiry
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-DL-01** | Unduh berkas sah oleh pemilik order | GET `/downloads/{item}` dengan signature valid | `download_count` bertambah (+1), log audit tercatat, dialihkan ke 15-min Presigned URL. | Positif |
| **TC-DL-02** | Unduh oleh pengguna bukan pemilik (IDOR) | Akun B mencoba mengunduh item milik Akun A | Melempar `UnauthorizedDownloadException` (**HTTP 403 Forbidden**). | Keamanan |
| **TC-DL-03** | Manipulasi signature URL unduhan | Query param `?signature=...` diubah 1 karakter | Ditolak oleh middleware `signed` (**HTTP 403 Invalid Signature**). | Keamanan |
| **TC-DL-04** | Kuota unduhan terlampaui | Mengunduh saat `download_count === 5` (maks 5) | Melempar `DownloadQuotaExceededException` (**HTTP 429 Too Many Requests**). | Boundary |
| **TC-DL-05** | Token unduh kedaluwarsa | Mengunduh setelah melewati masa aktif 30 hari | Melempar `DownloadTokenExpiredException` (**HTTP 410 Gone**). | Boundary |
| **TC-DL-06** | Unduh pada pesanan pending | Mengunduh item pesanan yang belum dibayar | Melempar `OrderNotPaidException` (**HTTP 403 Forbidden**). | Negatif |

### 5.6 Admin Entitlement Extension & Audit Trail
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ENT-01** | Admin perpanjang kuota unduhan | POST `/admin/order-items/{id}/entitlement` (+2 unduhan, alasan sah) | Kuota `max_downloads` bertambah dari 5 menjadi 7; audit tercatat di `entitlement_extensions`. | Positif |
| **TC-ENT-02** | Admin perpanjang masa aktif | POST dengan `additional_days: 14` | Tanggal `expires_at` diperpanjang 14 hari dari tanggal terjauh. | Positif |
| **TC-ENT-03** | Non-admin mencoba perpanjang | Customer mengirim POST ke rute entitlement | Ditolak oleh Policy Gate (**HTTP 403 Forbidden**). | Keamanan |
| **TC-ENT-04** | Perpanjang tanpa alasan (reason kosong) | Form submit dengan `reason: ""` | Mengembalikan error validasi form (**HTTP 422**). | Negatif |
| **TC-ENT-05** | Perpanjang pesanan yang gagal/batal | Mencoba memperpanjang order berstatus `failed` | Ditolak: Hanya pesanan `PAID` yang dapat diperpanjang. | Negatif |

### 5.7 Admin Executive Analytics & Streaming CSV Export
| ID Tes | Skenario Pengujian | Input / Kondisi | Ekspektasi Hasil | Jenis Tes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01** | Tampilan metrik KPI Dashboard | Akses `GET /admin/dashboard` | Menampilkan Gross Revenue lunas, total order, buku terlaris, dan order terbaru. | Positif |
| **TC-ADM-02** | Ekspor CSV penjualan | Klik tombol "Ekspor CSV" | Mengunduh file CSV dengan chunking 200 baris, memori stabil, dan menyertakan header UTF-8 BOM. | Performa |
| **TC-ADM-03** | Integritas penghapusan buku | Admin mencoba menghapus buku yang sudah pernah dibeli | Ditolak oleh aturan `restrictOnDelete` (error ramah ditampilkan, tidak crash 500). | Integritas |

---

## 6. Panduan Simulasi Pembayaran & Webhook Midtrans

QA Engineer dapat menguji skenario webhook secara manual di lingkungan lokal/sandbox:

### 6.1 Menggunakan Development Payment Simulator (UI Testing)
1. Pastikan konfigurasi `.env`:
   ```dotenv
   APP_ENV=local
   BOOKIL_PAYMENT_SIMULATOR_ENABLED=true
   ```
2. Login sebagai akun customer dan lakukan checkout buku.
3. Pada halaman faktur `/orders/{order_number}`, tombol **"Simulasi Bayar Instan (Dev Mode)"** akan tampil.
4. Klik tombol tersebut. Sistem akan menghasilkan signature HMAC SHA-512 lokal yang valid, memproses webhook idempoten, dan merilis hak unduh secara instan.

### 6.2 Menembak Webhook Manual via cURL
Untuk menguji verifikasi signature di terminal:

```bash
# 1. Tentukan variabel uji
ORDER_ID="BK-01J8K3R4P9XYZ"
STATUS_CODE="200"
GROSS_AMOUNT="189000.00"
SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"

# 2. Hitung signature SHA-512
# Signature = SHA-512(ORDER_ID + STATUS_CODE + GROSS_AMOUNT + SERVER_KEY)

# 3. Kirim POST request ke webhook
curl -X POST "http://127.0.0.1:8000/webhooks/midtrans" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "order_id": "'"$ORDER_ID"'",
    "transaction_id": "test-txn-12345",
    "transaction_status": "settlement",
    "status_code": "200",
    "gross_amount": "'"$GROSS_AMOUNT"'",
    "payment_type": "qris",
    "signature_key": "<HASIL_HASH_SHA512>",
    "settlement_time": "2026-09-29 17:30:00"
  }'
```

---

## 7. Checklist Pengujian Manual Antarmuka (Browser QA Across Viewports)

Semua halaman antarmuka telah diverifikasi pada 6 breakpoint viewport CSS:

- [x] **Small Phone (320px - 390px):**
  - Header navigasi membungkus proporsional tanpa memicu horizontal scrollbar liar.
  - Tombol checkout menempel rapi di dasar layar (*sticky buy bar*).
  - Modal detail pesanan tidak terpotong (*wrapping* teks panjang aman).
- [x] **Standard Smartphone (390px - 640px):**
  - Form login/register/forgot password terpusat dengan padding proporsional.
  - Modal Midtrans Snap muncul pas di tengah layar smartphone.
- [x] **Tablet Viewport (640px - 1024px):**
  - Katalog beralih ke tata letak 2 kolom seimbang.
  - Drawer sidebar admin dapat dibuka-tutup dengan animasi mulus.
- [x] **Standard Desktop (1024px - 1280px):**
  - Katalog 3 kolom dengan kartu buku proporsional.
  - Sidebar admin menetap di sisi kiri (*persistent navigation*).
- [x] **Wide Screen (1280px - 1536px):**
  - Kontainer dibatasi maksimal `max-w-7xl` untuk menjaga kenyamanan jarak baca (*reading comfort*).

---

## 8. Log Verifikasi Regresi & Perbaikan Bug (Browser Regressions)

Seluruh 8 temuan regresi browser telah diperbaiki dan dilindungi secara permanen oleh test suite `BrowserRegressionTest.php`:

1. **Reload Missing Invoice Relationships:** Faktur pending tetap menampilkan judul dan penulis buku saat Midtrans Snap offline/mengalami error.
2. **Strict Description Validation:** Validasi Form Request menolak draf produk dengan deskripsi kosong sebelum mencoba menulis ke database non-null.
3. **Streamed Local File Attachments:** Unduhan berkas privat lokal mengembalikan header `Content-Disposition: attachment` dengan byte file asli dan perlindungan tanda tangan.
4. **Case-Insensitive Catalog Search:** Pencarian PostgreSQL kini menggunakan fungsi `whereLike()` / `orWhereLike()`, menghasilkan hasil pencarian akurat baik huruf kecil maupun kapital.
5. **Form Error Helper Binding:** Form edit produk admin mengikat error validasi Inertia secara tepat (termasuk deteksi duplikasi slug).
6. **Book Cover Path Resolution:** Path gambar sampul diselesaikan secara konsisten ke `/storage/covers/...` dengan fallback ukuran byte yang presisi.
7. **Command Palette Keyboard Wiring:** Tombol pintas `Ctrl + K` dan navigasi tombol `Enter` terhubung sempurna ke filter katalog server.
8. **Responsive Header Wrapping:** Mengoreksi lebar header pada viewport 320px agar tidak terjadi luapan horizontal (*zero horizontal overflow*).

---

## 9. Kriteria Kelulusan & Quality Sign-Off

Sebelum rilis ke lingkungan staging atau produksi, seluruh kriteria wajib terpenuhi:

* [x] **204 Automated Pest Tests (100% Pass) pada basis data PostgreSQL nyata.**
* [x] **Pengujian Konkurensi PostgreSQL Row Locking lolos (SQLSTATE 55P03).**
* [x] **Format kode PHP 100% compliant dengan PSR-12 via Laravel Pint.**
* [x] **TypeScript compile & typecheck lolos tanpa error (`tsc --noEmit`).**
* [x] **Vite build frontend berhasil tanpa peringatan aset rusak.**
* [x] **Rate limiters checkout dan unduhan aktif.**
* [x] **Jejak audit pemangkasan harian (`model:prune`) terdaftar pada scheduler cron.**
