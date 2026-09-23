# Bookil: checkpoint fondasi data

Status: fondasi schema/model teruji lokal; Phase 1 keseluruhan dan production readiness belum selesai.

## Scope checkpoint

Permintaan eksekusi saat ini: inspeksi proyek, daftar dependensi yang belum ada, migration,
model, enum, dan berhenti sebelum Action/controller. Tidak ada Action, controller, route
Bookil, autentikasi baru, payment handler, atau endpoint download dalam perubahan ini.

Baseline inspeksi: commit `7cca89e`, aplikasi Task berbasis Laravel 12.65.0 dan Blade.
Perubahan lokal awal pada `config/logging.php` dipertahankan. Routes, views, controller,
model Task, serta migration lama tetap utuh. Tidak ada migration yang dijalankan pada
database aplikasi dari `.env`.

## Runtime dan dependensi

| Komponen | Hasil inspeksi / status akhir |
| --- | --- |
| PHP | Lokal 8.5.9; constraint proyek menjadi `^8.5` |
| Laravel | Di-upgrade ke 13.33.0; constraint `^13.0` |
| Tinker | Di-upgrade ke 3.0.2 |
| Pest | 4.7.8, plugin Laravel 4.1.0; terpasang |
| PHPUnit | 12.5.33 melalui Pest; bukan lagi dependency langsung |
| Inertia Laravel | `inertiajs/inertia-laravel:^2.0` belum ada |
| Frontend | Belum ada `package.json`, Vite setup, React, TypeScript, atau Tailwind |
| Paket frontend berikutnya | `react@^19`, `react-dom@^19`, `@inertiajs/react@^2`, `typescript`, `@types/react`, `@types/react-dom`, `vite`, `@vitejs/plugin-react`, `laravel-vite-plugin`, `tailwindcss`, `@tailwindcss/vite` |
| Autentikasi | `laravel/fortify` dan scaffold Inertia belum ada |
| Private S3/R2 | Adapter `league/flysystem-aws-s3-v3:^3.0` belum ada; disk private khusus belum dikonfigurasi |
| Redis | `ext-redis` dan `predis/predis` tidak tersedia; pilih satu client pada tahap konfigurasi |
| Midtrans | `midtrans/midtrans-php` belum ada; SDK opsional jika integrasi memakai Laravel HTTP client |
| Image processing | `ext-gd` tersedia; pipeline cover belum diimplementasikan |
| Database | `pdo_mysql` dan `pdo_sqlite` tersedia; `pdo_pgsql` tidak ada |
| Coverage | PCOV/Xdebug tidak tersedia; persentase coverage belum diukur |

Versi paket yang belum dipasang perlu di-resolve bersama saat tahapnya dimulai.
`composer.lock` sudah sinkron dengan dependensi yang terpasang.
Skrip `composer setup` / `composer dev` lama masih merujuk npm; keduanya belum
menjadi jalur setup Bookil yang lengkap sebelum frontend dipasang.
`.env.example` masih konfigurasi Task lama dan belum disertifikasi sebagai konfigurasi Bookil.

Rujukan upgrade: https://laravel.com/docs/13.x/upgrade
Rujukan status payment: https://docs.midtrans.com/docs/transaction-status-cycle

## Schema dan relasi

Tujuh migration baru memakai prefix `2026_09_23`:

1. Tambah `users.role` dengan default customer, tanpa menulis ulang migration users lama.
2. Buat categories.
3. Buat products.
4. Buat orders.
5. Buat order_items.
6. Buat payments.
7. Buat download_tokens.

Model: User, Category, Product, Order, OrderItem, Payment, DownloadToken.
Enum string-backed: UserRole, OrderStatus, PaymentStatus, FileType.

Relasi yang tersedia:

- User hasMany orders; Order belongsTo user.
- Category hasMany products; Product belongsTo category.
- Order hasMany items; OrderItem belongsTo order dan product.
- Product hasMany orderItems.
- Order hasMany payments; Payment belongsTo order.
- OrderItem hasOne downloadToken; DownloadToken belongsTo orderItem.

Semua kode PHP yang ditambahkan memakai strict types dan deklarasi return type.
Model memakai cast enum, decimal:2, boolean, integer, JSON array, dan immutable datetime.
Nilai uang dibaca sebagai string decimal, tidak dikonversi ke float.
Model Eloquent strict diaktifkan melalui `Model::shouldBeStrict()`.
Laravel tetap mempunyai pengecualian internal pada pemeriksaan lazy loading untuk
beberapa model tunggal/baru; strict mode bukan pengganti explicit eager loading.

## Keputusan dan trade-off

- OrderStatus mengikuti empat nilai dalam spesifikasi schema: pending, paid, failed,
  expired. Contoh CANCELLED pada bagian aturan tidak ditambahkan ke schema. Mapping
  status gateway cancel ke domain order masih menjadi keputusan fase payment.
- PaymentStatus mempertahankan status gateway terpisah dari status order, termasuk
  refund, chargeback, reversal ke deny, dan authorize. Belum ada logika transisi.
- Slug category/product, order_number, external_transaction_id, dan token memiliki
  unique index. External transaction ID merepresentasikan satu transaksi gateway,
  bukan satu notifikasi. Beberapa transaksi berbeda dapat terkait satu order.
