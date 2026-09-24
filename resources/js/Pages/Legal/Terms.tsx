import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';

export default function Terms() {
    return (
        <StoreLayout>
            <Head title="Syarat & Ketentuan Layanan - Bookil" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-8">
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        {/* Regulatory Pill */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                                DOKUMEN KEPATUHAN RESMI
                            </span>
                            <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Standar Regulasi Bank Indonesia &amp; Midtrans Production 2026
                            </span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                            <div className="max-w-3xl space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Syarat &amp; Ketentuan Layanan
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    Ketentuan resmi mengenai hak lisensi personal e-book digital, transaksi pembayaran Midtrans, tanggung jawab akun, dan integritas perlindungan kekayaan intelektual.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    <span>Cetak Dokumen</span>
                                </button>
                            </div>
                        </div>

                        {/* Status Metadata Ribbon */}
                        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px] text-emerald-600">history</span>
                                    Terakhir Diperbarui: <strong className="text-slate-800">Februari 2026</strong>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px] text-indigo-600">article</span>
                                    Versi Legal: <strong className="text-slate-800">v2.4-Enterprise</strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Status Kepatuhan: Aktif Beroperasi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="overflow-x-auto pb-1">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-max min-w-full sm:min-w-0">
                        <Link
                            href="/terms"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-600 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">gavel</span>
                            <span>Syarat &amp; Ketentuan</span>
                        </Link>
                        <Link
                            href="/privacy"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            <span>Kebijakan Privasi</span>
                        </Link>
                        <Link
                            href="/refund-policy"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                            <span>Kebijakan Pengembalian Dana (Refund)</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid: TOC + Corpus */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left TOC Sidebar */}
                    <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 space-y-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Daftar Isi Ketentuan
                            </h3>
                            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                                <li>
                                    <a href="#sec-1" className="block py-1 hover:text-indigo-600 hover:translate-x-1 transition-all">
                                        1. Definisi &amp; Ruang Lingkup
                                    </a>
                                </li>
                                <li>
                                    <a href="#sec-2" className="block py-1 hover:text-indigo-600 hover:translate-x-1 transition-all">
                                        2. Pembelian &amp; Pembayaran Midtrans
                                    </a>
                                </li>
                                <li>
                                    <a href="#sec-3" className="block py-1 hover:text-indigo-600 hover:translate-x-1 transition-all">
                                        3. Lisensi Personal Zero-DRM
                                    </a>
                                </li>
                                <li>
                                    <a href="#sec-4" className="block py-1 hover:text-indigo-600 hover:translate-x-1 transition-all">
                                        4. Batas Kuota &amp; Keamanan Berkas
                                    </a>
                                </li>
                                <li>
                                    <a href="#sec-5" className="block py-1 hover:text-indigo-600 hover:translate-x-1 transition-all">
                                        5. Batasan Tanggung Jawab &amp; Yurisdiksi
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Right Document Corpus */}
                    <article className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
                        <section id="sec-1" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                1. Definisi &amp; Ruang Lingkup
                            </h2>
                            <p>
                                Platform <strong>Bookil</strong> (selanjutnya disebut "Layanan") adalah toko buku digital yang memfasilitasi penjualan e-book teknis premium berformat PDF, EPUB, dan repositori kode sumber (ZIP).
                            </p>
                            <p>
                                Dengan mendaftar, mengakses, atau membeli produk di Bookil, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang termaktub di dalam dokumen ini.
                            </p>
                        </section>

                        <section id="sec-2" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                2. Pembelian &amp; Pembayaran Midtrans
                            </h2>
                            <p>
                                Seluruh transaksi moneter di platform Bookil diproses secara aman melalui gerbang pembayaran berlisensi Bank Indonesia (PT Midtrans). Bookil tidak pernah menyimpan nomor kartu kredit, CVV, atau kredensial perbankan pengguna di server kami.
                            </p>
                            <p>
                                Setiap pesanan yang dibuat memiliki jangka waktu pelunasan maksimal <strong>24 jam</strong>. Apabila pembayaran tidak terselesaikan dalam batas waktu tersebut, pesanan otomatis dinyatakan kedaluwarsa oleh sistem.
                            </p>
                        </section>

                        <section id="sec-3" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                3. Lisensi Personal Zero-DRM
                            </h2>
                            <p>
                                Pembelian e-book di Bookil memberikan Anda <strong>Lisensi Penggunaan Personal Non-Eksklusif Seumur Hidup (Perpetual Non-Exclusive Personal License)</strong>.
                            </p>
                            <p>
                                Anda diperbolehkan membaca dan menyimpan berkas di perangkat pribadi Anda secara bebas (Zero-DRM). Namun, Anda <strong>dilarang keras</strong> mendistribusikan ulang, menjual kembali, menyewakan, atau mengunggah berkas e-book ke repositori publik, platform pembajakan, atau situs file-sharing publik.
                            </p>
                        </section>

                        <section id="sec-4" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                4. Batas Kuota &amp; Keamanan Berkas
                            </h2>
                            <p>
                                Setiap item pesanan yang telah dibayar dilengkapi dengan kuota awal sebanyak <strong>5 (lima) kali unduhan</strong> dan tautan berdurasi <strong>15 menit</strong> (Presigned Storage URL).
                            </p>
                            <p>
                                Apabila kuota unduhan habis karena penggantian perangkat atau kehilangan berkas lokal secara wajar, pembeli dapat mengajukan permohonan reset kuota secara gratis melalui tim dukungan pelanggan Bookil.
                            </p>
                        </section>

                        <section id="sec-5" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                5. Batasan Tanggung Jawab &amp; Yurisdiksi
                            </h2>
                            <p>
                                Layanan dan seluruh materi e-book disediakan "sebagaimana adanya" (as-is). Penulis dan Bookil tidak bertanggung jawab atas kerugian tidak langsung yang timbul akibat penerapan materi atau kode sumber di lingkungan produksi pengguna.
                            </p>
                            <p>
                                Syarat dan ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di <strong>Republik Indonesia</strong>. Setiap sengketa yang timbul akan diselesaikan secara musyawarah untuk mufakat terlebih dahulu sebelum menempuh jalur yurisdiksi peradilan.
                            </p>
                        </section>
                    </article>
                </div>
            </div>
        </StoreLayout>
    );
}
