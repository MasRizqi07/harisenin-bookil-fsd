import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { Order, Product } from '@/types';

interface TopProduct extends Product {
    sales_count: number;
}

interface DashboardProps {
    metrics: {
        gross_revenue: string;
        total_orders: number;
        paid_orders_count: number;
        active_products_count: number;
        customers_count: number;
    };
    recentTransactions: Order[];
    topProducts: TopProduct[];
}

export default function Dashboard({ metrics, recentTransactions, topProducts }: DashboardProps) {
    const conversionRate =
        metrics.total_orders > 0
            ? ((metrics.paid_orders_count / metrics.total_orders) * 100).toFixed(1)
            : '0.0';

    return (
        <AdminLayout title="Ringkasan Eksekutif & Penjualan">
            <Head title="Admin Dashboard - Bookil" />

            {/* Header with Export Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Analisis Penjualan & Performa Platform
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Ikhtisar metrik pendapatan kotor, konversi pembayaran, katalog aktif, dan transaksi terbaru.
                    </p>
                </div>

                <a
                    href="/admin/export/csv"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Ekspor Data Transaksi (CSV)</span>
                </a>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Gross Revenue */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Pendapatan Bersih
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-white">
                            {formatRupiah(metrics.gross_revenue)}
                        </span>
                        <span className="block text-[11px] text-emerald-400 mt-1 font-medium">
                            Dari {metrics.paid_orders_count} pesanan lunas
                        </span>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Rasio Sukses Bayar
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-white">
                            {conversionRate}%
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-1">
                            {metrics.total_orders} total pesanan dibuat
                        </span>
                    </div>
                </div>

                {/* Active Products */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Katalog Buku Aktif
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-white">
                            {metrics.active_products_count}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-1">
                            E-Book siap dibeli secara publik
                        </span>
                    </div>
                </div>

                {/* Registered Customers */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total Pelanggan
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-black text-white">
                            {metrics.customers_count}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-1">
                            Akun pembeli terdaftar
                        </span>
                    </div>
                </div>
            </div>

            {/* Content 2-Column: Recent Transactions & Top Selling Books */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions (2 cols) */}
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-bold text-white">Transaksi Terbaru</h3>
                            <p className="text-xs text-slate-400">10 pesanan mutasi sistem terakhir</p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="text-xs font-semibold text-violet-400 hover:text-violet-300"
                        >
                            Lihat Semua &rarr;
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-850 text-xs">
                            <thead>
                                <tr className="text-slate-400 font-semibold text-left">
                                    <th className="pb-3">Pesanan</th>
                                    <th className="pb-3">Pelanggan</th>
                                    <th className="pb-3">Nominal</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-slate-300">
                                {recentTransactions.map((order) => {
                                    const statusBadge =
                                        order.status === 'paid'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : order.status === 'pending'
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                                            <td className="py-3 font-mono font-bold text-white">
                                                {order.order_number}
                                            </td>
                                            <td className="py-3">
                                                <span className="font-semibold text-white block">
                                                    {order.user?.name || 'Pelanggan'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    {order.user?.email || '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 font-bold text-emerald-400">
                                                {formatRupiah(order.total_amount)}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="text-violet-400 hover:text-white font-semibold"
                                                >
                                                    Periksa
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Products (1 col) */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-bold text-white">Buku Terlaris</h3>
                                <p className="text-xs text-slate-400">Volume penjualan tertinggi</p>
                            </div>
                            <Link
                                href="/admin/products"
                                className="text-xs font-semibold text-violet-400 hover:text-violet-300"
                            >
                                Kelola
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {topProducts.map((book, index) => (
                                <div
                                    key={book.id}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-850"
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <span className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-white truncate">
                                                {book.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {book.author}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-3">
                                        <span className="text-xs font-bold text-emerald-400 block">
                                            {book.sales_count} terjual
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {formatRupiah(book.price)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-850 text-center">
                        <Link
                            href="/admin/products/create"
                            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition-colors space-x-1"
                        >
                            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Tambah E-Book Baru</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
