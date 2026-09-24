# 📚 Bookil — Enterprise Digital Product & E-Book Commerce Platform

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-8.5%2B-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![React Version](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js Version](https://img.shields.io/badge/Inertia.js-v2.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Tests-139%20Passed%20(483%20Assertions)-success?style=for-the-badge&logo=pest)](tests)
[![Code Style](https://img.shields.io/badge/Code%20Style-Laravel%20Pint-black?style=for-the-badge)](https://laravel.com/docs/pint)

> **Bookil** adalah platform e-commerce produk digital dan buku digital (*e-books*) berbasis arsitektur monolitik modern yang menggabungkan keandalan backend **Laravel 13** dengan reaktivitas Single Page Application (SPA) **React 19 & Inertia.js v2**. Platform ini dirancang khusus dengan standar industri (*enterprise-grade*), memprioritaskan keamanan aset digital melalui *tokenized presigned URLs*, pencegahan *race-condition* saat checkout, dan rekonsiliasi transaksi otomatis terintegrasi dengan Payment Gateway **Midtrans Snap**.

---

## 📑 Daftar Isi

1. [Visi & Ringkasan Proyek](#-visi--ringkasan-proyek)
2. [Fitur Unggulan Sistem](#-fitur-unggulan-sistem)
3. [Teknologi & Arsitektur](#-teknologi--arsitektur)
4. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
5. [Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
6. [Pengujian & Verifikasi Mutu (QA)](#-pengujian--verifikasi-mutu-qa)
7. [Dokumentasi Lengkap & Standar Audit](#-dokumentasi-lengkap--standar-audit)
8. [Akun Uji Coba Demo (Seeder)](#-akun-uji-coba-demo-seeder)
9. [Kontributor & Lisensi](#-kontributor--lisensi)

---

## 🎯 Visi & Ringkasan Proyek

Platform e-commerce digital tradisional sering kali rentan terhadap kebocoran aset berharga (seperti tautan PDF statis yang dapat disebarluaskan bebas), manipulasi harga sisi klien (*client-side price tampering*), serta inkonsistensi status inventaris/pembayaran ketika transaksi terjadi secara konkuren.

**Bookil** dibangun dari awal untuk memecahkan permasalahan tersebut dengan fondasi teknik tingkat lanjut:
* **Zero Direct Public Storage**: File e-book digital (`.pdf`, `.epub`, `.zip`) diisolasi total pada storage privat (*AWS S3 / Cloudflare R2 / Local Private Disk*). Pelanggan hanya menerima *time-limited presigned URL* (masa berlaku 15 menit) yang di-generate dinamis setelah validasi token, hak kepemilikan, dan sisa kuota unduhan.
* **Digest-Only Tokenization**: Token unduhan disimpan dalam database hanya dalam bentuk *digest cryptographic SHA-256 64-karakter*. Plaintext bearer token tidak pernah tersimpan di database.
* **Atomic Concurrency & Anti-Race-Condition**: Kalkulasi harga dihitung ulang secara ketat di backend menggunakan fungsi `bcadd` (presisi desimal tetap), dieksekusi dalam transaksi basis data dengan *pessimistic row locking* (`lockForUpdate`).
* **Automated Webhook Reconciliation**: Rekonsiliasi status transaksi Midtrans menggunakan verifikasi tanda tangan kriptografi `SHA-512`, deduplikasi event, serta *idempotent state transition*.

---

## ✨ Fitur Unggulan Sistem

### 1. Storefront & Public Catalog
* **Katalog Responsif & Filter Dinamis**: Filter buku berdasarkan kategori, pencarian teks instan (judul, penulis, deskripsi), serta pengurutan harga (*termurah/termahal/terbaru*).
* **Detail Produk & Sample Preview**: Pratinjau informasi buku, spesifikasi file (*file size & type*), dan dialog *Sample Preview Modal* interaktif.
* **Instant Checkout Modal**: Pengalaman beli langsung tanpa friction keranjang yang berbelit-belit.

### 2. Customer Portal & Library
* **Perpustakaan Digital Pribadi**: Dashboard pelanggan menampilkan seluruh koleksi e-book yang telah lunas (*PAID*).
* **Secure Download Engine**: Tombol unduh interaktif yang menampilkan sisa kuota unduhan (*download count / max downloads*) dan tanggal kedaluwarsa tautan.
* **Riwayat Pesanan & Faktur**: Halaman invoice digital interaktif dengan pemantauan status transaksi secara real-time.

### 3. Midtrans Payment Gateway Integration
* **Midtrans Snap Modal**: Jendela popup pembayaran resmi mendukung Virtual Account (BCA, Mandiri, BNI, BRI, Permata), QRIS / GoPay, ShopeePay, dan Kartu Kredit.
* **Webhook Handler Otomatis**: Transisi status order instan dari `pending` menuju `paid` saat notifikasi `settlement`/`capture` diterima.
* **Fail-Safe & Idempotency**: Perlindungan terhadap pengiriman webhook berulang (*duplicate webhooks*) dan validasi signature ketat.

### 4. Admin Management Portal (Owner & Management)
* **Executive Analytics Dashboard**: Metrik bisnis real-time mencakup total pendapatan kotor (*gross revenue*), total transaksi, tingkat konversi, pelanggan aktif, dan e-book *best seller*.
* **Ekspor Laporan Keuangan (Real-Time CSV)**: Fitur streaming ekspor transaksi penjualan berkecepatan tinggi dengan kompatibilitas Microsoft Excel (UTF-8 BOM).
* **Manajemen Produk (CRUD & Toggle Publish)**: Penambahan buku baru, upload sampul publik, upload file e-book privat, dan aktivasi/penonaktifan publikasi dengan 1 klik.
* **Manajemen Kategori**: Pengorganisasian taksonomi buku secara fleksibel dengan proteksi integritas relasi (*restrict on delete*).
* **Audit Ledger Pesanan**: Pelacakan riwayat transaksi pelanggan lengkap dengan inspeksi raw payload webhook Midtrans untuk keperluan audit finansial.

---

## 🛠 Teknologi & Arsitektur

| Komponen / Lapisan | Teknologi yang Digunakan | Penjelasan & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend Framework** | **Laravel 13.x** (PHP 8.5+) | Framework PHP modern dengan keamanan tingkat tinggi, strict typing, dan ekosistem enterprise yang matang. |
| **Frontend Framework** | **React 19.x** + **TypeScript 5** | Antarmuka pengguna berbasis komponen modern dengan pengecekan tipe statis yang ketat. |
| **Monolith Glue** | **Inertia.js v2.0** | Menghubungkan Laravel dan React tanpa perlu membangun REST/GraphQL API terpisah; routing dan state tetap dikelola server. |
| **Styling & Design System** | **Tailwind CSS 3.x** + **Headless UI** | Utilitas styling modern dengan palet warna terstandarisasi, responsif, dan aksesibel. |
| **Basis Data** | **MySQL 8.0+** / **SQLite** (Testing) | RDBMS dengan dukungan ACID, transaksi konkuren, dan foreign key constraints ketat. |
| **Asset Storage** | **Flysystem S3 / Cloudflare R2 / Local** | Pemisahan tegas antara disk publik (*cover images*) dan disk privat ber-enkripsi (*digital ebooks*). |
| **Payment Gateway** | **Midtrans Snap Engine** | Gateway pembayaran nomor satu di Indonesia dengan dukungan verifikasi webhook SHA-512. |
| **Testing Framework** | **Pest PHP 4.x** | Framework pengujian ekspresif dan cepat; mencakup 139 skenario pengujian komprehensif. |

---

## 📂 Struktur Direktori Proyek

```text
harisenin-bookil-fsd/
├── app/
│   ├── Actions/                  # Domain Business Logic (Single Responsibility)
│   │   ├── Downloads/            # GenerateSecureDownloadAction.php
│   │   ├── Orders/               # CreateOrderAction.php
│   │   └── Payments/             # ProcessPaymentWebhookAction.php
│   ├── Enums/                    # String-backed Enums (UserRole, OrderStatus, PaymentStatus, FileType)
│   ├── Events/                   # Domain Events (OrderPaidEvent.php)
│   ├── Exceptions/               # Custom Domain Exceptions (Quota, Signature, Mismatch, etc.)
│   ├── Http/
│   │   ├── Controllers/          # Thin Controllers (Catalog, Checkout, Download, Webhook, Dashboard)
│   │   │   └── Admin/            # Admin Controllers (Dashboard, Products, Categories, Orders)
│   │   ├── Middleware/           # EnsureUserIsAdmin, HandleInertiaRequests
│   │   └── Requests/             # Form Requests & Input Validation
│   ├── Listeners/                # Event Listeners (GenerateDownloadTokensForPaidOrder.php)
│   ├── Models/                   # Strict Eloquent Models (User, Product, Order, Payment, etc.)
│   └── Services/                 # Gateway Services (MidtransSnapService.php)
├── database/
│   ├── factories/                # Database Model Factories
│   ├── migrations/               # Database Schemas & Table Constraints
│   └── seeders/                  # Production Demo Data (BookilProductionDemoSeeder.php)
├── resources/
│   ├── css/                      # Tailwind Base & Utility Styles
│   ├── js/
│   │   ├── Components/           # Reusable UI Kit (ProductCard, Modal, Buttons, Logo, etc.)
│   │   ├── Layouts/              # Layout Templates (StoreLayout, AdminLayout, AuthenticatedLayout)
│   │   ├── Pages/                # Inertia React Pages (Welcome, Products, Orders, Admin, Dashboard)
│   │   └── types/                # TypeScript Interfaces & Global Declarations
│   └── views/                    # Blade Root Template (app.blade.php)
├── routes/
│   ├── auth.php                  # Authentication Routes (Breeze)
│   └── web.php                   # Storefront, Customer, Admin, and Webhook Routes
├── tests/
│   ├── Feature/                  # Feature & Integration Tests (139 tests)
│   │   ├── Actions/              # Unit/Integration Tests for Actions
│   │   └── Admin/                # Feature Tests for Admin Portal
│   └── Pest.php                  # Pest Configuration & Test Helpers
├── Architecture.md               # 🏛 Spesifikasi Arsitektur Sistem Mendalam
├── PRD.md                        # 📋 Product Requirements Document
├── Design.md                     # 🎨 Spesifikasi Desain UX & Interaksi
├── Design_system.md              # 📐 Panduan Design System & Komponen
└── README.md                     # 📖 Dokumen Utama Proyek (File ini)
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### Prasyarat Sistem
* **PHP**: Versi `>= 8.2` (Rekomendasi: PHP 8.3 atau 8.5)
* **Composer**: Versi `>= 2.7`
* **Node.js**: Versi `>= 20.x` & **npm** `>= 10.x`
* **MySQL**: Versi `>= 8.0` atau **MariaDB** `>= 10.5`

### Langkah-Langkah Instalasi

#### 1. Clone Repositori
```bash
git clone https://github.com/MasRizqi07/harisenin-bookil-fsd.git
cd harisenin-bookil-fsd
```

#### 2. Pasang Dependensi Backend & Frontend
```bash
# Pasang dependensi PHP via Composer
composer install

# Pasang dependensi JavaScript/React via NPM
npm install
```

#### 3. Konfigurasi Environment (`.env`)
Salin file template lingkungan dan generate application key:
```bash
cp .env.example .env
php artisan key:generate
```

Buka file `.env` menggunakan teks editor Anda, sesuaikan koneksi database dan kredensial Midtrans:
```ini
APP_NAME=Bookil
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bookil_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Konfigurasi Storage Privat (Pilih local untuk dev offline, atau s3)
PRIVATE_DISK=local

# Kredensial Midtrans Sandbox
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

#### 4. Jalankan Migrasi & Seeder Data Demo
Buat database pada MySQL Anda (`CREATE DATABASE bookil_db;`), lalu eksekusi migrasi beserta data seeder resmi:
```bash
php artisan migrate:fresh --seed --seeder=BookilProductionDemoSeeder
```
*Perintah ini akan membuat skema tabel, 5 kategori, 12 koleksi e-book berbobot, akun admin, akun pelanggan demo, serta 2 pesanan lunas untuk menguji fitur digital library secara instan.*

#### 5. Buat Symbolic Link Storage Publik
```bash
php artisan storage:link
```

#### 6. Jalankan Server Pengembangan
Jalankan backend Laravel dan dev server Vite secara bersamaan:

**Terminal 1 (Backend Laravel Server):**
```bash
php artisan serve
```

**Terminal 2 (Frontend Vite Server):**
```bash
npm run dev
```

Buka peramban Anda di: `http://localhost:8000`

---

## 🧪 Pengujian & Verifikasi Mutu (QA)

Aplikasi Bookil mengadopsi prinsip *Test-Driven Development (TDD)* dan memiliki cakupan pengujian komprehensif tanpa cacat:

### 1. Menjalankan Pest Test Suite
```bash
php vendor/bin/pest --compact
```
**Hasil Verifikasi Terakhir:**
```text
  Tests:    139 passed (483 assertions)
  Duration: 9.61s
```
*Menguji skenario: proteksi mass-assignment, integritas relasi, transaksi webhook Midtrans, pembatasan kuota unduhan, perhitungan desimal fixed-point, serta otorisasi admin portal.*

### 2. Pengecekan Type Safety (TypeScript)
```bash
npm run typecheck
```
*Memastikan seluruh props, state, dan antarmuka komponen React valid tanpa error kompilasi.*

### 3. Kompilasi Bundle Produksi (Vite)
```bash
npm run build
```
*Memvalidasi proses bundling asset frontend berjalan optimal dengan ukuran chunk terdistribusi rapi.*

### 4. Pengecekan Standar Gaya Kode (Laravel Pint)
```bash
./vendor/bin/pint --test
```

---

## 👥 Akun Uji Coba Demo (Seeder)

Database seeder `BookilProductionDemoSeeder` telah menyediakan dua akun siap pakai:

| Role Pengguna | Alamat Email | Password | Akses & Kemampuan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@bookil.com` | `password` | Akses penuh `/admin/dashboard`, kelola produk, buat kategori, ekspor CSV, dan audit ledger order. |
| **Customer (Demo)** | `customer@bookil.com` | `password` | Memiliki 2 buku lunas di `/dashboard` & `/library`, dapat menguji langsung mesin unduh berkas digital ber-kuota. |

---

## 📚 Dokumentasi Lengkap & Standar Audit

Dokumentasi arsitektur dan bisnis yang mendalam telah disusun untuk keperluan tinjauan teknis pengembang, lead architect, serta auditor proyek:

1. [**Product Requirements Document (PRD.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/PRD.md)
   * Visi produk, persona pengguna, user journeys, matriks spesifikasi fungsional (FR-01 s/d FR-10), dan non-fungsional.
2. [**Technical Architecture Specification (Architecture.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/Architecture.md)
   * Diagram arsitektur C4, Entity Relationship Diagram (ERD), diagram sekuens checkout & webhook, strategi konkurensi data, dan model keamanan.
3. [**User Experience & System Design (Design.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/Design.md)
   * Arsitektur informasi (IA), alur UX halaman demi halaman, pola interaksi Inertia.js, dan modal payment lifecycle.
4. [**Design System Specification (Design_system.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/Design_system.md)
   * Token visual (warna HSL, tipografi, elevasi, spacing), inventaris komponen UI, dan standar aksesibilitas WCAG 2.1 AA.
5. [**API & Webhook Integration Guide (docs/API_INTEGRATION.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/docs/API_INTEGRATION.md)
   * Kontrak API, kalkulasi signature Midtrans SHA-512, payload webhook, dan skema presigned URL.
6. [**Security & Compliance Audit Report (docs/SECURITY_AUDIT.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/docs/SECURITY_AUDIT.md)
   * Laporan mitigasi risiko OWASP Top 10, perlindungan timing-attack, kriptografi token, dan validasi kepemilikan aset.
7. [**Deployment & Operations Runbook (docs/DEPLOYMENT_GUIDE.md)**](file:///d:/MY%20CODE/VS%20CODE/HariSenin-Class/Project/harisenin-bookil-fsd/docs/DEPLOYMENT_GUIDE.md)
   * Prosedur rilis produksi, provisioning Cloudflare R2 / AWS S3, konfigurasi worker queue, dan backup basis data.

---

## 📄 Lisensi & Hak Cipta

Proyek ini dikembangkan di bawah lisensi terbuka [MIT License](LICENSE). Seluruh hak cipta modul inti dan desain dilindungi untuk keperluan evaluasi dan pengembangan program **Harisenin BooKil Full Stack Web Developer**.