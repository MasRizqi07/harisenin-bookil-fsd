import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';

interface ErrorPageProps {
    status?: number;
    message?: string;
}

export default function ErrorPage({ status = 404, message }: ErrorPageProps) {
    const [currentStatus, setCurrentStatus] = useState<number>(status);

    const errorDetails: Record<
        number,
        {
            code: string;
            title: string;
            badge: string;
            description: string;
            hint: string;
            actionLabel: string;
            actionHref: string;
            secondaryLabel?: string;
            secondaryHref?: string;
            icon: string;
            color: string;
        }
    > = {
        404: {
            code: '404',
            title: 'Koleksi E-Book Tidak Ditemukan',
            badge: 'Halaman Hilang / Salah Tautan',
            description:
                message ||
                'Halaman katalog buku atau berkas yang Anda tuju mungkin telah berganti tautan, dinonaktifkan, atau alamat URL salah ketik.',
            hint: 'Periksa kembali URL atau gunakan fitur pencarian (Cmd+K) untuk menemukan judul yang Anda cari.',
            actionLabel: 'Kembali ke Katalog E-Book',
            actionHref: route('products.index'),
            secondaryLabel: 'Pusat Bantuan (FAQ)',
            secondaryHref: '/faq',
            icon: 'menu_book',
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        },
        403: {
            code: '403',
            title: 'Akses Lisensi Terkunci',
            badge: 'Izin Ditolak (Forbidden)',
            description:
                message ||
                'Anda belum memiliki lisensi kepemilikan yang sah untuk mengakses berkas master ini, atau Anda perlu masuk ke akun yang melakukan pembelian.',
            hint: 'Pastikan Anda telah login menggunakan akun email yang terdaftar pada saat proses checkout.',
            actionLabel: 'Masuk ke Akun Anda',
            actionHref: route('login'),
            secondaryLabel: 'Jelajahi Katalog',
            secondaryHref: route('products.index'),
            icon: 'lock',
            color: 'text-purple-600 bg-purple-50 border-purple-200',
        },
        410: {
            code: '410',
            title: 'Tautan Unduh Sementara Telah Kedaluwarsa',
            badge: 'S3 Presigned URL Expired',
            description:
                message ||
                'Tautan unduh presigned memiliki masa berlaku 15 menit demi keamanan enkripsi berkas digital Anda.',
            hint: 'Tautan lama sudah tidak aktif. Silakan buka kembali Perpustakaan Saya untuk menghasilkan tautan unduh baru yang segar.',
            actionLabel: 'Buka Perpustakaan Saya',
            actionHref: route('dashboard'),
            secondaryLabel: 'Tanya Jawab Unduhan',
            secondaryHref: '/faq',
            icon: 'history_toggle_off',
            color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        429: {
            code: '429',
            title: 'Batas 5x Kuota Unduhan Terlampaui',
            badge: 'Fair Use Quota Exceeded',
            description:
                message ||
                'Anda telah menggunakan seluruh jatah 5x unduhan untuk lisensi e-book ini sesuai kebijakan fair-use keamanan digital.',
            hint: 'Jangan khawatir! Hubungi tim bantuan kami untuk melakukan permohonan reset kuota unduhan gratis tanpa biaya.',
            actionLabel: 'Hubungi Tim Bantuan (Reset Gratis)',
            actionHref: '/faq',
            secondaryLabel: 'Kembali ke Dashboard',
            secondaryHref: route('dashboard'),
            icon: 'data_saver_on',
            color: 'text-rose-600 bg-rose-50 border-rose-200',
        },
        500: {
            code: '500',
            title: 'Kendala Komunikasi Gateway & Server',
            badge: 'Internal Server Error',
            description:
                message ||
                'Terjadi anomali saat berkomunikasi dengan payment engine atau vault penyimpanan berkas. Data pesanan Anda tetap aman.',
            hint: 'Tim teknis kami telah menerima laporan insiden ini. Silakan muat ulang halaman beberapa saat lagi.',
            actionLabel: 'Muat Ulang Halaman',
            actionHref: window.location.href,
            secondaryLabel: 'Hubungi Dukungan',
            secondaryHref: '/faq',
            icon: 'precision_manufacturing',
            color: 'text-slate-700 bg-slate-100 border-slate-300',
        },
    };

    const currentError = errorDetails[currentStatus] || errorDetails[404];

    return (
        <StoreLayout>
            <Head title={`${currentError.code} - ${currentError.title} - Bookil`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-8">
                {/* Error Scenario Bar */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-semibold">
                        <span className="material-symbols-outlined text-[18px] text-indigo-600">tune</span>
                        <span>Uji Coba Kode Status Galat:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {[404, 403, 410, 429, 500].map((code) => (
                            <button
                                key={code}
                                onClick={() => setCurrentStatus(code)}
                                className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                                    currentStatus === code
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                type="button"
                            >
                                {code}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Error Canvas Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-12 relative">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        {/* Visual Icon Illustration */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl bg-slate-50 border border-slate-100 min-h-[300px] text-center relative overflow-hidden">
                            <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-indigo-600 text-5xl">
                                    {currentError.icon}
                                </span>
                            </div>

                            <span className="text-6xl sm:text-7xl font-mono font-black text-slate-900 tracking-tight">
                                {currentError.code}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                HTTP Error Code
                            </span>
                        </div>

                        {/* Content & Actions */}
                        <div className="lg:col-span-7 flex flex-col items-start gap-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentError.color}`}>
                                <span className="w-2 h-2 rounded-full bg-current" />
                                {currentError.badge}
                            </span>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                                {currentError.title}
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {currentError.description}
                            </p>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 w-full flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-indigo-600 text-[18px] shrink-0 mt-0.5">info</span>
                                <p>{currentError.hint}</p>
                            </div>

                            <div className="pt-3 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <Link
                                    href={currentError.actionHref}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                    <span>{currentError.actionLabel}</span>
                                </Link>

                                {currentError.secondaryHref && currentError.secondaryLabel && (
                                    <Link
                                        href={currentError.secondaryHref}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                                    >
                                        <span>{currentError.secondaryLabel}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
