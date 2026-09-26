# Bukti kesiapan Bookil

Status ini berlaku untuk perubahan pada branch `session-1`. Pemeriksaan lokal tidak membuktikan kesiapan produksi.

## Bukti lokal

- PHP 8.5, PostgreSQL 18 pada database uji terpisah: `php artisan test --compact --colors=never` menghasilkan **152 passed (516 assertions)** pada 26 September 2026. Termasuk uji dua koneksi untuk `SELECT ... FOR UPDATE` dengan batas tunggu 500 ms.
- SQLite `:memory:`: perintah yang sama menghasilkan **151 passed (511 assertions), 1 skipped**. Uji kunci baris sengaja dilewati pada SQLite.
- Permintaan unduh dengan URL bertanda tangan yang valid menghasilkan HTTP 302; setelah signature diubah secara manual menghasilkan HTTP 403.
- Build React/TypeScript `npm run build` berhasil secara lokal. Hasil CI untuk commit final dicatat terpisah setelah workflow GitHub Actions berjalan.

## Belum terverifikasi

- Webhook Midtrans asli dan Snap dalam sandbox maupun produksi.
- Presigned URL dan pengiriman berkas pada bucket S3/R2 privat yang sebenarnya.
- Redis untuk queue, cache, session, dan throttling pada topologi produksi.
- Migrasi serta backup/restore pada database target deployment.
- Uji beban dan integrasi browser penuh pada staging.

Jangan mulai proses go-live atau mengisi kredensial produksi sampai pemeriksaan eksternal tersebut ditinjau secara manual.
