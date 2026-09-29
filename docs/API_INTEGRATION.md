# 🔌 API & Webhook Technical Reference — Bookil

**Document Title:** Bookil HTTP API, Webhook Integration & Secure Download Engine Reference  
**Version:** 1.1.0 (Production-Grade Specification)  
**Status:** Approved / Active Baseline  
**Audience:** Backend Engineers, Integration Developers, QA Engineers, Security Auditors, Technical Reviewers  
**Date:** September 2026  

---

## 📑 Daftar Isi

1. [Ikhtisar Protokol & Standar Komunikasi](#1-ikhtisar-protokol--standar-komunikasi)
2. [Otentikasi, Otorisasi & Skema Keamanan](#2-otentikasi-otorisasi--skema-keamanan)
3. [Katalog Endpoint Publik & Storefront](#3-katalog-endpoint-publik--storefront)
4. [Katalog Endpoint Pelanggan (Customer Checkout & Orders)](#4-katalog-endpoint-pelanggan-customer-checkout--orders)
5. [Spesifikasi Secure Digital Delivery (Download Engine)](#5-spesifikasi-secure-digital-delivery-download-engine)
6. [Integrasi Webhook Payment Gateway (Midtrans Snap)](#6-integrasi-webhook-payment-gateway-midtrans-snap)
7. [Operational CLI Reconciliation & Dev Simulator](#7-operational-cli-reconciliation--dev-simulator)
8. [Katalog Endpoint Administratif & Entitlement Extension](#8-katalog-endpoint-administratif--entitlement-extension)
9. [Format Respon & Pemetaan Kode Kesalahan (Error Mapping)](#9-format-respon--pemetaan-kode-kesalahan-error-mapping)

---

## 1. Ikhtisar Protokol & Standar Komunikasi

Bookil mengombinasikan protokol modern **Inertia.js v2 over HTTPS** untuk antarmuka pengguna interaktif dengan **RESTful JSON Webhooks** untuk integrasi sistem pihak ketiga (Midtrans Payment Gateway).

* **Base URL Produksi:** `https://bookil.com`
* **Base URL Sandbox / Staging:** `https://staging.bookil.com` (atau `http://127.0.0.1:8000` lokal)
* **Transport:** HTTPS TLS 1.3 / HTTP/2
* **Format Payload:** JSON (`Content-Type: application/json`, `Accept: application/json`)
* **Timezone Standar:** Asia/Jakarta (`UTC+07:00`) / ISO-8601 Strings (`2026-09-29T10:00:00Z`)

---

## 2. Otentikasi, Otorisasi & Skema Keamanan

| Skema Keamanan | Penerapan Endpoint | Mekanisme & Header |
| :--- | :--- | :--- |
| **Session Cookie + CSRF** | Rute Web Pelanggan & Admin (`/checkout`, `/admin/*`) | Cookie terenkripsi `bookil_session` + header `X-XSRF-TOKEN` |
| **Verified Email Guard** | Checkout (`POST /checkout`) | Middleware `verified` (hanya user dengan `email_verified_at != null`) |
| **Admin Role Guard** | Seluruh rute `/admin/*` | Middleware `admin` / Policy `viewAnyAsAdmin` (User enum `role === 'admin'`) |
| **Cryptographic HMAC SHA-256** | Unduhan Digital (`GET /downloads/*`) | Middleware `signed` (Query params `?expires=...&signature=...`) |
| **Cryptographic HMAC SHA-512** | Midtrans Webhook (`POST /webhooks/midtrans`) | Verifikasi signature `SHA-512` menggunakan `MIDTRANS_SERVER_KEY` rahasia |
| **Rate Limiting** | Checkout & Downloads | `throttle:10,1` (Checkout) & `throttle:downloads` (30 req/min) |

---

## 3. Katalog Endpoint Publik & Storefront

### 3.1 Ambil Katalog Produk (Storefront Index)
Mengembalikan daftar e-book yang aktif dipublikasikan (`is_published = true`) dengan filter dan paginasi.

* **Metode:** `GET`
* **Path:** `/` atau `/products`
* **Parameter Kueri:**
  * `search` *(string, opsional)*: Kata kunci pencarian judul, penulis, atau deskripsi (*case-insensitive*).
  * `category` *(string, opsional)*: Slug kategori produk (contoh: `ebooks`, `templates`).
  * `sort` *(string, opsional)*: `latest` (default), `price_asc`, `price_desc`.
  * `page` *(integer, opsional)*: Nomor halaman paginasi (12 item per halaman).
* **Contoh Request:**
  ```bash
  curl -X GET "https://bookil.com/?search=laravel&sort=price_asc" -H "Accept: text/html, application/json"
  ```

---

### 3.2 Ambil Detail Produk
Mengembalikan metadata lengkap buku untuk halaman produk dan modal cuplikan (*SamplePreviewModal*).

* **Metode:** `GET`
* **Path:** `/products/{slug}`
* **Respon:** Komponen Inertia `Products/Show` dengan props: `product`, `relatedProducts`, `auth`. Jika produk draf (`is_published = false`), mengembalikan HTTP 404.

---

## 4. Katalog Endpoint Pelanggan (Customer Checkout & Orders)

### 4.1 Inisiasi Checkout Instan (Create Order)
Membuat pesanan baru dan menghasilkan token Midtrans Snap dalam satu transaksi atomik dengan *pessimistic row locking*.

* **Metode:** `POST`
* **Path:** `/checkout`
* **Middleware:** `auth`, `verified`, `throttle:10,1`
* **Request Body (JSON / Form Data):**
  ```json
  {
    "product_id": 1,
    "notes": "Pembelian lisensi personal"
  }
  ```
* **Validasi Backend:**
  * `product_id`: `required|exists:products,id`
  * `notes`: `nullable|string|max:500`
* **Alur Eksekusi:**
  1. Baris produk dikunci dengan `lockForUpdate()`.
  2. Total harga dihitung ulang via `bcadd` (harga dari browser diabaikan total).
  3. Nomor pesanan `BK-[ULID]` dihasilkan.
  4. Memanggil Midtrans Snap API via `MidtransSnapService`.
  5. Redirect ke `/orders/{order_number}` dengan session flash `snap_token`.
* **Contoh Request via cURL:**
  ```bash
  curl -X POST "https://bookil.com/checkout" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "X-XSRF-TOKEN: {CSRF_TOKEN}" \
    -H "Cookie: bookil_session={SESSION_COOKIE}" \
    -d '{"product_id": 1}'
  ```

---

### 4.2 Lihat Faktur & Lanjutkan Pembayaran (Customer Invoice)
Menampilkan rincian tagihan, status order, dan memicu modal `window.snap.pay()` jika status masih `pending`.

* **Metode:** `GET`
* **Path:** `/orders/{order:order_number}`
* **Middleware:** `auth` (hanya pemilik order `order.user_id === auth.id` atau admin)
* **Respon Props (Inertia):**
  ```typescript
  interface OrderInvoiceProps {
    order: {
      id: number;
      order_number: string;
      total_amount: string;
      status: "pending" | "paid" | "failed" | "expired";
      payment_method: string | null;
      items: Array<{
        id: number;
        product: { title: string; author: string; file_type: string; cover_image_path: string };
        price: string;
        download_token?: { max_downloads: number; download_count: number; expires_at: string };
      }>;
    };
    snap_token?: string;
  }
  ```

---

## 5. Spesifikasi Secure Digital Delivery (Download Engine)

Mengunduh berkas e-book asli melalui arsitektur keamanan **Zero-Trust Storage** dengan tautan sementara bertanda tangan kriptografi.

* **Metode:** `GET`
* **Path:** `/downloads/{orderItem}`
* **Middleware:** `auth`, `download.audit`, `throttle:downloads` (30 req/min), `signed`
* **Parameter Kueri:**
  * `expires` *(integer)*: Timestamp UNIX kedaluwarsa URL bertanda tangan aplikasi (15 menit).
  * `signature` *(string)*: Hash HMAC SHA-256 yang divalidasi oleh `AppServiceProvider`.
* **Aturan Otorisasi & Validasi:**
  1. Autentikasi: Pembeli wajib terotentikasi.
  2. Kepemilikan: `orderItem.order.user_id === Auth::id()`.
  3. Status Pesanan: `orderItem.order.status === OrderStatus::PAID`.
  4. Token Unduh: Token berstatus aktif, masa berlaku belum habis (`expires_at > now()`), dan kuota belum habis (`download_count < max_downloads`).
  5. Keberadaan Berkas: File terverifikasi berada di `PRIVATE_DISK`.
* **Eksekusi Atomik:**
  * Menaikkan `download_count` (+1) dalam transaksi basis data dengan *row lock*.
  * Mencatat percobaan berhasil ke tabel `download_attempts` (`outcome: 'granted'`).
  * Menghasilkan *15-minute Presigned Temporary URL* dari disk penyimpanan privat (AWS S3 / Cloudflare R2 / Local Attachment Stream) dengan header:
    ```http
    HTTP/1.1 302 Found
    Location: https://private-storage.bookil.com/ebooks/sample.pdf?X-Amz-Signature=...
    Content-Disposition: attachment; filename="sample.pdf"
    ```

---

## 6. Integrasi Webhook Payment Gateway (Midtrans Snap)

Endpoint penerima notifikasi status transaksi otomatis dari Midtrans. Endpoint ini **dikecualikan dari verifikasi token CSRF** di `bootstrap/app.php`.

* **Metode:** `POST`
* **Path:** `/webhooks/midtrans`
* **Middleware:** Tanpa CSRF (*CSRF-exempt*)

### 6.1 Algoritma Verifikasi Signature Kriptografis
Sistem memvalidasi keaslian pengirim webhook menggunakan algoritma HMAC-SHA512:
$$\text{Expected Signature} = \text{hash}('sha512', \text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{MIDTRANS\_SERVER\_KEY})$$

Perbandingan dilakukan secara *constant-time* via `hash_equals()` untuk mencegah *Timing Attack*:
```php
$calculatedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
if (!hash_equals($calculatedSignature, $incomingSignature)) {
    throw new InvalidSignatureException();
}
```

### 6.2 Contoh Payload Masuk (Midtrans Settlement)
```json
{
  "order_id": "BK-01J8K3R4P9XYZ",
  "transaction_id": "8f8b8577-c3b0-4613-8ad5-36da47c87c01",
  "transaction_status": "settlement",
  "status_code": "200",
  "gross_amount": "189000.00",
  "payment_type": "qris",
  "signature_key": "a1b2c3d4e5f6... (64 hex characters)",
  "settlement_time": "2026-09-29 17:30:00",
  "fraud_status": "accept"
}
```

### 6.3 Pemetaan State Machine Transaksi
| Nilai `transaction_status` | Kondisi Tambahan | Status Pesanan (`OrderStatus`) | Aksi Sistem |
| :--- | :--- | :--- | :--- |
| `settlement` | `status_code: "200"` | **`PAID`** | Catat payment, dispatch `OrderPaidEvent`, buat download token SHA-256, kirim email receipt. |
| `capture` | `fraud_status: "accept"` | **`PAID`** | Sama seperti settlement. |
| `pending` | - | **`PENDING`** | Update payment pending record. |
| `deny` / `cancel` | - | **`FAILED`** | Cabut hak unduh jika sebelumnya lunas. |
| `expire` | - | **`EXPIRED`** | Batalkan pesanan. |
| `refund` / `chargeback` | - | **`REFUNDED`** | Cabut hak akses token unduhan secara permanen. |

### 6.4 Jaminan Idempotensi Penuh
Jika Midtrans mengirimkan notifikasi duplikat untuk pesanan yang sudah berstatus `PAID`, sistem:
1. Membaca record transaksi di database.
2. Mendeteksi status telah `PAID`.
3. Langsung mengembalikan `HTTP 200 OK {"status": "ok"}` tanpa membuat token baru atau men-dispatch `OrderPaidEvent` kedua.

---

## 7. Operational CLI Reconciliation & Dev Simulator

### 7.1 Command Rekonsiliasi Otomatis
Jika terjadi gangguan koneksi jaringan saat pelanggan membayar, admin atau cron job dapat menjalankan perintah rekonsiliasi:

```bash
php artisan bookil:reconcile "BK-01J8K3R4P9XYZ"
```
* Perintah ini menghubungi HTTPS Status API resmi Midtrans (`https://api.midtrans.com/v2/{order_id}/status`).
* Memvalidasi signature dan mencocokkan nominal `gross_amount`.
* Mendelegasikan ke `ProcessPaymentWebhookAction` untuk memutasi status secara aman.

### 7.2 Development Payment Simulator
Tersedia khusus di lingkungan `local` / `testing` jika flag `BOOKIL_PAYMENT_SIMULATOR_ENABLED=true`:

* **Metode:** `POST`
* **Path:** `/dev/orders/{order:order_number}/simulate-paid`
* **Middleware:** `auth` (hanya dapat dipicu oleh pemilik order sah)
* **Hasil:** Menghasilkan signature SHA-512 lokal yang valid dan mengeksekusi `ProcessPaymentWebhookAction` sehingga pesanan langsung lunas untuk pengujian tanpa uang sungguhan.

---

## 8. Katalog Endpoint Administratif & Entitlement Extension

Seluruh rute di bawah dilindungi oleh middleware `['auth', 'admin']` (hanya dapat diakses pengguna ber-role `admin`).

### 8.1 Executive Dashboard & Streaming Export CSV
* `GET /admin/dashboard`: Menampilkan metrik KPI omzet kotor, total order, buku terlaris, dan order terbaru.
* `GET /admin/reports/sales/csv`: Streaming ekspor seluruh data transaksi lunas ke file CSV dengan header UTF-8 BOM (`\xEF\xBB\xBF`) untuk kompatibilitas sempurna dengan Microsoft Excel.

### 8.2 Perpanjangan Hak Unduh (Entitlement Extension)
Menambahkan kuota unduhan atau memperpanjang masa aktif e-book yang sah dimiliki pelanggan dengan audit trail.

* **Metode:** `POST`
* **Path:** `/admin/order-items/{orderItem}/entitlement`
* **Request Body:**
  ```json
  {
    "additional_downloads": 3,
    "additional_days": 14,
    "reason": "Pelanggan mengalami kegagalan unduh akibat koneksi ISP terputus (Tiket #1042)"
  }
  ```
* **Validasi:**
  * `additional_downloads`: `integer|min:0`
  * `additional_days`: `integer|min:0`
  * `additional_downloads + additional_days`: Harus $> 0$.
  * `reason`: `required|string|min:5|max:1000`
* **Respon:** HTTP 302 Redirect kembali ke rute sebelumnya dengan flash pesan sukses. Tercatat pada tabel `entitlement_extensions`.

### 8.3 Manajemen Produk & Kategori
* `POST /admin/products`: Upload e-book baru (Cover ke public disk, Berkas e-book ke private disk).
* `PATCH /admin/products/{product}/toggle-publish`: Toggle status publikasi instan (Draf $\leftrightarrow$ Publik).
* `DELETE /admin/products/{product}`: Hapus produk (Dilarang jika sudah memiliki riwayat pembelian — dilindungi `restrictOnDelete`).
* `POST /admin/categories`: Tambah kategori baru.
* `PUT /admin/categories/{category}`: Update nama/deskripsi kategori.
* `DELETE /admin/categories/{category}`: Hapus kategori (Dilarang jika masih memiliki produk aktif).

---

## 9. Format Respon & Pemetaan Kode Kesalahan (Error Mapping)

Bookil memetakan domain exception ke status kode HTTP standar secara konsisten:

| Kode HTTP | Nama Domain Exception | Keterangan & Penanganan |
| :--- | :--- | :--- |
| **`400 Bad Request`** | `InvalidWebhookPayloadException` | Payload webhook tidak memiliki ID transaksi atau format rusak. |
| **`403 Forbidden`** | `InvalidSignatureException` | Tanda tangan SHA-512 webhook tidak cocok dengan Server Key. |
| **`403 Forbidden`** | `UnauthorizedDownloadException` | Pengguna mencoba mengunduh file milik akun lain. |
| **`404 Not Found`** | `InvalidDownloadTokenException` | Token unduhan tidak terdaftar di database. |
| **`409 Conflict`** | `ProductUnavailableException` | Produk sedang ditarik dari peredaran saat proses checkout. |
| **`410 Gone`** | `DownloadTokenExpiredException` | Masa berlaku token unduhan telah melewati batas waktu (30 hari). |
| **`422 Unprocessable`** | `ValidationException` / `PaymentAmountMismatchException` | Validasi input gagal atau nominal pembayaran tidak cocok dengan tagihan. |
| **`429 Too Many Requests`**| `DownloadQuotaExceededException` | Kuota unduhan (maks 5x) telah habis, atau rate limit terlampaui. |
