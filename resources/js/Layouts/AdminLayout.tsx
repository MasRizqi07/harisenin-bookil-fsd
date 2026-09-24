import React, { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import ApplicationLogo from '@/Components/ApplicationLogo';
import CommandPalette from '@/Components/CommandPalette';

interface AdminLayoutProps {
    title?: string;
}

export default function AdminLayout({ title, children }: PropsWithChildren<AdminLayoutProps>) {
    const { auth, flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const navLinks = [
        {
            name: 'Executive Dashboard',
            href: '/admin/dashboard',
            icon: 'space_dashboard',
        },
        {
            name: 'Katalog & Produk',
            href: '/admin/products',
            icon: 'auto_stories',
        },
        {
            name: 'Taksonomi Kategori',
            href: '/admin/categories',
            icon: 'account_tree',
        },
        {
            name: 'Ledger Pesanan',
            href: '/admin/orders',
            icon: 'receipt_long',
        },
    ];

    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
            {/* Command Palette */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col">
                    {/* Brand header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
                        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                            <ApplicationLogo className="h-7 w-auto" />
                            <div>
                                <span className="font-extrabold text-sm tracking-tight text-white block">
                                    Bookil Admin
                                </span>
                                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">
                                    Enterprise Console
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="p-4 space-y-1">
                        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Enterprise Portal
                        </span>
                        {navLinks.map((link) => {
                            const isActive = currentUrl.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-4 mt-4 border-t border-slate-800/80">
                            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Pintasan Toko
                            </span>
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-all mt-1"
                            >
                                <span className="material-symbols-outlined text-[20px] text-indigo-400">storefront</span>
                                <span>Lihat Toko Publik</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Health Metrics & Footer User */}
                <div>
                    <div className="p-3.5 m-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Health Metrics</span>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                        </div>
                        <div className="space-y-1 text-[11px] text-slate-400">
                            <div className="flex items-center justify-between">
                                <span>Database Cluster</span>
                                <span className="font-semibold text-emerald-400">99.98%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Midtrans Webhook</span>
                                <span className="font-semibold text-emerald-400">SHA-512 OK</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Private S3 Vault</span>
                                <span className="font-semibold text-emerald-400">Synced</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950/80">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 truncate">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400">
                                    {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="truncate">
                                    <span className="font-bold text-xs text-white block truncate">
                                        {auth?.user?.name || 'Administrator'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">
                                        {auth?.user?.email || 'admin@bookil.com'}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                                title="Keluar dari Admin Console"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Command Bar */}
                <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-400 hover:text-white p-2"
                        >
                            <span className="material-symbols-outlined text-[22px]">menu</span>
                        </button>
                        <h1 className="text-sm font-bold text-slate-200 hidden sm:block">
                            {title || 'Enterprise Console'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Quick Search */}
                        <button
                            onClick={() => setCommandPaletteOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[16px]">search</span>
                            <span className="hidden md:inline">Cari cepat...</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">⌘K</kbd>
                        </button>

                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Production Live</span>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="m-4 sm:m-6 lg:m-8 mb-0 p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                            <span className="font-semibold">{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="m-4 sm:m-6 lg:m-8 mb-0 p-4 bg-rose-950/60 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-300">
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
                            <span className="font-semibold">{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
