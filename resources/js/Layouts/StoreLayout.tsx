import React, { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Dropdown from '@/Components/Dropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';
import CommandPalette from '@/Components/CommandPalette';

interface StoreLayoutProps {
    title?: string;
}

export default function StoreLayout({ children }: PropsWithChildren<StoreLayoutProps>) {
    const { auth, flash } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [toastDismissed, setToastDismissed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
            {/* Global Command Palette */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />

            {/* Header Navigation */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center gap-4">
                        {/* Left: Logo & Nav Links */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group focus:outline-none">
                                <ApplicationLogo className="h-9 w-auto transform group-hover:scale-105 transition-transform" />
                            </Link>

                            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
                                <Link
                                    href={route('products.index')}
                                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Jelajahi Katalog
                                </Link>
                                <a
                                    href="/#katalog"
                                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Koleksi Unggulan
                                </a>
                                <Link
                                    href="/faq"
                                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Bantuan &amp; FAQ
                                </Link>
                                {auth.user && (
                                    <Link
                                        href={route('customer.library')}
                                        className="text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">local_library</span>
                                        <span>Perpustakaan Saya</span>
                                    </Link>
                                )}
                                {auth.user?.role === 'admin' && (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className="text-violet-700 hover:text-violet-900 font-bold transition-colors flex items-center gap-1.5 bg-violet-50 px-3 py-1 rounded-lg border border-violet-200"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                        <span>Admin Portal</span>
                                    </Link>
                                )}
                            </nav>
                        </div>

                        {/* Middle/Right: Search Spotlight Trigger & Auth Area */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Command Palette Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setCommandPaletteOpen(true)}
                                className="hidden sm:flex items-center justify-between gap-3 w-56 md:w-64 h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                                    <span>Cari e-book, topik...</span>
                                </span>
                                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-500 text-[10px] font-bold border border-slate-200 uppercase">
                                    ⌘K
                                </kbd>
                            </button>

                            {/* Mobile search icon button */}
                            <button
                                type="button"
                                onClick={() => setCommandPaletteOpen(true)}
                                className="sm:hidden p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 focus:outline-none"
                                aria-label="Cari"
                            >
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </button>

                            {/* User Authentication Options */}
                            {auth.user ? (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('customer.library')}
                                        className="relative hidden md:inline-flex items-center gap-1.5 px-3.5 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                                        <span>Rak Buku</span>
                                    </Link>

                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                                    {auth.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="hidden sm:inline max-w-[120px] truncate">
                                                    {auth.user.name}
                                                </span>
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                                    arrow_drop_down
                                                </span>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content width="56">
                                            <div className="px-4 py-3 border-b border-slate-100 text-xs">
                                                <p className="font-bold text-slate-900 truncate">{auth.user.name}</p>
                                                <p className="text-slate-500 truncate">{auth.user.email}</p>
                                                {auth.user.role === 'admin' && (
                                                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-50 text-violet-700 border border-violet-200">
                                                        Administrator
                                                    </span>
                                                )}
                                            </div>

                                            <Dropdown.Link href={route('dashboard')}>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="material-symbols-outlined text-[16px]">local_library</span>
                                                    <span>Perpustakaan Saya</span>
                                                </div>
                                            </Dropdown.Link>

                                            <Dropdown.Link href={route('profile.edit')}>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="material-symbols-outlined text-[16px]">person</span>
                                                    <span>Pengaturan Profil</span>
                                                </div>
                                            </Dropdown.Link>

                                            {auth.user.role === 'admin' && (
                                                <Dropdown.Link href={route('admin.dashboard')}>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
                                                        <span className="material-symbols-outlined text-[16px]">dashboard</span>
                                                        <span>Admin Executive Portal</span>
                                                    </div>
                                                </Dropdown.Link>
                                            )}

                                            <div className="border-t border-slate-100">
                                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                                    <div className="flex items-center gap-2 text-xs text-rose-600">
                                                        <span className="material-symbols-outlined text-[16px]">logout</span>
                                                        <span>Keluar</span>
                                                    </div>
                                                </Dropdown.Link>
                                            </div>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Link
                                        href={route('login')}
                                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                                    >
                                        Daftar Gratis
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[24px]">
                                    {mobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer Navigation */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
                        <Link
                            href={route('products.index')}
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            Jelajahi Katalog
                        </Link>
                        <a
                            href="/#katalog"
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            Koleksi Unggulan
                        </a>
                        <Link
                            href="/faq"
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            Bantuan &amp; FAQ
                        </Link>
                        {auth.user && (
                            <Link
                                href={route('customer.library')}
                                className="block px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50"
                            >
                                Perpustakaan Saya
                            </Link>
                        )}
                        {auth.user?.role === 'admin' && (
                            <Link
                                href={route('admin.dashboard')}
                                className="block px-3 py-2 rounded-lg text-sm font-bold text-violet-700 bg-violet-50"
                            >
                                Admin Executive Portal
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* Flash Messages (Toasts) */}
            {flash?.success && !toastDismissed && (
                <div className="bg-emerald-600 text-white px-4 py-3 shadow-md relative z-30">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span>{flash.success}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToastDismissed(true)}
                            className="p-1 rounded hover:bg-emerald-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>
            )}

            {flash?.error && !toastDismissed && (
                <div className="bg-rose-600 text-white px-4 py-3 shadow-md relative z-30">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            <span>{flash.error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToastDismissed(true)}
                            className="p-1 rounded hover:bg-rose-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Modern Editorial Footer */}
            <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                        {/* Brand Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <ApplicationLogo className="h-8 w-auto" />
                            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                                Platform perdagangan e-book arsitektur software, teknologi modern, dan strategi bisnis. 
                                Format PDF &amp; EPUB orisinal, 100% bebas DRM mengikat, dan unduhan instan berkeamanan tinggi.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
                                <span className="flex items-center gap-1 text-emerald-600">
                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                    Pembayaran Resmi Midtrans
                                </span>
                                <span>•</span>
                                <span>Zero-Trust Storage</span>
                            </div>
                        </div>

                        {/* Navigation Links Column */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Katalog E-Book</h3>
                            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                                <li>
                                    <Link href={route('products.index')} className="hover:text-indigo-600 transition-colors">
                                        Semua Koleksi
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('products.index', { category: 'programming-tech' })} className="hover:text-indigo-600 transition-colors">
                                        Pemrograman &amp; IT
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('products.index', { category: 'business-startup' })} className="hover:text-indigo-600 transition-colors">
                                        Bisnis &amp; Startup
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('products.index', { category: 'self-development' })} className="hover:text-indigo-600 transition-colors">
                                        Pengembangan Diri
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Customer Portal Links */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Layanan Pelanggan</h3>
                            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                                <li>
                                    <Link href={route('customer.library')} className="hover:text-indigo-600 transition-colors">
                                        Perpustakaan Saya
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="hover:text-indigo-600 transition-colors">
                                        Pusat Bantuan &amp; FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('profile.edit')} className="hover:text-indigo-600 transition-colors">
                                        Pengaturan Akun
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal & Policy Links */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Kepatuhan &amp; Legal</h3>
                            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                                <li>
                                    <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                                        Syarat &amp; Ketentuan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                                        Kebijakan Privasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/refund-policy" className="hover:text-indigo-600 transition-colors">
                                        Kebijakan Pengembalian Dana
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>© {new Date().getFullYear()} Bookil. Dilindungi Hak Cipta Undang-Undang. Hak cipta penulis dilindungi.</p>
                        <p className="flex items-center gap-1">
                            <span>Dibangun dengan</span>
                            <span className="text-indigo-600 font-bold">Laravel 13 &amp; React 19</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
