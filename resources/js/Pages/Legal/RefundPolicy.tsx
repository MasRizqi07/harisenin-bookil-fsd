import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';

export default function RefundPolicy() {
    return (
        <StoreLayout>
            <Head title="Kebijakan Pengembalian Dana (Refund) - Bookil" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-8">
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                                <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                                STANDAR REFUND PRODUK DIGITAL
                            </span>
                            <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Kebijakan Perlindungan Konsumen &amp; Zero-DRM
                            </span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                            <div className="max-w-3xl space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Kebijakan Pengembalian Dana (Refund)
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    Pedoman transparan mengenai ketentuan pembatalan pesanan, pembayaran ganda, dan garansi berkas digital e-book di platform Bookil.
                                </p>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors self-start lg:self-auto"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                <span>Cetak Dokumen</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="overflow-x-auto pb-1">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-max min-w-full sm:min-w-0">
                        <Link
                            href="/terms"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
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
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-600 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                            <span>Kebijakan Pengembalian Dana (Refund)</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 space-y-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Ketentuan Refund
                            </h3>
                            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                                <li><a href="#r-1" className="block py-1 hover:text-indigo-600">1. Sifat Produk Digital</a></li>
                                <li><a href="#r-2" className="block py-1 hover:text-indigo-600">2. Kasus yang Memenuhi Syarat Refund</a></li>
                                <li><a href="#r-3" className="block py-1 hover:text-indigo-600">3. Prosedur Pengajuan Refund</a></li>
                                <li><a href="#r-4" className="block py-1 hover:text-indigo-600">4. Waktu Proses Pengembalian</a></li>
                            </ul>
                        </div>
                    </aside>

                    <article className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
                        <section id="r-1" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                1. Sifat Produk Digital &amp; Akses Instan
                            </h2>
                            <p>
                                Karena produk yang dijual di Bookil berbentuk barang digital tak berwujud (intangible digital goods) yang dapat diunduh dan disimpan seketika setelah pembayaran terverifikasi, seluruh transaksi penjualan pada prinsipnya bersifat final dan tidak dapat dibatalkan secara sepihak.
                            </p>
                        </section>

                        <section id="r-2" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                2. Kasus yang Memenuhi Syarat Refund
                            </h2>
                            <p>
                                Kami menjamin kepuasan dan integritas transaksi Anda. Pengembalian dana penuh (100% refund) disetujui dalam kondisi berikut:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-xs">
                                <li>
                                    <strong>Pembayaran Ganda (Double Billing):</strong> Sistem memotong saldo lebih dari satu kali untuk nomor faktur yang sama karena anomali jaringan.
                                </li>
                                <li>
                                    <strong>Berkas Rusak / Korup (Unrecoverable Corrupted Asset):</strong> Berkas digital yang diunduh terbukti rusak, tidak dapat dibuka di perangkat standar, dan tim teknis kami tidak dapat menyediakan salinan pengganti dalam waktu 2x24 jam.
                                </li>
                                <li>
                                    <strong>Salah Judul / Ketidaksesuaian Materi:</strong> Berkas yang dikirimkan terbukti secara substansial berbeda dengan halaman katalog produk.
                                </li>
                            </ul>
                        </section>

                        <section id="r-3" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                3. Prosedur Pengajuan Refund
                            </h2>
                            <p>
                                Untuk mengajukan klaim pengembalian dana, kirimkan email ke <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-xs">support@bookil.com</code> dalam kurun waktu <strong>7 (tujuh) hari kalender</strong> sejak tanggal transaksi dengan menyertakan:
                            </p>
                            <ol className="list-decimal pl-5 space-y-1 text-xs">
                                <li>Nomor Pesanan / Faktur (contoh: <code className="font-mono">ORD-20260228-XXXX</code>).</li>
                                <li>Alamat email akun Bookil yang digunakan saat checkout.</li>
                                <li>Bukti screenshot kendala atau bukti mutasi perbankan untuk kasus pembayaran ganda.</li>
                            </ol>
                        </section>

                        <section id="r-4" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                4. Waktu Proses Pengembalian Dana
                            </h2>
                            <p>
                                Setelah klaim diverifikasi dan disetujui oleh tim finance kami:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li><strong>QRIS &amp; E-Wallet:</strong> Saldo dikembalikan dalam 1 - 3 hari kerja.</li>
                                <li><strong>Virtual Account &amp; Transfer Bank:</strong> Dana ditransfer balik ke rekening asal dalam 1 - 2 hari kerja.</li>
                            </ul>
                        </section>
                    </article>
                </div>
            </div>
        </StoreLayout>
    );
}
