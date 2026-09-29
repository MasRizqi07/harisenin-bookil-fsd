# 🛡️ Enterprise Security Architecture & Threat Model Whitepaper — Bookil

**Document Title:** Bookil Platform Security Architecture, Cryptographic Controls & Threat Modeling  
**Version:** 1.1.0 (Enterprise Production Baseline)  
**Status:** Approved / Active Baseline  
**Audience:** Security Auditors, Chief Information Security Officers (CISO), Tech Leads, DevOps/SRE, QA Engineers  
**Date:** September 2026  

---

## 📑 Daftar Isi

1. [Filosofi Keamanan & Prinsip Inti Rekayasa](#1-filosofi-keamanan--prinsip-inti-rekayasa)
2. [Matriks Mitigasi Ancaman OWASP Top 10](#2-matriks-mitigasi-ancaman-owasp-top-10)
3. [Arsitektur Zero-Trust Storage & Isolasi Berkas Digital](#3-arsitektur-zero-trust-storage--isolasi-berkas-digital)
4. [Mekanisme Kriptografi & Digest-Only Tokenization](#4-mekanisme-kriptografi--digest-only-tokenization)
5. [Integritas Finansial & Perlindungan Konkurensi Transaksi](#5-integritas-finansial--perlindungan-konkurensi-transaksi)
6. [Otorisasi Berlapis & Perimeter Pertahanan (Defense-in-Depth)](#6-otorisasi-berlapis--perimeter-pertahanan-defense-in-depth)
7. [Kebijakan Audit, Retensi Data & Pemangkasan Otomatis](#7-kebijakan-audit-retensi-data--pemangkasan-otomatis)
8. [Matriks Rate Limiting & Perlindungan DoS](#8-matriks-rate-limiting--perlindungan-dos)

---

## 1. Filosofi Keamanan & Prinsip Inti Rekayasa

Platform **Bookil** dirancang sejak baris kode pertama (*Secure-by-Design*) untuk melindungi dua aset terpenting: **Kekayaan Intelektual Penulis (Digital E-Books)** dan **Integritas Finansial Transaksi Pelanggan**.

Sistem menerapkan empat pilar keamanan enterprise:
1. **Zero-Trust Private Storage:** Mengasumsikan bahwa seluruh jaringan publik dan browser klien adalah lingkungan yang tidak terpercaya. Berkas berhak cipta tidak pernah memiliki URL publik langsung.
2. **Defense-in-Depth (Pertahanan Berlapis):** Setiap permintaan unduh atau transaksi divalidasi oleh minimal 4 lapisan independen (Jaringan/Rate-limit, Autentikasi Sesi, Otorisasi Policy/Gate, dan Validasi Tanda Tangan Kriptografi).
3. **Principle of Least Privilege:** Pengguna hanya memiliki izin terbatas sesuai perannya (`customer` vs `admin`). Administrator tidak dapat memalsukan uang, dan pelanggan tidak dapat menyentuh hak unduh pengguna lain.
4. **Fail-Closed Default:** Segala kegagalan validasi, ketidakcocokan tanda tangan, atau anomali jaringan akan langsung menolak akses secara aman (*abort 403/422/429*) tanpa mengekspos jejak internal sistem (*Zero Information Leakage*).

---

## 2. Matriks Mitigasi Ancaman OWASP Top 10

| Kategori OWASP Top 10 | Potensi Kerentanan E-Commerce | Solusi & Kontrol Teknis di Bookil |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Mengunduh e-book milik orang lain dengan mengubah ID file (IDOR), atau mengakses URL admin `/admin/dashboard`. | • Otorisasi ketat via Policy: `orderItem.order.user_id === Auth::id()`.<br>• Middleware `admin` dan Gate `viewAnyAsAdmin` mengamankan seluruh rute manajemen.<br>• URL unduhan mewajibkan tanda tangan HMAC SHA-256 bertempo 15 menit (`signed` middleware). |
| **A02: Cryptographic Failures** | Kata sandi mudah di-crack, atau link unduhan dapat ditebak (*brute-forced*). | • Password di-hash menggunakan algoritma **Bcrypt** dengan cost factor 12.<br>• Token unduhan memiliki entropi 256-bit (64 karakter acak).<br>• Database **hanya menyimpan hash SHA-256** dari token unduh (digest-only). |
| **A03: Injection** | SQL Injection pada pencarian katalog atau form checkout. | • 100% kueri database dieksekusi melalui **PDO Prepared Statements** via Eloquent ORM.<br>• Input pencarian menggunakan fungsi aman Laravel `whereLike()` dan `orWhereLike()`. |
| **A04: Insecure Design** | Manipulasi total harga di browser (*Price Tampering*) atau *Double-Spending* via request bersamaan. | • **Server-Side Recalculation:** Total harga dihitung ulang dari database menggunakan pustaka desimal presisi `bcadd` (bebas float drift).<br>• **Pessimistic Concurrency Locking:** Baris produk dikunci dengan `lockForUpdate()` dalam transaksi ACID. |
| **A05: Security Misconfiguration** | Debug stack trace bocor ke publik, atau cookie sesi rentan pencurian. | • `APP_DEBUG=false` wajib pada staging/production.<br>• Cookie sesi dikonfigurasi: `secure = true`, `http_only = true`, `same_site = lax`, dan `encrypt = true`.<br>• Header `Content-Security-Policy-Report-Only` terpasang untuk audit origin. |
| **A06: Vulnerable & Outdated Components** | Library usang dengan celah CVE. | • Dependensi PHP diperiksa via `composer audit` dan dikunci via `composer.lock`.<br>• Dependensi npm dipindai melalui `npm audit` dan dikunci via `package-lock.json`. |
| **A07: Identification & Authentication Failures** | Pembajakan akun via credential stuffing atau serangan brute-force login. | • Rate limiter terpasang pada rute login dan password reset (`throttle:5,1`).<br>• Verifikasi email wajib sebelum checkout (`verified` middleware) dengan rate limit resend ketat. |
| **A08: Software & Data Integrity Failures** | Hacker menyuntikkan webhook settlement palsu untuk mendapatkan e-book gratis. | • Setiap webhook Midtrans diverifikasi tanda tangan kriptografi **HMAC SHA-512**:<br>$$\text{hash}('sha512', \text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{server\_key})$$<br>• Komparasi signature menggunakan fungsi waktu konstan `hash_equals()`. |
| **A09: Security Logging & Monitoring Failures** | Percobaan pembobolan unduhan tidak terpantau atau log membengkak tak terkontrol. | • Seluruh percobaan unduh dicatat di tabel `download_attempts` (mencatat IP, signature hash, outcome).<br>• Pencatatan middleware dideduplikasi per 60 detik untuk mencegah log flooding.<br>• Pruning otomatis mempertahankan 90 hari log unduh dan 180 hari log webhook. |
| **A10: Server-Side Request Forgery (SSRF)** | Panggilan HTTP eksternal disalahgunakan untuk mengakses metadata internal AWS/Cloudflare. | • Komunikasi keluar hanya ke URL gateway Midtrans resmi yang di-hardcode di konfigurasi backend (`https://app.midtrans.com` / `https://api.midtrans.com`). |

---

## 3. Arsitektur Zero-Trust Storage & Isolasi Berkas Digital

Bookil memisahkan secara fisik direktori berkas publik dan berkas privat:

```text
storage/app/
├── public/                 <--- PUBLIK (Di-symlink ke public/storage)
│   └── covers/             <--- Hanya untuk gambar sampul e-book (.jpg, .png, .webp)
│
└── private/                <--- TERTUTUP TOTAL (Zero-Trust Private Disk)
    └── ebooks/             <--- Berkas naskah asli berhak cipta (.pdf, .epub, .zip)
                            <--- DILARANG KERAS di-symlink ke folder public web server
```

### Mekanisme Pengiriman Berkas Privat:
1. **Tidak Ada Akses Langsung:** Pengunjung yang mencoba mengakses path berkas fisik melalui browser (misal `https://bookil.com/storage/ebooks/secret.pdf`) akan mendapatkan respon **HTTP 403 Forbidden** atau **HTTP 404 Not Found** dari web server Nginx/Caddy.
2. **Validasi Multi-Kunci:** Rute `/downloads/{orderItem}` melakukan verifikasi:
   * Sesi terotentikasi aktif (`auth`).
   * Integritas tanda tangan URL aplikasi (`signed`).
   * Kepemilikan akun pembeli (`user_id`).
   * Status faktur wajib lunas (`PAID`).
   * Kuota unduhan belum terlampaui (`download_count < max_downloads`).
   * Masa berlaku token belum kedaluwarsa (`expires_at > now()`).
3. **Pengalihan ke Presigned URL Bertanda Tangan Sementara:**
   Setelah validasi sukses, server membuat *temporary presigned URL* berdurasi **15 menit** langsung ke bucket Cloudflare R2 / AWS S3 terisolasi (atau *streamed attachment* jika menggunakan disk lokal), menyertakan header:
   ```http
   Content-Disposition: attachment; filename="Judul-Buku.pdf"
   ```
   Tautan ini tidak dapat disebarkan ke publik karena akan hangus secara otomatis setelah 15 menit.

---

## 4. Mekanisme Kriptografi & Digest-Only Tokenization

### 4.1 Digest-Only Storage untuk Token Unduhan
Sebagian besar sistem konvensional menyimpan bearer token dalam bentuk teks polos (*plaintext*) di database. Jika database mengalami kebocoran (*SQL dump breach*), seluruh buku dapat diunduh oleh peretas.

**Pendekatan Bookil:**
* Saat pesanan lunas, sistem menghasilkan token acak 64-karakter dengan entropi tinggi:
  ```php
  $rawToken = Str::random(64);
  ```
* Basis data **hanya menyimpan hash SHA-256** dari token tersebut:
  ```php
  $hashedToken = hash('sha256', $rawToken);
  // download_tokens.token = $hashedToken
  ```
* Peretas yang mendapatkan database dump tidak dapat membalikkan (*reverse-engineer*) hash SHA-256 menjadi token plaintext yang valid.

### 4.2 Verifikasi Webhook Kriptografis Bebas Timing-Attack
Perbandingan string tanda tangan biasa (`$a === $b`) rentan terhadap serangan analisis waktu (*Timing Attack*), di mana peretas dapat menebak karakter demi karakter berdasarkan perbedaan mikro-detik eksekusi prosesor.

Bookil memitigasi serangan ini secara mutlak menggunakan fungsi komparasi konstan `hash_equals()`:
```php
$expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
if (!hash_equals($expectedSignature, $payloadSignature)) {
    throw new InvalidSignatureException('Midtrans HMAC SHA-512 signature mismatch.');
}
```

---

## 5. Integritas Finansial & Perlindungan Konkurensi Transaksi

### 5.1 Aritmatika Desimal Presisi Tetap (Anti-Float-Drift)
Operasi aritmatika floating-point standar pada komputer (standar IEEE-754) memiliki ketidakakuratan inheren (contoh: `0.1 + 0.2` menghasilkan `0.30000000000000004`). Dalam transaksi e-commerce, selisih $0.01$ dapat memicu kegagalan verifikasi gateway pembayaran atau sengketa audit.

Seluruh kalkulasi finansial pada `CreateOrderAction` dan `ProcessPaymentWebhookAction` dieksekusi dengan pustaka **BCMath** pada presisi 2 digit desimal:
```php
$totalAmount = '0.00';
foreach ($orderItems as $item) {
    $totalAmount = bcadd($totalAmount, (string) $item->price, 2);
}
```

### 5.2 Pessimistic Concurrency Locking (`lockForUpdate`)
Untuk mengantisipasi *race conditions* saat pembeli menekan tombol checkout berulang kali atau saat webhook masuk secara paralel dari beberapa server Midtrans:
```php
DB::transaction(function () use ($productId) {
    // Baris produk dikunci di level engine database (PostgreSQL / MySQL)
    $product = Product::query()->lockForUpdate()->findOrFail($productId);
    
    // Transaksi konkuren kedua WAJIB menunggu hingga transaksi pertama selesai (COMMIT/ROLLBACK)
    // Mencegah perubahan harga atau pembelian produk draf secara bersamaan
});
```
*Ketahanan ini diverifikasi melalui test suite `PostgresRowLockTest` dengan lock timeout 500ms dan kode PostgreSQL `SQLSTATE 55P03`.*

---

## 6. Otorisasi Berlapis & Perimeter Pertahanan (Defense-in-Depth)

Setiap permintaan HTTP melewati tumpukan pertahanan perimeter sebelum menyentuh data:

```text
[HTTP Request Masuk]
       │
       ▼
 1. Rate Limiting Shield (Redis Atomic Counters: 10 req/min atau 30 req/min)
       │
       ▼
 2. Perimeter Firewall & Cloudflare Proxy Validation (Validasi IP CIDR Terpercaya)
       │
       ▼
 3. CSRF Protection (Token valid wajib untuk semua form POST/PATCH/DELETE; kecuali /webhooks/*)
       │
       ▼
 4. Authentication Guard (Validasi Sesi Terenkripsi & Cookie HttpOnly)
       │
       ▼
 5. Email Verification Guard (Hanya akun terverifikasi yang diizinkan checkout)
       │
       ▼
 6. Role-Based Authorization Policy (Customer vs Admin via EnsureUserIsAdmin)
       │
       ▼
 7. Cryptographic URL Signature Guard (HMAC SHA-256 untuk tautan unduh)
       │
       ▼
 8. Pessimistic Row Lock & ACID Database Mutation (Integritas Data Sempurna)
```

---

## 7. Kebijakan Audit, Retensi Data & Pemangkasan Otomatis

Untuk mematuhi regulasi perlindungan data pribadi dan menjaga efisiensi penyimpanan basis data, Bookil menerapkan aturan retensi data otomatis menggunakan trait `MassPrunable` Laravel:

| Entitas Data | Masa Retensi | Perilaku Pemangkasan | Rationale Bisnis & Kepatuhan |
| :--- | :--- | :--- | :--- |
| **`download_attempts`** | **90 Hari** | Dipangkas via daily cron (`model:prune`) | Jejak audit IP dan percobaan unduh disimpan 3 bulan untuk investigasi sengketa pelanggan. |
| **`webhook_notifications`** | **180 Hari** | Dipangkas via daily cron (`model:prune`) | Payload mentah webhook disimpan 6 bulan untuk rekonsiliasi audit keuangan semesteran. |
| **`orders` & `payments`** | **Permanen** | **DILARANG DIPANGKAS** | Catatan keuangan utama dilindungi untuk keperluan pembukuan legal dan perpajakan. |
| **`entitlement_extensions`** | **Permanen** | **DILARANG DIPANGKAS** | Jejak audit aksi admin yang memperpanjang kuota disimpan permanen untuk akuntabilitas internal. |

---

## 8. Matriks Rate Limiting & Perlindungan DoS

Bookil menetapkan pembatasan laju permintaan (*Rate Limiting*) berbasis Redis untuk mencegah serangan Denial of Service (DoS) dan brute-force token:

| Endpoint | Limit | Kunci Identifikasi | Perilaku Saat Melebihi Batas |
| :--- | :--- | :--- | :--- |
| **Login (`/login`)** | 5 permintaan / menit | IP + Alamat Email | HTTP 429 Too Many Requests (Delay interaktif) |
| **Checkout (`POST /checkout`)** | 10 permintaan / menit | User ID terotentikasi | HTTP 429 Too Many Requests |
| **Unduhan (`GET /downloads/*`)** | 30 permintaan / menit | User ID terotentikasi | HTTP 429 Too Many Requests + Log ke audit |
| **Resend Email Verification** | 6 permintaan / menit | User ID terotentikasi | HTTP 429 (Mencegah spam SMTP relay) |
