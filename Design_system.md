# 📐 Design System Specification — Bookil

**Document Title:** Bookil Design System & Component Library Reference  
**Version:** 1.0.0 (Production-Grade Design System)  
**Status:** Approved / Active Baseline  
**Audience:** Frontend Engineers, UI/UX Designers, Accessibility Auditors, QA Engineers  
**Date:** September 2026  

---

## 📑 Daftar Isi

1. [Fondasi & Prinsip Sistem Desain](#1-fondasi--prinsip-sistem-desain)
2. [Palet Warna & Token Semantik (Color Tokens)](#2-palet-warna--token-semantik-color-tokens)
3. [Sistem Tipografi & Skala Teks (Typography)](#3-sistem-tipografi--skala-teks-typography)
4. [Sistem Spasi, Grid & Tata Letak (Spatial System)](#4-sistem-spasi-grid--tata-letak-spatial-system)
5. [Elevasi, Bayangan & Radius Sudut (Elevation & Radius)](#5-elevasi-bayangan--radius-sudut-elevation--radius)
6. [Inventaris Komponen UI (Component Inventory)](#6-inventaris-komponen-ui-component-inventory)
   * [6.1 Tombol (Button Components)](#61-tombol-button-components)
   * [6.2 Elemen Input & Formulir (Form Elements)](#62-elemen-input--formulir-form-elements)
   * [6.3 Lencana Status & Chips (Status Badges)](#63-lencana-status--chips-status-badges)
   * [6.4 Kartu Produk & Konten (Card Components)](#64-kartu-produk--konten-card-components)
   * [6.5 Modal & Dialog Interaktif (Modals & Overlays)](#65-modal--dialog-interaktif-modals--overlays)
   * [6.6 Tabel Data & Baris Transaksi (Data Tables)](#66-tabel-data--baris-transaksi-data-tables)
7. [Standar Aksesibilitas (WCAG 2.1 Level AA Compliance)](#7-standar-aksesibilitas-wcag-21-level-aa-compliance)
8. [Panduan Animasi & Mikro-Interaksi (Motion Guidelines)](#8-panduan-animasi--mikro-interaksi-motion-guidelines)

---

## 1. Fondasi & Prinsip Sistem Desain

Design System **Bookil** dirancang untuk menciptakan konsistensi visual, efisiensi rekayasa antarmuka, serta rasa percaya (*trust*) yang tinggi bagi pelanggan dan administrator. Sistem ini dibangun dengan pendekatan modular di atas **Tailwind CSS 3.x** dan **Headless UI** dengan fondasi TypeScript murni.

### Nilai-Nilai Desain Inti:
1. **Kejelasan Intelektual (Clarity):** Antarmuka tidak mengalihkan perhatian dari buku, melainkan membingkainya dengan rapi, proporsional, dan nyaman di mata.
2. **Keteraturan & Skalabilitas (Systematic Structure):** Setiap warna, ukuran font, dan jarak memiliki peran semantik yang terdefinisi secara baku (*tokenized*).
3. **Keandalan & Aksesibilitas (Accessible & Inclusive):** Standar kontras visual, navigasi keyboard yang jelas, dan umpan balik interaksi yang tegas.

---

## 2. Palet Warna & Token Semantik (Color Tokens)

Sistem warna Bookil membagi peran warna ke dalam kategori: Brand Primer, Netral Dasar, dan Status Semantik.

### 2.1 Palet Utama (Primary Indigo / Violet)
Warna primer merepresentasikan kebijaksanaan, keanggunan, dan integritas digital.

| Token Tailwind | Nilai HEX | Peran Semantik & Penggunaan |
| :--- | :--- | :--- |
| `indigo-50` | `#EEF2FF` | Background aksen sangat lembut, highlight hover kartu. |
| `indigo-100` | `#E0E7FF` | Border lembut pada kartu pilihan, badge kategori aktif. |
| `indigo-500` | `#6366F1` | Focus ring outline, indikator tab aktif, garis pemisah aksen. |
| `indigo-600` | `#4F46E5` | **Brand Primary:** Tombol CTA utama, logo, tautan aktif. |
| `indigo-700` | `#4338CA` | Hover state tombol CTA utama. |
| `indigo-900` | `#312E81` | Heading banner hero, teks badge kontras tinggi. |

### 2.2 Palet Netral (Slate Gray)
Digunakan untuk struktur latar belakang, permukaan kartu, garis pemisah, dan hierarki teks.

| Token Tailwind | Nilai HEX | Peran Semantik & Penggunaan |
| :--- | :--- | :--- |
| `white` | `#FFFFFF` | Latar belakang kartu (*surface*), latar dialog modal. |
| `slate-50` | `#F8FAFC` | Latar belakang halaman aplikasi utama (*page canvas*). |
| `slate-100` | `#F1F5F9` | Latar selang-seling tabel (*zebra striping*), input disabled. |
| `slate-200` | `#E2E8F0` | Garis pemisah (*divider*), border kartu, border input default. |
| `slate-400` | `#94A3B8` | Teks placeholder input, ikon tidak aktif. |
| `slate-600` | `#475569` | Teks sekunder, nama penulis, keterangan waktu, label form. |
| `slate-800` | `#1E293B` | Teks paragraf utama (*body text*), nilai tabel. |
| `slate-900` | `#0F172A` | Teks judul utama (*h1, h2*), judul buku, angka harga tebal. |

### 2.3 Palet Status & Umpan Balik (Feedback Colors)

```text
  [ SUCCESS ] Emerald (#059669 / #D1FAE5)  --> Transaksi Lunas (PAID), Simpan Berhasil
  [ WARNING ] Amber   (#D97706 / #FEF3C7)  --> Menunggu Pembayaran (PENDING), Kuota Kritis
  [ DANGER  ] Rose    (#E11D48 / #FFE4E6)  --> Pembayaran Gagal/Expired, Hapus Produk
  [ INFO    ] Sky     (#0284C7 / #E0F2FE)  --> Informasi Format File, Log Audit
```

---

## 3. Sistem Tipografi & Skala Teks (Typography)

Bookil mengadopsi keluarga font geometris modern **Figtree** yang dioptimalkan untuk keterbacaan tinggi di layar resolusi tinggi:

```css
font-family: 'Figtree', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Skala Hierarki Tipografi

| Level / Token | Ukuran / Line-Height | Weight | Contoh Penggunaan |
| :--- | :--- | :--- | :--- |
| **Display 1** | `text-4xl sm:text-5xl` (36px / 48px) | `font-bold` (700) | Judul Utama Hero Banner Storefront |
| **Heading 1** | `text-3xl sm:text-4xl` (30px / 36px) | `font-bold` (700) | Judul Detail Buku, Judul Dashboard Admin |
| **Heading 2** | `text-2xl` (24px / 32px) | `font-semibold` (600) | Judul Seksi Halaman, Judul Modal Preview |
| **Heading 3** | `text-xl` (20px / 28px) | `font-semibold` (600) | Judul Kartu Buku, Nama Metrik Widget |
| **Heading 4** | `text-lg` (18px / 28px) | `font-medium` (500) | Sub-judul Seksi, Label Harga Utama |
| **Body Large** | `text-base` (16px / 24px) | `font-normal` (400) | Deskripsi Sinopsis Buku, Teks Pengantar |
| **Body Regular** | `text-sm` (14px / 20px) | `font-normal` (400) | Isi Tabel Data, Teks Formulir, Nama Penulis |
| **Caption / Small**| `text-xs` (12px / 16px) | `font-medium` (500) | Badge Status, Keterangan Format Berkas, Timestamp |

---

## 4. Sistem Spasi, Grid & Tata Letak (Spatial System)

Bookil menerapkan **Sistem Spasi Berbasis 4px / 8pt**:

```text
Token   Ukuran    Penggunaan Khusus
p-1      4px      Padding internal badge / icon container mini
p-2      8px      Jarak antar item dropdown, padding input ringkas
p-4     16px      Padding kartu default, jarak horizontal form group
p-6     24px      Padding kartu metrik dashboard, padding modal dialog
p-8     32px      Padding seksi halaman, padding kontainer utama
p-12    48px      Jarak antar seksi vertikal pada storefront landing
```

### Lebar Kontainer Maksimal (*Container Constraints*)
* **Katalog & Storefront:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (Proporsi seimbang untuk 4 kolom kartu produk).
* **Detail Produk & Invoice:** `max-w-5xl mx-auto` (Fokus visual terpusat untuk proses checkout).
* **Otentikasi (Login/Register):** `max-w-md mx-auto` (Kerapatan form optimal).

---

## 5. Elevasi, Bayangan & Radius Sudut (Elevation & Radius)

### 5.1 Skala Bayangan (Shadow Tokens)
* **Flat (`shadow-none`):** Elemen datar, input form dalam keadaan pasif.
* **Surface Low (`shadow-sm`):** Kartu tabel, input form saat aktif.
* **Surface Medium (`shadow` / `shadow-md`):** Kartu produk katalog default, kartu widget metrik admin.
* **Elevated High (`shadow-xl`):** Kartu produk saat di-hover (`hover:shadow-xl`), dropdown menu melayang.
* **Modal Overlay (`shadow-2xl`):** Dialog konfirmasi checkout, modal pratinjau cuplikan.

### 5.2 Skala Radius Sudut (Corner Radius Tokens)
* **Kecil (`rounded-md` - 6px):** Tombol aksi tabel, lencana badge status, field input form.
* **Sedang (`rounded-lg` - 8px):** Tombol primer, kartu ringkas.
* **Besar (`rounded-xl` - 12px):** Kartu produk katalog, sampul buku, kontainer widget.
* **Sangat Besar (`rounded-2xl` - 16px):** Kontainer dialog modal, banner promosi utama.
* **Pill (`rounded-full`):** Filter kategori horizontal, avatar profil, badge notifikasi.

---

## 6. Inventaris Komponen UI (Component Inventory)

### 6.1 Tombol (Button Components)

#### 1. Primary Button (`PrimaryButton.tsx`)
Tombol tindakan utama dengan kontras tertinggi:
```tsx
// resources/js/Components/PrimaryButton.tsx
<button
    {...props}
    className={
        `inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 
         text-sm font-semibold text-white shadow-sm transition-all duration-150 
         hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
         focus:ring-offset-2 active:bg-indigo-800 disabled:opacity-50 ${className}`
    }
>
    {children}
</button>
```

#### 2. Secondary Button (`SecondaryButton.tsx`)
Tombol tindakan sekunder atau pembatalan:
```tsx
// resources/js/Components/SecondaryButton.tsx
<button
    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 
               text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
>
```

#### 3. Danger Button (`DangerButton.tsx`)
Tombol untuk aksi destruktif (contoh: hapus produk):
```tsx
// resources/js/Components/DangerButton.tsx
<button
    className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm 
               font-semibold text-white shadow-sm hover:bg-rose-700 
               focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
>
```

---

### 6.2 Elemen Input & Formulir (Form Elements)

* **Text Input (`TextInput.tsx`):**
  Menggunakan border `border-slate-300` dengan fokus visual tebal `focus:border-indigo-500 focus:ring-indigo-500 rounded-lg`.
* **Input Label (`InputLabel.tsx`):**
  Tipografi tegas `text-sm font-medium text-slate-700` dengan tanda bintang merah jika wajib diisi.
* **Input Error (`InputError.tsx`):**
  Teks penjelasan kesalahan validasi `text-sm text-rose-600 font-medium mt-1`.

---

### 6.3 Lencana Status & Chips (Status Badges)

Standar render lencana status transaksi dan tipe format file:

```tsx
// Status Pesanan (Order Status Badge)
{order.status === 'paid' && (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
        Lunas
    </span>
)}

{order.status === 'pending' && (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
        Menunggu Pembayaran
    </span>
)}

// Format Berkas (File Format Pill)
<span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 uppercase">
    PDF • 14.7 MB
</span>
```

---

### 6.4 Kartu Produk & Konten (Card Components)

Komponen inti etalase toko (`ProductCard.tsx`):
* **Rasio Sampul:** Aspek rasio 3:4 dengan fallback grafis gradient jika gambar belum diunggah.
* **Efek Hover:** Mengangkat kartu ke atas secara halus dengan transisi `transform -translate-y-1 hover:shadow-xl transition-all duration-200`.
* **Badge Kategori:** Menempel di pojok kiri atas sampul dengan latar belakang *glassmorphism semi-transparan*.
* **Format Mata Uang:** Menampilkan angka harga tebal (`text-lg font-bold text-slate-900`) dengan awalan `Rp`.

---

### 6.5 Modal & Dialog Interaktif (Modals & Overlays)

* **Struktur Dialog (`Modal.tsx`):** Menggunakan `@headlessui/react` `Transition` dan `Dialog` untuk menjamin fokus perangkap (*focus trap*) dan penutupan dengan tombol `Escape`.
* **Backdrop Dim:** Lapisan gelap transparan `bg-slate-900/60 backdrop-blur-sm` untuk memusatkan perhatian pengguna pada dialog aktif.

---

### 6.6 Tabel Data & Baris Transaksi (Data Tables)

* **Header Tabel:** Latar `bg-slate-50`, teks kapital kecil `text-xs font-semibold uppercase tracking-wider text-slate-500`.
* **Baris Data:** Garis pemisah halus `divide-y divide-slate-200`, transisi hover baris `hover:bg-slate-50/80`.
* **Paginasi:** Tombol navigasi bernomor dengan indikator halaman aktif berwarna latar indigo penuh.

---

## 7. Standar Aksesibilitas (WCAG 2.1 Level AA Compliance)

Aplikasi Bookil mengimplementasikan pedoman aksesibilitas digital secara ketat:

1. **Rasio Kontras Warna (Contrast Ratio):**
   * Seluruh teks utama (Slate 900 terhadap Putih) memiliki rasio kontras **$16.0 : 1$** (jauh melampaui batas minimal WCAG 4.5:1).
   * Teks sekunder (Slate 600 terhadap Putih) memiliki rasio kontras **$7.0 : 1$**.
   * Tombol primer (Putih terhadap Indigo 600) memiliki rasio kontras **$5.8 : 1$**.
2. **Navigasi Keyboard Penuh (Full Keyboard Navigability):**
   * Seluruh elemen interaktif (tombol, input, link, kartu berkoleksi) memiliki *outline focus ring* yang terlihat jelas (`focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`).
   * Tombol modal dapat ditutup dengan menekan tombol keyboard `Esc`.
3. **Screen Reader Support:**
   * Atribut `aria-label` eksplisit pada tombol ikonik tanpa teks.
   * Hubungan label dan input form terhubung melalui atribut `htmlFor` dan `id`.

---

## 8. Panduan Animasi & Mikro-Interaksi (Motion Guidelines)

Animasi pada Bookil bertujuan fungsional untuk mengonfirmasi tindakan pengguna:

* **Durasi Standar:** `150ms` untuk interaksi tombol mikro, `200ms` untuk efek hover kartu, `300ms` untuk transisi buka/tutup modal.
* **Kurva Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind `ease-in-out` default) untuk percepatan dan perlambatan yang alami.
* **Pemuatan Berulang (Loading States):** Spinner lingkaran berputar SVG halus (`animate-spin`) menyertai tombol ketika proses pembayaran atau pembentukan token berlangsung.
