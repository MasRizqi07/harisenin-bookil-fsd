# Bookil

Bookil adalah aplikasi penjualan produk digital berbasis PHP 8.5, Laravel 13, Inertia v2, React 19, TypeScript, dan Tailwind CSS. Pelanggan dapat menjelajah katalog, membuat pesanan, membayar melalui Midtrans Snap, dan mengunduh berkas dari storage privat sesuai kuota. Admin dapat mengelola katalog, kategori, pesanan, dan laporan penjualan.

## Menjalankan secara lokal

1. Siapkan PHP 8.5 beserta ekstensi yang diminta Composer, Node.js, dan database. Salin `.env.example` ke `.env`; isi `APP_KEY` dengan `php artisan key:generate`. Untuk SQLite, buat `database/database.sqlite` bila belum ada.
2. Jalankan `composer install` dan `npm ci`.
3. Atur `PRIVATE_DISK=local` untuk pengembangan lokal atau `s3` untuk S3/R2. Jangan gunakan disk `public` untuk berkas buku. Isi kredensial Midtrans untuk menguji pembayaran nyata di sandbox.
4. Jalankan `php artisan migrate --seed` dan `npm run build`. Seeder standar hanya membuat kategori; tidak membuat akun atau produk fiktif.
5. Jalankan `php artisan serve` dan, bila perlu hot reload, `npm run dev`.

Admin pertama harus dibuat melalui proses operasional yang aman dengan password unik. Jangan membuat akun admin menggunakan password contoh. Produk baru memerlukan berkas digital privat sebelum dapat disimpan. Isi cuplikan produk hanya jika Anda memiliki hak untuk menerbitkannya.

Untuk Redis, gunakan `REDIS_CLIENT=predis`, `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, dan `QUEUE_CONNECTION=redis` setelah Redis tersedia. Predis ada di dependensi Composer. Untuk produksi, gunakan database MySQL/PostgreSQL yang terkelola, HTTPS, bucket S3/R2 privat, kredensial Midtrans produksi, dan worker queue yang diawasi.

## Verifikasi

```text
php vendor/bin/pest
php vendor/bin/pint --test
npm run typecheck
npm run build
composer audit
npm audit
```

Tes lokal dan build tidak membuktikan integrasi gateway/cloud atau kesiapan rilis. Lakukan uji webhook Midtrans sandbox, presigned URL S3/R2, migrasi database target, Redis, backup/restore, dan beban konkurensi di staging sebelum produksi. Status bukti dan risiko yang tersisa dijelaskan dalam [catatan kesiapan](docs/READINESS.md).

## Alur inti

- `CreateOrderAction` mengunci baris produk dan menghitung ulang harga di server dalam transaksi.
- `MidtransSnapService` menyimpan token Snap per pesanan pending dan mengunci pembuatan token agar reload faktur tidak membuat sesi pembayaran baru.
- `ProcessPaymentWebhookAction` memverifikasi tanda tangan, memeriksa status melalui API Midtrans, mencocokkan nominal, menyimpan riwayat notifikasi, dan mengeluarkan hak unduh setelah settlement. Refund/reversal mencabut hak tersebut.
- `GenerateSecureDownloadAction` memeriksa pemilik, status lunas, masa akses, kuota, dan keberadaan aset sebelum membuat URL storage privat 15 menit. Route pelanggan memakai URL bertanda tangan dan setiap percobaan tindakan dicatat.

Simulator pembayaran hanya tersedia di `local`/`testing` bila `BOOKIL_PAYMENT_SIMULATOR_ENABLED=true`, dan hanya untuk pemilik pesanan. Nilai default `false`.

Kompleksitas pembuatan order adalah O(n log n) untuk pengurutan ID produk plus O(n) untuk item; pencarian produk, pembayaran, dan unduhan dibatasi indeks database. Kunci baris dan kunci cache menambah latensi saat kontensi, tetapi mencegah penagihan ganda dan oversubscription kuota.
