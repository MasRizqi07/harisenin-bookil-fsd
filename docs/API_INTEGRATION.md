# 🔌 API & Integration Reference — Bookil

**Document Title:** Bookil Payment Gateway, Webhook & Storage Integration Specification  
**Version:** 1.0.0 (Production Engineering Reference)  
**Status:** Approved / Active Baseline  
**Audience:** Backend Engineers, Integration Specialists, Payment Gateway Auditors  
**Date:** September 2026  

---

## 📑 Daftar Isi

1. [Ikhtisar Integrasi Sistem](#1-ikhtisar-integrasi-sistem)
2. [Integrasi Midtrans Snap (Payment Initiation)](#2-integrasi-midtrans-snap-payment-initiation)
3. [Spesifikasi Midtrans Webhook Handler](#3-spesifikasi-midtrans-webhook-handler)
   * [3.1 Formula Verifikasi Tanda Tangan Kriptografi (SHA-512)](#31-formula-verifikasi-tanda-tangan-kriptografi-sha-512)
   * [3.2 Pemetaan Transisi Status Transaksi (State Machine)](#32-pemetaan-transisi-status-transaksi-state-machine)
   * [3.3 Contoh Payload Webhook Masuk](#33-contoh-payload-webhook-masuk)
4. [Mesin Pengiriman Aset Digital & Presigned URL (Storage Engine)](#4-mesin-pengiriman-aset-digital--presigned-url-storage-engine)
5. [Katalog Endpoint & Pembatasan Laju Trafik (Rate Limiting)](#5-katalog-endpoint--pembatasan-laju-trafik-rate-limiting)
6. [Daftar Kode Kesalahan & Penanganan HTTP (HTTP Status & Error Codes)](#6-daftar-kode-kesalahan--penanganan-http-http-status--error-codes)

---

## 1. Ikhtisar Integrasi Sistem

Bookil berinteraksi dengan dua sistem eksternal utama:
1. **Midtrans Payment Gateway (Snap API & HTTP Webhook Notification):** Menangani orkestrasi pembayaran multi-kanal (Virtual Account, QRIS/GoPay, ShopeePay, Kartu Kredit).
2. **Cloud Private Storage (AWS S3 / Cloudflare R2 / Local Disk):** Menangani penyimpanan terisolasi berkas e-book berhak cipta dan penerbitan tautan berbatas waktu (*presigned temporary URLs*).

---

## 2. Integrasi Midtrans Snap (Payment Initiation)

### Inisialisasi Transaksi (`MidtransSnapService.php`)
Ketika pelanggan menekan tombol *"Beli Sekarang"*, `CheckoutController` mengeksekusi `CreateOrderAction` untuk mengunci produk dan membuat nomor pesanan unik (`BK-[ULID]`), lalu memanggil service Midtrans:

* **Endpoint Midtrans Sandbox:** `https://app.sandbox.midtrans.com/snap/v1/transactions`
* **Endpoint Midtrans Production:** `https://app.midtrans.com/snap/v1/transactions`
* **Metode:** `POST`
* **Header:**
  * `Accept: application/json`
  * `Content-Type: application/json`
  * `Authorization: Basic base64(MIDTRANS_SERVER_KEY + ":")`

### Struktur Payload Permintaan Snap Token:
```json
{
  "transaction_details": {
    "order_id": "BK-01J8K3R4XYZ987654321",
    "gross_amount": 189000
  },
  "item_details": [
    {
      "id": "1",
      "price": 189000,
      "quantity": 1,
      "name": "Mastering Laravel 13 Architecture"
    }
  ],
  "customer_details": {
    "first_name": "Rizqi Pratama",
    "email": "customer@bookil.com"
  }
}
```

### Respons dari Midtrans:
```json
{
  "token": "snap-token-f91b7e45-7182-4f32-849c-851b2e10c732",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-f91b7e45..."
}
```

Snap token ini disimpan dalam session sementara dan dikirimkan ke frontend React untuk membuka modal dialog:
```javascript
window.snap.pay(snapToken, {
    onSuccess: function(result) { router.visit('/orders/' + orderNumber); },
    onPending: function(result) { router.visit('/orders/' + orderNumber); },
    onError: function(result) { alert('Pembayaran gagal atau dibatalkan.'); },
    onClose: function() { console.log('Pelanggan menutup dialog sebelum bayar.'); }
});
```

---

## 3. Spesifikasi Midtrans Webhook Handler

Notifikasi status transaksi dikirim oleh server Midtrans secara asinkron ke server Bookil melalui HTTP POST:
* **Endpoint:** `POST https://bookil.com/webhooks/midtrans`
* **Bypass CSRF:** Dikecualikan pada `bootstrap/app.php` (`$middleware->validateCsrfTokens(except: ['webhooks/*'])`).
* **Proteksi Keamanan:** Validasi tanda tangan kriptografi wajib dilakukan sebelum membaca isi pesan.

### 3.1 Formula Verifikasi Tanda Tangan Kriptografi (SHA-512)

Midtrans mengirimkan header/field `signature_key`. Server Bookil menghitung nilai hash secara independen:

$$\text{Expected Signature} = \text{hash}('sha512', \text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{MIDTRANS\_SERVER\_KEY})$$

Contoh implementasi di `ProcessPaymentWebhookAction.php`:
```php
$expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

if (! hash_equals($expectedSignature, $incomingSignature)) {
    throw new InvalidSignatureException('Midtrans webhook signature validation failed.');
}
```
*Catatan Keamanan:* Komparasi menggunakan fungsi bawaan PHP `hash_equals()` untuk mencegah celah serangan *Timing Attack*.

---

### 3.2 Pemetaan Transisi Status Transaksi (State Machine)

| `transaction_status` Midtrans | `fraud_status` | Status Order Bookil (`OrderStatus`) | Aksi Sistem |
| :--- | :--- | :--- | :--- |
| `settlement` | `accept` / null | `OrderStatus::PAID` | Kunci order lunas, rekam payment, picu `OrderPaidEvent`, buat `DownloadToken`. |
| `capture` | `accept` | `OrderStatus::PAID` | Kartu kredit terkonfirmasi lunas $\rightarrow$ picu `OrderPaidEvent`. |
| `capture` | `challenge` | `OrderStatus::PENDING` | Kartu kredit dicurigai fraud $\rightarrow$ tahan pesanan hingga ditinjau manual. |
| `pending` | apa pun | `OrderStatus::PENDING` | Menunggu pembayaran oleh pelanggan (Virtual Account aktif). |
| `deny` | apa pun | `OrderStatus::FAILED` | Pembayaran ditolak oleh bank penerbit. |
| `cancel` | apa pun | `OrderStatus::FAILED` | Pembayaran dibatalkan. |
| `expire` | apa pun | `OrderStatus::EXPIRED` | Waktu bayar habis (order hangus). |
| `failure` | apa pun | `OrderStatus::FAILED` | Kesalahan sistem gateway. |

---

### 3.3 Contoh Payload Webhook Masuk

```json
{
  "va_numbers": [
    {
      "va_number": "9881234567890123",
      "bank": "bca"
    }
  ],
  "transaction_time": "2026-09-24 23:15:00",
  "transaction_status": "settlement",
  "transaction_id": "4b68453e-52f5-41ba-bc5e-38ec1dfbc5a7",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "c4ca4238a0b923820dcc509a6f75849b...",
  "settlement_time": "2026-09-24 23:15:15",
  "payment_type": "bank_transfer",
  "order_id": "BK-01J8K3R4XYZ987654321",
  "gross_amount": "189000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

---

## 4. Mesin Pengiriman Aset Digital & Presigned URL (Storage Engine)

Ketika pesanan berstatus `PAID`, pembeli dapat meminta pengunduhan berkas melalui endpoint:
`GET /downloads/{token}`

### Alur Eksekusi Internal (`GenerateSecureDownloadAction.php`):
1. **Hash Lookup:** Token yang dikirim di-hash dengan `hash('sha256', $token)` untuk dicocokkan dengan kolom `download_tokens.token`.
2. **Kunci Baris Transaksi:** `lockForUpdate()` dijalankan pada record `download_tokens` di dalam `DB::transaction`.
3. **Pemeriksaan 4 Lapisan Kebijakan Keamanan:**
   * *Kepemilikan:* Apakah pembeli yang sedang login adalah pemilik pesanan? (`$order->user_id === $user->id`).
   * *Status Bayar:* Apakah pesanan berstatus `OrderStatus::PAID`?
   * *Masa Berlaku:* Apakah `$downloadToken->expires_at` belum terlewati?
   * *Sisa Kuota:* Apakah `$downloadToken->download_count < $downloadToken->max_downloads`?
4. **Mutasi Atomik Kuota:** Nilai `download_count` ditambah 1 (`$downloadToken->increment('download_count')`).
5. **Penerbitan Presigned URL:**
   ```php
   $diskName = (string) config('filesystems.private_disk', 's3');
   $disk = Storage::disk($diskName);

   return $disk->temporaryUrl(
       $product->file_path,
       CarbonImmutable::now()->addMinutes(15)
   );
   ```
6. **Pengalihan Klien:** Controller mengalihkan browser pengguna via HTTP 302 ke URL presigned bertanda tangan S3/R2 tersebut. Setelah 15 menit, URL tersebut mati total dan tidak dapat digunakan lagi.

---

## 5. Katalog Endpoint & Pembatasan Laju Trafik (Rate Limiting)

Untuk melindungi server dari serangan Denial of Service (DoS) dan brute-force token, diterapkan *Rate Limiting*:

| Endpoint | Metode | Middleware / Rate Limiter | Tujuan & Kebijakan |
| :--- | :--- | :--- | :--- |
| `/checkout` | `POST` | `auth, throttle:10,1` | Maksimal 10 percobaan checkout per menit per pengguna. |
| `/downloads/{token}` | `GET` | `auth, throttle:30,1` | Maksimal 30 request unduh per menit per pengguna. |
| `/webhooks/midtrans` | `POST` | `throttle:120,1` | Menerima hingga 120 notifikasi webhook per menit. |
| `/products` | `GET` | Publik | Akses katalog terbuka dengan caching respons browser. |
| `/admin/*` | `ANY` | `auth, admin` | Akses khusus akun bertipe `role = 'admin'`. |

---

## 6. Daftar Kode Kesalahan & Penanganan HTTP (HTTP Status & Error Codes)

| Kode HTTP | Nama Error | Penyebab | Pesan ke Klien |
| :--- | :--- | :--- | :--- |
| **400 Bad Request** | `InvalidWebhookPayloadException` | Field `order_id` atau `transaction_id` hilang. | *"Missing required transaction identifier fields."* |
| **403 Forbidden** | `InvalidSignatureException` | Signature SHA-512 webhook tidak valid. | *"Midtrans webhook signature validation failed."* |
| **403 Forbidden** | `UnauthorizedDownloadException` | Pengguna mencoba mengunduh buku milik akun lain. | *"You do not own this purchased product."* |
| **404 Not Found** | `InvalidDownloadTokenException` | Token unduhan fiktif atau telah dihapus. | *"Download token not found or invalid."* |
| **409 Conflict** | `OrderNotPaidException` | Upaya mengunduh saat status pesanan masih pending/batal. | *"Order is not paid or settled."* |
| **410 Gone** | `DownloadTokenExpiredException` | Masa berlaku 30 hari telah terlewati. | *"Download token has expired."* |
| **422 Unprocessable** | `ProductUnavailableException` | Produk ditarik atau belum dipublikasikan saat checkout. | *"One or more selected products are unavailable."* |
| **429 Too Many Requests** | `DownloadQuotaExceededException` | Kuota 5x unduh telah habis. | *"Maximum download quota exceeded for this item."* |
