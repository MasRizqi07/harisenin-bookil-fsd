# 🚀 Production Deployment & Operations Guide — Bookil

**Document Title:** Bookil Infrastructure Setup, Cloud Storage Provisioning & Production Runbook  
**Version:** 1.0.0 (Production Operations Baseline)  
**Status:** Approved / Active Baseline  
**Audience:** DevOps Engineers, System Administrators, Cloud Architects, Site Reliability Engineers (SRE)  
**Date:** September 2026  

---

## 📑 Daftar Isi

1. [Topologi Infrastruktur Produksi](#1-topologi-infrastruktur-produksi)
2. [Daftar Variabel Lingkungan Produksi (`.env.production`)](#2-daftar-variabel-lingkungan-produksi-envproduction)
3. [Prosedur Rilis Produksi Langkah-demi-Langkah](#3-prosedur-rilis-produksi-langkah-demi-langkah)
4. [Konfigurasi Cloud Storage Privat (AWS S3 / Cloudflare R2)](#4-konfigurasi-cloud-storage-privat-aws-s3--cloudflare-r2)
5. [Manajemen Daemon Queue Worker & Scheduler (Supervisor & Cron)](#5-manajemen-daemon-queue-worker--scheduler-supervisor--cron)
6. [Konfigurasi Web Server (Nginx & PHP 8.5-FPM)](#6-konfigurasi-web-server-nginx--php-85-fpm)
7. [Prosedur Pencadangan & Pemulihan Bencana (Backup & Disaster Recovery)](#7-prosedur-pencadangan--pemulihan-bencana-backup--disaster-recovery)

---

## 1. Topologi Infrastruktur Produksi

Arsitektur produksi Bookil dirancang untuk ketersediaan tinggi (*High Availability*), isolasi keamanan ketat, dan efisiensi biaya:

```text
[ Client Traffic (HTTPS) ]
            │
            ▼
[ Cloudflare CDN / WAF ] (DDoS Protection, SSL Termination, DNS)
            │
            ▼
[ Nginx Web Server (Reverse Proxy) ]
            │
            ▼
[ PHP 8.5+ FPM Engine ] ─── [ Redis ] (Cache, Sessions & Queue)
            │
    ┌───────┴───────┐
    ▼               ▼
[ MySQL 8.0+ ]  [ Cloudflare R2 / AWS S3 ]
(ACID Database) (Private E-Book Bucket with Presigned URLs)
```

---

## 2. Daftar Variabel Lingkungan Produksi (`.env.production`)

Pastikan seluruh variabel berikut terisi dengan benar di server produksi sebelum aplikasi diaktifkan:

```ini
APP_NAME=Bookil
APP_ENV=production
APP_KEY=base64:GeneratedAppKeyFromArtisanKeyGenerate==
APP_DEBUG=false
APP_URL=https://bookil.com

LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=warning

# Koneksi Basis Data MySQL Produksi
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bookil_prod
DB_USERNAME=bookil_admin
DB_PASSWORD=SuperSecureProductionPassword123!

# Session & Cache Berkecepatan Tinggi
SESSION_DRIVER=redis
SESSION_LIFETIME=120
CACHE_STORE=redis
QUEUE_CONNECTION=redis

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=YourRedisStrongPassword

# Penyimpanan Privat Cloud (Cloudflare R2 atau AWS S3)
FILESYSTEM_DISK=public
PRIVATE_DISK=s3

AWS_ACCESS_KEY_ID=your_r2_or_s3_access_key
AWS_SECRET_ACCESS_KEY=your_r2_or_s3_secret_key
AWS_DEFAULT_REGION=auto
AWS_BUCKET=bookil-private-assets
AWS_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
AWS_USE_PATH_STYLE_ENDPOINT=false

# Kredensial Resmi Midtrans Produksi
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

---

## 3. Prosedur Rilis Produksi Langkah-demi-Langkah

Jalankan urutan instruksi rilis berikut pada pipeline CI/CD (GitHub Actions / GitLab CI) atau langsung di terminal server:

### Langkah 1: Unduh Kode Terbaru & Pasang Dependensi
```bash
# Masuk ke direktori aplikasi
cd /var/www/bookil

# Aktifkan maintenance mode sementara (opsional)
php artisan down --secret="bookil-deploy-bypass-token"

# Tarik commit produksi
git checkout main
git pull origin main

# Pasang dependensi PHP tanpa dependensi dev (Pest, Pint dilewati)
composer install --no-dev --optimize-autoloader --no-interaction

# Pasang dependensi frontend dan bangun bundle produksi
npm ci
npm run build
```

### Langkah 2: Migrasi Basis Data & Pembuatan Symbolic Link
```bash
# Jalankan migrasi baru dengan konfirmasi paksa
php artisan migrate --force

# Buat symbolic link public storage untuk cover buku
php artisan storage:link
```

### Langkah 3: Warmup Cache Aplikasi (Performa Maksimal)
```bash
# Hapus cache lama
php artisan optimize:clear

# Kompilasi cache rute, konfigurasi, event, dan view
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### Langkah 4: Restart Background Service & Matikan Maintenance Mode
```bash
# Muat ulang worker queue agar membaca kode Action terbaru
php artisan queue:restart

# Muat ulang PHP-FPM
sudo systemctl reload php8.5-fpm

# Kembalikan aplikasi ke status online
php artisan up
```

---

## 4. Konfigurasi Cloud Storage Privat (AWS S3 / Cloudflare R2)

### Mengapa Cloudflare R2 Sangat Direkomendasikan?
1. **Zero Egress Fee:** Pengunduhan file e-book berukuran puluhan megabyte tidak dikenakan biaya transfer data keluar (*zero bandwidth charge*).
2. **Kompatibilitas S3 Penuh:** Menggunakan SDK Flysystem S3 standar Laravel tanpa perubahan kode.

### Kebijakan Ember (*Bucket Policy & CORS*):
Pastikan bucket R2/S3 Anda berstatus **Private** (Akses publik dinonaktifkan). Tambahkan konfigurasi CORS berikut pada bucket untuk mengizinkan download browser:

```json
[
  {
    "AllowedOrigins": ["https://bookil.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Disposition", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 5. Manajemen Daemon Queue Worker & Scheduler (Supervisor & Cron)

### Konfigurasi Supervisor Daemon (`/etc/supervisor/conf.d/bookil-worker.conf`)
Untuk memastikan background job pemrosesan token dan pengiriman email tetap berjalan di latar belakang:

```ini
[program:bookil-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/bookil/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/bookil/storage/logs/worker.log
stopwaitsecs=3600
```

Terapkan konfigurasi:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start bookil-worker:*
```

### Konfigurasi Cron Scheduler Linux (`crontab -e -u www-data`)
```bash
* * * * * cd /var/www/bookil && php artisan schedule:run >> /dev/null 2>&1
```

---

## 6. Konfigurasi Web Server (Nginx & PHP 8.5-FPM)

Simpan konfigurasi berikut pada `/etc/nginx/sites-available/bookil.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bookil.com www.bookil.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bookil.com www.bookil.com;
    root /var/www/bookil/public;

    ssl_certificate /etc/letsencrypt/live/bookil.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bookil.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Header Keamanan Produksi
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    index index.php;
    charset utf-8;

    # Batas ukuran upload cover & e-book (50 Megabytes)
    client_max_body_size 50M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Blokir akses ke file tersembunyi (.env, .git)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Cache asset statis frontend hasil build Vite
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
```

---

## 7. Prosedur Pencadangan & Pemulihan Bencana (Backup & Disaster Recovery)

### 1. Pencadangan Harian Otomatis Basis Data (MySQL Dump)
Buat skrip backup berkala `/usr/local/bin/bookil-backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/mysql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

mysqldump -u bookil_admin -p'SuperSecureProductionPassword123!' --single-transaction --quick bookil_prod | gzip > "$BACKUP_DIR/bookil_db_$TIMESTAMP.sql.gz"

# Hapus backup yang lebih tua dari 14 hari
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -exec rm {} +
```

### 2. Prosedur Pemulihan Bencana (Restore Runbook)
Jika terjadi insiden kegagalan basis data:
1. Pastikan server web dalam keadaan maintenance: `php artisan down`.
2. Ekstrak dan timpa data dari file backup terakhir:
   ```bash
   gunzip < /backups/mysql/bookil_db_YYYYMMDD_HHMMSS.sql.gz | mysql -u bookil_admin -p bookil_prod
   ```
3. Sinkronkan token dan verifikasi integritas:
   ```bash
   php artisan migrate --force
   php artisan cache:clear
   php artisan up
   ```
