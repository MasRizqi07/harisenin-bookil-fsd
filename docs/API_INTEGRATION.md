# Integrasi pembayaran dan unduhan Bookil

## Checkout dan Snap

`POST /checkout` memerlukan login dan product ID aktif. Harga dan total dihitung di server oleh `CreateOrderAction`. `MidtransSnapService` meminta token dari `https://app.sandbox.midtrans.com/snap/v1/transactions` atau endpoint produksi yang setara melalui HTTPS. Token serta redirect URL disimpan pada order pending dan digunakan ulang ketika faktur dibuka lagi. Bila gateway gagal, order tetap pending dan UI menampilkan kegagalan; tidak ada token tiruan.

Midtrans memakai satuan Rupiah bulat; harga pecahan Rupiah ditolak sebelum request Snap. Server key hanya berada di konfigurasi backend. Client key digunakan browser untuk `snap.js`.

## Webhook

`POST /webhooks/midtrans` tidak memakai CSRF cookie. Action mewajibkan field penting dan memeriksa:

```text
SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
```

Lalu action memanggil `GET https://api[.sandbox].midtrans.com/v2/{order_id}/status` dengan Basic Auth server key. `order_id`, `transaction_id`, `transaction_status`, `gross_amount`, dan `fraud_status` harus cocok. Nilai gross dibandingkan dengan total order dari database. Status settlement atau capture dengan fraud accept mengubah order menjadi paid dan menerbitkan hak unduh. Event notification disimpan terpisah dengan event key unik; kiriman identik mendapat HTTP 200 tanpa efek berulang. Refund, chargeback, deny, atau cancel terhadap transaksi paid yang sama mencabut hak unduh.

Jangan menganggap callback JavaScript Snap sebagai bukti pembayaran; hanya webhook yang terverifikasi mengubah status pesanan.

## Pengiriman berkas

Dashboard/faktur memberikan URL aplikasi yang ditandatangani dan berlaku 15 menit untuk tiap item berhak. `GET /downloads/{orderItem}?expires=...&signature=...` mewajibkan login, signature valid, pemilik item, order paid, masa akses dan kuota yang tersedia. Setelah memastikan objek ada di `PRIVATE_DISK`, action menaikkan counter, menulis log percobaan, dan mengalihkan ke URL privat S3/R2 yang berlaku 15 menit. Tabel `download_tokens` hanya menyimpan masa akses dan kuota; tidak ada bearer token statis.

Route checkout dibatasi 10 request/menit dan route unduhan 30 request/menit. Simulator pembayaran hanya untuk local/testing dan hanya terdaftar bila flag `BOOKIL_PAYMENT_SIMULATOR_ENABLED=true`.
