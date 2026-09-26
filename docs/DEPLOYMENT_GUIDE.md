# Panduan persiapan rilis Bookil

Panduan ini adalah daftar langkah operasional yang harus dibuktikan pada staging sebelum rilis. Belum ada deployment produksi yang diverifikasi oleh repositori ini.

## Lingkungan

- PHP 8.5 dan ekstensi yang diminta `composer check-platform-reqs`; Node.js untuk membangun aset.
- MySQL 8+ atau PostgreSQL 16+ untuk database, Redis untuk cache/session/queue, worker queue yang dikelola process supervisor, dan HTTPS.
- Bucket AWS S3/Cloudflare R2 privat. Konfigurasi `PRIVATE_DISK=s3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`, dan `AWS_ENDPOINT` untuk R2. Verifikasi presigned URL melalui browser di staging; jangan aktifkan akses bucket publik atau symlink ke berkas buku.
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, dan `MIDTRANS_IS_PRODUCTION` sesuai lingkungan. Pasang URL notifikasi gateway ke `/webhooks/midtrans`. Gunakan kredensial sandbox di staging.
- `BOOKIL_PAYMENT_SIMULATOR_ENABLED=false` di semua lingkungan selain pengembangan lokal yang benar-benar terisolasi.
- `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` unik, `APP_URL` HTTPS, `REDIS_CLIENT=predis`, `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, dan `QUEUE_CONNECTION=redis` untuk produksi.

## Rilis terkontrol

1. Backup database dan bucket; uji pemulihan pada staging. Jangan menjalankan `migrate:fresh` terhadap data yang perlu dipertahankan.
2. Pada commit target, jalankan `composer install --no-dev --prefer-dist --no-interaction`, `npm ci`, `npm run build`, dan `composer check-platform-reqs` di lingkungan build yang sesuai.
3. Jalankan `php artisan migrate --force` sebagai migrasi inkremental. Pada database yang sudah berisi order, periksa data sebelum menambah unique constraint atau mengubah status.
4. Jalankan `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`, lalu `php artisan queue:restart`. Pastikan worker baru aktif sebelum melepas maintenance mode.
5. Jalankan smoke test katalog, registrasi/login, checkout sandbox, webhook settlement/duplikat/refund, unduhan owner vs non-owner, URL kedaluwarsa, dan admin upload. Periksa log, alarm, dan metrik pembayaran.

Publikasi produk memerlukan hak distribusi yang sah dan berkas digital nyata. Seeder standar hanya membuat kategori. Buat akun admin pertama dengan password kuat menggunakan prosedur terkontrol; jangan memasukkan kredensial contoh ke database atau Git.

## Syarat keputusan rilis

Pest, Pint, TypeScript, build, dan audit dependensi harus hijau pada commit yang sama. Selain itu diperlukan uji MySQL/PostgreSQL dan beban konkurensi pada staging, webhook Midtrans sandbox nyata, presigned URL bucket privat, Redis/queue, backup/restore, serta review izin aset. Lihat [READINESS.md](READINESS.md) untuk status bukti terkini.
