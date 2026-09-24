import React, { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface AuthLayoutProps {
    title?: string;
    subtitle?: string;
}

export default function AuthLayout({
    title,
    subtitle,
    children,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 antialiased font-sans">
            {/* LEFT SHOWCASE PANEL (45% on desktop) */}
            <div className="relative w-full lg:w-[45%] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-8 lg:p-14 overflow-hidden shadow-2xl">
                {/* Ambient Glows */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />

                {/* Panel Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ApplicationLogo lightText className="h-8 w-auto" />
                    </Link>
                    <Link
                        href="/"
                        className="group flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">
                            arrow_back
                        </span>
                        <span>Katalog Publik</span>
                    </Link>
                </div>

                {/* Panel Center: Value Proposition & Social Proof */}
                <div className="relative z-10 my-10 lg:my-0 flex flex-col gap-6 max-w-lg">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-300 border border-white/10">
                            <span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span>
                            <span>Arsitektur Zero-DRM &amp; Lisensi Seumur Hidup</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Satu Akun untuk Seluruh Aset Pengetahuan Digital Anda.
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Akses instan berkas privat zero-DRM, pembaruan edisi buku seumur hidup, dan presigned download URL berkecepatan tinggi tanpa friksi.
                        </p>
                    </div>

                    {/* Translucent Customer Testimonial Card */}
                    <div className="backdrop-blur-md bg-white/10 rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex text-amber-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-[16px] fill-current">
                                        star
                                    </span>
                                ))}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-300">Pembaca Terverifikasi</span>
                        </div>
                        <blockquote className="text-xs text-slate-200 italic leading-relaxed">
                            “Bookil mengubah cara tim engineering kami mengakses literatur teknis mendalam tanpa repot DRM kaku. Ekosistem pembelian langsung dan unduhan presigned-nya luar biasa andal.”
                        </blockquote>
                        <div className="flex items-center gap-3 pt-1">
                            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
                                HW
                            </div>
                            <div className="min-w-0 text-left">
                                <h4 className="text-xs font-bold text-white truncate">Hendra Wijaya</h4>
                                <p className="text-[11px] text-slate-400 truncate">Principal Software Architect</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Footer: Trust Indicators */}
                <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">lock</span>
                        <span>256-Bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 text-[11px] text-slate-300 font-semibold">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                        <span>Midtrans Verified Gateway</span>
                    </div>
                </div>
            </div>

            {/* RIGHT FORM CONTAINER (55% on desktop) */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
                <div className="w-full max-w-md space-y-6">
                    {/* Header Titles */}
                    {title && (
                        <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
                            {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
