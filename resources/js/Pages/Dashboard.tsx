import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { Order, OrderItem, PaginatedData } from '@/types';

interface DashboardProps {
    library: OrderItem[];
    orders: PaginatedData<Order>;
    stats: {
        total_books: number;
        total_orders: number;
        active_downloads: number;
    };
}

function formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function Dashboard({ library, orders, stats }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'orders'>('library');

    return (
        <StoreLayout>
            <Head title="Koleksi E-Book & Akun Saya - Bookil" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Profile & Metric Header */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
                                Portal Pelanggan
                            </span>
                            <h1 className="text-2xl sm:text-4xl font-extrabold mt-1">
                                Koleksi Digital & Riwayat Akun
                            </h1>
                            <p className="text-indigo-200 text-sm mt-1 max-w-xl">
                                Akses seluruh buku digital yang telah Anda miliki, pantau sisa kuota unduhan aman, dan kelola faktur pesanan Anda.
                            </p>
                        </div>

                        {/* Fast Stats */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 flex-shrink-0">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
                                    {stats.total_books}
                                </span>
                                <span className="text-[11px] text-indigo-200 font-medium">Buku Dimiliki</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-emerald-300 block">
                                    {stats.active_downloads}
                                </span>
                                <span className="text-[11px] text-indigo-200 font-medium">Akses Unduh Aktif</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-cyan-300 block">
                                    {stats.total_orders}
                                </span>
                                <span className="text-[11px] text-indigo-200 font-medium">Total Pesanan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="mt-8 flex items-center space-x-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`pb-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'library'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Koleksi E-Book ({library.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center space-x-2 ${
                            activeTab === 'orders'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Riwayat Pesanan ({orders.total})</span>
                    </button>
                </div>

                {/* Tab 1: Library Items */}
                {activeTab === 'library' && (
                    <div className="mt-8">
                        {library.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {library.map((item) => {
                                    const product = item.product;
                                    const token = item.download_token;
                                    const isExpired = token ? new Date(token.expires_at) < new Date() : false;
                                    const isQuotaExceeded = token ? token.download_count >= token.max_downloads : false;
                                    const canDownload = token && !isExpired && !isQuotaExceeded;

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                        >
                                            <div className="flex space-x-4">
                                                {/* Book Thumbnail */}
                                                <div className="w-20 h-28 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-white overflow-hidden shadow">
                                                    {product?.cover_image_path ? (
                                                        <img
                                                            src={`/storage/${product.cover_image_path}`}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-bold uppercase">
                                                            {product?.file_type || 'PDF'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Book Meta */}
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                        {product?.category?.name || 'E-Book'}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
                                                        {product?.title || 'Digital Asset'}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        Penulis: {product?.author || 'Bookil Creator'}
                                                    </p>
                                                    <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-500">
                                                        <span className="uppercase font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                                            {product?.file_type}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatBytes(product?.file_size || 0)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quota & Download Section */}
                                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col space-y-3">
                                                {token ? (
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500">Sisa Kuota:</span>
                                                        <span
                                                            className={`font-semibold px-2 py-0.5 rounded-full ${
                                                                canDownload
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : 'bg-rose-50 text-rose-700'
                                                            }`}
                                                        >
                                                            {token.download_count} / {token.max_downloads} Unduhan Digunakan
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-amber-600">Token unduhan sedang diproses</p>
                                                )}

                                                {canDownload && token ? (
                                                    <a
                                                        href={`/download/${token.token}`}
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        <span>Unduh File Privat</span>
                                                    </a>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="w-full bg-slate-100 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-xs cursor-not-allowed"
                                                    >
                                                        {isQuotaExceeded ? 'Batas Unduhan Tercapai' : 'Token Kedaluwarsa'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Koleksi Digital Masih Kosong</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    Anda belum memiliki e-book atau digital goods berlisensi. Mulai jelajahi karya terbaik di Bookil!
                                </p>
                                <Link
                                    href="/"
                                    className="mt-6 inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                                >
                                    Jelajahi Katalog E-Book
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Order History */}
                {activeTab === 'orders' && (
                    <div className="mt-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        {orders.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-left">No. Pesanan</th>
                                            <th className="px-6 py-4 text-left">Tanggal</th>
                                            <th className="px-6 py-4 text-left">Item</th>
                                            <th className="px-6 py-4 text-left">Total</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {orders.data.map((order) => {
                                            const statusColor =
                                                order.status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : order.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200';

                                            return (
                                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {order.items && order.items.length > 0 ? (
                                                            <span className="font-medium text-slate-800">
                                                                {order.items[0].product?.title || 'E-Book'}
                                                                {order.items.length > 1 && ` (+${order.items.length - 1} lainnya)`}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">1 Item</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-indigo-700">
                                                        {formatRupiah(order.total_amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link
                                                            href={`/orders/${order.order_number}`}
                                                            className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg font-semibold transition-colors"
                                                        >
                                                            Lihat Faktur
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-sm text-slate-500">Belum ada riwayat pesanan.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
