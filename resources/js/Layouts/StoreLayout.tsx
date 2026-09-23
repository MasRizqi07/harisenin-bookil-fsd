import React, { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import Dropdown from '@/Components/Dropdown';

interface StoreLayoutProps {
    title?: string;
}

export default function StoreLayout({ children }: PropsWithChildren<StoreLayoutProps>) {
    const { auth, flash } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
            {/* Header Navigation */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-violet-800 bg-clip-text text-transparent">
                                    Bookil
                                </span>
                            </Link>

                            <nav className="hidden md:flex space-x-6 text-sm font-medium">
                                <Link
                                    href="/"
                                    className="text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Katalog Buku
                                </Link>
                            </nav>
                        </div>

                        {/* Right Auth / User Area */}
                        <div className="hidden sm:flex items-center space-x-4">
                            {auth.user ? (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-slate-200 text-sm leading-4 font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            <span className="mr-2 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </span>
                                            {auth.user.name}
                                            <svg
                                                className="ms-2 -me-0.5 h-4 w-4 text-slate-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                                            Signed in as <strong className="text-slate-700">{auth.user.email}</strong>
                                        </div>
                                        <Dropdown.Link href="/dashboard">Dashboard</Dropdown.Link>
                                        <Dropdown.Link href="/profile">Profile</Dropdown.Link>
                                        <Dropdown.Link href="/logout" method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            ) : (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Link
                                        href="/login"
                                        className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
                        <Link href="/" className="block py-2 text-slate-700 font-medium">
                            Katalog Buku
                        </Link>
                        {auth.user ? (
                            <>
                                <Link href="/dashboard" className="block py-2 text-slate-700">
                                    Dashboard
                                </Link>
                                <Link href="/profile" className="block py-2 text-slate-700">
                                    Profile
                                </Link>
                                <Link href="/logout" method="post" as="button" className="block w-full text-left py-2 text-red-600">
                                    Log Out
                                </Link>
                            </>
                        ) : (
                            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
                                <Link href="/login" className="block text-center py-2 border border-slate-200 rounded-lg text-slate-700">
                                    Masuk
                                </Link>
                                <Link href="/register" className="block text-center py-2 bg-indigo-600 text-white rounded-lg font-medium">
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-emerald-50 border-b border-emerald-200 py-3 px-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between text-emerald-800 text-sm">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="bg-rose-50 border-b border-rose-200 py-3 px-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between text-rose-800 text-sm">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} Bookil - Platform E-Book & Digital Goods Berkualitas.</p>
                    <p className="mt-1 text-slate-400">Pengiriman instan, aman, dan berlisensi resmi.</p>
                </div>
            </footer>
        </div>
    );
}

