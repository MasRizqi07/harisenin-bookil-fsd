import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { PageProps } from '@/types';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

interface EditProps {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Edit({ mustVerifyEmail, status }: EditProps) {
    const { auth } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');

    return (
        <StoreLayout>
            <Head title="Pengaturan Akun & Keamanan - Bookil" />

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 flex flex-col gap-8">
                {/* Breadcrumbs & Security Pill */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link href={route('products.index')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">home</span>
                            <span>Beranda</span>
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 font-bold">Pengaturan Akun &amp; Keamanan</span>
                    </nav>

                    <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm text-xs text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-medium text-slate-800">Koneksi Aman TLS 1.3 Terverifikasi</span>
                    </div>
                </div>

                {/* Profile Overview Card */}
                <section className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Profile Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative group">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/20">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                        {auth.user.name}
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        Bookil Member
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span className="font-mono text-slate-700">{auth.user.email}</span>
                                    {auth.user.email_verified_at ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                            Email Terverifikasi
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                                            <span className="material-symbols-outlined text-[12px]">warning</span>
                                            Email Belum Diverifikasi
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 uppercase tracking-wider text-[10px]">
                                        Peran: {auth.user.role === 'admin' ? 'Administrator' : 'Customer'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="flex items-center gap-3 self-stretch lg:self-auto">
                            <Link
                                href={route('dashboard')}
                                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                                <span>Buka Perpustakaan Saya</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Tab Navigation System */}
                <div className="flex flex-col gap-6">
                    <div className="overflow-x-auto pb-1">
                        <nav className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-max min-w-full sm:min-w-0" role="tablist">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'profile'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                                role="tab"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-[18px]">badge</span>
                                <span>Informasi Profil</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'security'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                                role="tab"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-[18px]">shield</span>
                                <span>Keamanan &amp; Kata Sandi</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('sessions')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'sessions'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                                role="tab"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-[18px]">devices</span>
                                <span>Sesi &amp; Hapus Akun</span>
                            </button>

                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                <span>Riwayat Transaksi &amp; Faktur</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Tab Contents */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-2xl"
                            />
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
                            <UpdatePasswordForm className="max-w-2xl" />
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            {/* Active Session Info Card */}
                            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[22px]">laptop_mac</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Sesi Browser Saat Ini</h3>
                                        <p className="text-xs text-slate-500">
                                            Perangkat yang sedang Anda gunakan untuk mengakses sesi aktif Bookil.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <div>
                                            <p className="font-bold text-slate-800">Browser Aktif</p>
                                            <p className="text-slate-500 text-[11px]">Terotentikasi via Laravel Session Cookie</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                        Aktif Sekarang
                                    </span>
                                </div>
                            </div>

                            {/* Danger Zone: Account Deletion */}
                            <div className="bg-rose-50/50 rounded-3xl p-6 lg:p-8 border border-rose-200/80 shadow-sm">
                                <DeleteUserForm className="max-w-2xl" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StoreLayout>
    );
}
