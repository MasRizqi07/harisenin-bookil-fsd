# Bookil: catatan keamanan kode

Dokumen ini adalah tinjauan internal atas kode, bukan sertifikasi keamanan independen atau bukti kepatuhan produksi. Hasil tes terbaru dicatat di [READINESS.md](READINESS.md).

## Kontrol yang ada

- Order dibuat dari harga produk yang dibaca dan dikunci di database, bukan nominal yang dikirim browser.
- Webhook Midtrans memerlukan SHA-512 yang valid, lalu aplikasi meminta status transaksi dari API Midtrans melalui HTTPS. Nominal dan transaction ID dicocokkan dengan order. Notifikasi disimpan dengan event key unik; settlement duplikat tidak menerbitkan hak unduh lagi. Refund, deny, cancel, dan chargeback yang terkonfirmasi mencabut hak unduh.
- Route unduhan mewajibkan login dan tanda tangan sementara. Action mengecek kepemilikan, status paid, masa akses, kuota, serta keberadaan berkas di disk privat. Penambahan kuota dan log akses berada dalam transaksi database. Kegagalan tidak mengurangi kuota.
- Unggahan produk wajib berkas digital yang sesuai format; berkas yang telah dibeli tidak dapat ditimpa melalui admin. Berkas utama menggunakan `PRIVATE_DISK`, bukan symlink publik.
- Simulator settlement dimatikan secara default dan route hanya didaftarkan di lingkungan local/testing bila fitur diaktifkan. Akses dibatasi pada pemilik pesanan.

## Batas bukti dan pekerjaan operasional

- Pengujian lokal berbasis SQLite tidak membuktikan perilaku penguncian MySQL/PostgreSQL saat permintaan serentak. Jalankan pengujian konkurensi dan migrasi di database staging yang setara dengan produksi.
- S3/R2, Midtrans produksi, Redis, TLS, backup/restore, pemantauan, dan alarm belum dapat dibuktikan tanpa lingkungan dan kredensial staging/produksi.
- Presigned URL tetap dapat dipakai sampai kedaluwarsa setelah refund; masa maksimum 15 menit. Gateway reversal tidak bisa menarik kembali URL yang sudah diberikan oleh S3/R2.
- Aset yang pernah diimpor secara manual perlu diaudit keberadaan berkas dan hak distribusinya. Seeder demo lama berisi judul pihak ketiga dan akun berpassword umum telah dihapus; seeder standar kini hanya membuat kategori.
- Proses refund/chargeback parsial memerlukan kebijakan bisnis eksplisit sebelum dipetakan ke pencabutan lisensi penuh. Saat ini pencabutan penuh hanya untuk status refund/chargeback penuh, deny, atau cancel.

Jangan menyebut sistem tersertifikasi atau siap produksi hanya dari tes unit/fitur lokal. Bukti staging dan konfigurasi operasional dibutuhkan untuk keputusan rilis.
