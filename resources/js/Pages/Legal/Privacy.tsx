import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';

export default function Privacy() {
    return (
        <StoreLayout>
            <Head title="Kebijakan Privasi Data - Bookil" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-8">
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                <span className="material-symbols-outlined text-[16px]">security</span>
                                KEPATUHAN UU PDP NO. 27 TAHUN 2022
                            </span>
                            <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Standar Privasi &amp; Perlindungan Data Pribadi
                            </span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                            <div className="max-w-3xl space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Kebijakan Privasi Data
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    Transparansi menyeluruh mengenai bagaimana kami mengumpulkan, menyimpan, dan melindungi informasi identitas pribadi serta data transaksi Anda di Bookil.
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
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-600 shadow-sm"
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 space-y-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Topik Privasi
                            </h3>
                            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                                <li><a href="#p-1" className="block py-1 hover:text-indigo-600">1. Data yang Kami Kumpulkan</a></li>
                                <li><a href="#p-2" className="block py-1 hover:text-indigo-600">2. Keamanan Pembayaran</a></li>
                                <li><a href="#p-3" className="block py-1 hover:text-indigo-600">3. Penggunaan Cookie &amp; Sesi</a></li>
                                <li><a href="#p-4" className="block py-1 hover:text-indigo-600">4. Hak Akses &amp; Penghapusan</a></li>
                            </ul>
                        </div>
                    </aside>

                    <article className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
                        <section id="p-1" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                1. Data yang Kami Kumpulkan
                            </h2>
                            <p>
                                Kami hanya mengumpulkan informasi yang esensial untuk memproses pesanan dan menerbitkan lisensi e-book: nama lengkap, alamat email, dan riwayat pesanan faktur digital.
                            </p>
                            <p>
                                Data Anda tidak akan pernah dijual, disewakan, atau dibagikan kepada pengiklan pihak ketiga (Zero Advertising Tracking).
                            </p>
                        </section>

                        <section id="p-2" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                2. Keamanan Pembayaran
                            </h2>
                            <p>
                                Seluruh pembayaran diproses melalui saluran aman PCI-DSS Level 1 oleh PT Midtrans. Bookil tidak pernah melihat, memproses, atau menyimpan informasi kartu pembayaran atau PIN Anda di basis data kami.
                            </p>
                        </section>

                        <section id="p-3" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                3. Penggunaan Cookie &amp; Sesi
                            </h2>
                            <p>
                                Kami hanya menggunakan cookie esensial HTTP-Only dan CSRF protection token yang dibutuhkan untuk otentikasi sesi Anda saat login dan menjaga keamanan transaksi checkout.
                            </p>
                        </section>

                        <section id="p-4" className="space-y-3 scroll-mt-28">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                4. Hak Akses &amp; Penghapusan Data
                            </h2>
                            <p>
                                Sesuai dengan UU Pelindungan Data Pribadi (UU PDP No. 27/2022), Anda memiliki hak penuh untuk memperbarui data diri Anda atau mengajukan penghapusan akun permanen kapan saja melalui menu Pengaturan Akun.
                            </p>
                        </section>
                    </article>
                </div>
            </div>
        </StoreLayout>
    );
}
