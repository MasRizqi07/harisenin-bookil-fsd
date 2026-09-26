import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatRupiah, formatFileSize } from '@/Components/ProductCard';
import BookCoverImage from '@/Components/BookCoverImage';
import StatusBadge from '@/Components/StatusBadge';
import QuotaProgressBar from '@/Components/QuotaProgressBar';
import { Order, OrderItem, PageProps, PaginatedData } from '@/types';

interface DashboardProps {
    library: OrderItem[];
    orders: PaginatedData<Order>;
    stats: {
        total_books: number;
        total_orders: number;
        active_downloads: number;
    };
}

export default function Dashboard({ library, orders, stats }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<'library' | 'orders'>('library');
    const [downloadingToken, setDownloadingToken] = useState<string | null>(null);

    return (
        <StoreLayout>
            <Head title="Perpustakaan Digital Saya — Bookil" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
                {/* Hero Header & Welcome Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                Akun Terverifikasi
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                                Bookil Member
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Halo, {auth.user.name}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Akses seumur hidup koleksi buku digital teknis Anda, pantau kuota unduhan berlisensi, 
                            dan kelola faktur pesanan Anda dalam satu konsol aman.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href={route('products.index')}
                            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                            <span>Tambah Koleksi</span>
                        </Link>
                    </div>
                </div>

                {/* 3 Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Stat 1: Total Books */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                Total Buku Dimiliki
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                    {stats.total_books}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Judul E-Book</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[26px]">auto_stories</span>
                        </div>
                    </div>

                    {/* Stat 2: Active Download Quota */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                Unduhan Aktif
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                                    {stats.active_downloads}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Buku Siap Unduh</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[26px]">download_for_offline</span>
                        </div>
                    </div>

                    {/* Stat 3: Total Orders */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                                Riwayat Pesanan
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                    {stats.total_orders}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Transaksi</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[26px]">receipt_long</span>
                        </div>
                    </div>
                </div>

                {/* Tabs Ribbon (Library vs Transactions) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'library'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[17px]">local_library</span>
                        <span>Rak Buku Digital ({library.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'orders'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[17px]">history</span>
                        <span>Riwayat Transaksi ({orders.total})</span>
                    </button>
                </div>

                {/* Tab Content: Digital Library */}
                {activeTab === 'library' && (
                    <div className="space-y-6">
                        {library.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {library.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex gap-4">
                                            {/* Mini Book Cover */}
                                            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 shadow-md">
                                                <BookCoverImage
                                                    coverPath={item.product?.cover_image_path}
                                                    title={item.product?.title}
                                                    fileType={item.product?.file_type}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                                                    {item.product?.file_type} {item.product?.file_size ? `• ${formatFileSize(item.product.file_size)}` : ''}
                                                </span>
                                                <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-2">
                                                    {item.product?.title || 'E-Book Digital'}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                    {item.product?.author}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quota Progress */}
                                        {item.download_token && (
                                            <QuotaProgressBar
                                                downloadCount={item.download_token.download_count}
                                                maxDownloads={item.download_token.max_downloads}
                                                expiresAt={item.download_token.expires_at}
                                            />
                                        )}

                                        {/* Action Button */}
                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                            {item.order && (
                                                <Link
                                                    href={route('orders.show', item.order.order_number)}
                                                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                                                >
                                                    Lihat Faktur
                                                </Link>
                                            )}

                                            {item.download_url && (
                                                <a
                                                    href={item.download_url}
                                                    onClick={() => setDownloadingToken(String(item.id))}
                                                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                                                >
                                                    {downloadingToken === String(item.id) ? (
                                                        <>
                                                            <span className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" />
                                                            <span>Mengunduh...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                                            <span>Unduh File</span>
                                                        </>
                                                    )}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl">local_library</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Perpustakaan Anda Masih Kosong</h3>
                                <p className="text-xs text-slate-500 mt-2">
                                    Anda belum memiliki e-book yang lunas. Jelajahi katalog dan dapatkan buku pilihan Anda sekarang.
                                </p>
                                <Link
                                    href={route('products.index')}
                                    className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                                >
                                    Jelajahi Katalog E-Book
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Transaction History */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3.5 px-4">Nomor Pesanan</th>
                                        <th className="py-3.5 px-4">Tanggal</th>
                                        <th className="py-3.5 px-4">Total</th>
                                        <th className="py-3.5 px-4">Metode</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                {order.order_number}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {formatRupiah(order.total_amount)}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 uppercase">
                                                {order.payment_method || 'Midtrans Snap'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={order.status} size="sm" />
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={route('orders.show', order.order_number)}
                                                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    <span>Faktur</span>
                                                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {orders.links && orders.links.length > 3 && (
                            <div className="p-4 border-t border-slate-100 flex justify-center gap-1.5">
                                {orders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'text-slate-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