- Unique (order_id, product_id): satu produk digital per order, sesuai schema tanpa
  quantity. Unique order_item_id pada download_tokens: satu penghitung kuota per
  item. Rotasi token kelak harus memperbarui record ini tanpa mereset kuota.
- Order -> items -> download_tokens memakai cascade delete. Category yang punya
  produk, produk yang sudah dibeli, user yang punya order, dan order yang punya
  payment memakai restrict delete untuk mempertahankan referensi transaksi.
- Foreign key dan index eksplisit disiapkan untuk MySQL/PostgreSQL. Composite index
  mendukung filter publication/category/price serta riwayat order customer/status.
  B-tree bukan index untuk pencarian substring; search strategy belum dipilih.
- `file_path`, token digest, dan raw_response disembunyikan dari serialisasi.
  Ini bukan pengganti policy atau validasi upload pada fase selanjutnya.
- Kolom token menyimpan digest SHA-256 64 karakter; factory menghasilkan digest
  dari random bytes. Action kelak wajib menghasilkan bearer token acak, menyimpan
  digest saja, dan memverifikasi digest; schema/model tidak otomatis menghash input.
- `role` tidak mass assignable. Promosi admin harus melalui jalur server terpercaya;
  factory admin hanya fixture tes.
- Category description, cover_image_path, dan order notes boleh null.
  Asset produk belum ditulis ke storage mana pun.
- Factory tersedia untuk semua model; factory adalah fixture, bukan orchestrator
  checkout. Saat menyusun fixture multi-item, total order harus diisi sesuai sum
  harga item. Default order kosong bernilai 0.00.
- Seeder default kini hanya membuat tiga category secara idempotent; tidak lagi
  membuat akun test dengan password yang diketahui. Tidak ada produk fiktif atau
  path aset tidak valid yang ditanam ke database aplikasi.

Validasi harga nonnegatif, kuota, expiry, dan total antar tabel masih harus ditambahkan
pada Form Request/Action. Unsigned integer tidak memberikan enforcement identik di
semua database; constraint lintas database perlu diverifikasi sebelum rilis.

## Verifikasi lokal

Dijalankan pada PHP 8.5.9 / Laravel 13.33.0:

| Perintah / pemeriksaan | Hasil |
| --- | --- |
| `php vendor/bin/pest --compact` | Exit 0: 55 passed, 123 assertions |
| Pint pada seluruh file PHP yang disentuh | Exit 0 pada pemeriksaan final dengan --test |
| `composer validate --strict` | Exit 0 |
| `composer check-platform-reqs` | Exit 0 |
| `composer audit --format=plain` | Exit 0; tidak ada advisori yang dilaporkan |
| `php artisan route:list --except-vendor` | Exit 0; enam route Task tetap ada |
| `git diff --check` | Exit 0 |

Tes mencakup persistensi enum dan decimal, relasi dua arah, default DB, proteksi
mass assignment role, strict model, penyembunyian atribut sensitif, snapshot harga
item, uniqueness, FK, cascade/restrict delete, seeder idempotent, dan regresi
CRUD Task. Tes migration membuktikan users lama mendapat role customer, rollback
tujuh migration mempertahankan user/task, kemudian migration dapat dipasang ulang.

Seluruh tes DB memakai SQLite in-memory. MySQL/PostgreSQL runtime, konkurensi,
row locking, staging, dan production belum diverifikasi. Docker daemon lokal
tidak aktif. Kelulusan tes ini tidak membuktikan kesiapan checkout/download.

Jalankan ulang:

```powershell
composer install
php vendor/bin/pest --compact
composer validate --strict
composer check-platform-reqs
composer audit --format=plain
```

Setelah menyiapkan database Bookil tersendiri dan memeriksa koneksi, migration/seeder
dapat diterapkan dengan `php artisan migrate --seed`. Perintah ini belum dijalankan
terhadap database aplikasi dalam checkpoint ini.

## Kebutuhan sebelum Action/controller

Phase 1 belum lengkap: frontend Inertia/React/Tailwind, Fortify, konfigurasi Redis,
private disk S3/R2, dan environment Bookil masih perlu implementasi.

Untuk fase payment/download, tujuh tabel awal belum mencakup:

- Ledger notifikasi webhook yang menyimpan payload per event beserta dedupe key
  dan processed_at. Dedupe berdasarkan transaction ID saja akan membuang
  transisi pending -> settlement yang sah.
- Audit download attempt: user ID, order item ID, IP, timestamp, digest/token
  reference, outcome. Hindari plaintext bearer token dan signed URL dalam log.
- Idempotency checkout, token Snap, data expiry order, dan immutable metadata
  invoice bila diperlukan oleh kontrak API berikutnya.

Batas presigned URL 15 menit, ownership/paid policy, signature validation,
atomic quota update dengan row lock, outbox/event delivery, dan rate limiter
belum diimplementasikan. Implementasi Action/controller menunggu konfirmasi user.

## Kompleksitas

Untuk index B-tree dan query yang dapat memakai index: lookup unique O(log N);
range/filter O(log N + K) untuk K hasil. Insert/update O(I log N) untuk I index
yang diperbarui. Penyimpanan tabel dan index O(N) untuk jumlah index tetap.
Eager loading satu graph order memakai jumlah query yang tetap terhadap jumlah
item; pemakaian memori O(K) untuk jumlah record yang dimuat. Search substring
dapat tetap O(N) sampai strategi search diimplementasikan.
