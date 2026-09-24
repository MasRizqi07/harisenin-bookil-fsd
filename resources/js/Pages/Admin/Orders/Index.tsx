import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { Order, PaginatedData } from '@/types';

interface IndexProps {
    orders: PaginatedData<Order>;
    filters: {
        status: string;
        search: string;
    };
    statuses: string[];
}

export default function Index({ orders, filters, statuses }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/orders',
            {
                search: search || undefined,
                status: selectedStatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleStatusTab = (st: string) => {
        setSelectedStatus(st);
        router.get(
            '/admin/orders',
            {
                search: search || undefined,
                status: st || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AdminLayout title="Pesanan & Mutasi Pembayaran">
            <Head title="Kelola Pesanan - Bookil Admin" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Buku Besar Transaksi & Pesanan
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Audit seluruh mutasi transaksi, status payment gateway Midtrans, dan pemenuhan aset digital.
                    </p>
                </div>

                <a
                    href="/admin/export/csv"
                    className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-colors self-start sm:self-auto"
                >
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Ekspor CSV</span>
                </a>
            </div>

            {/* Status Tabs Bar */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => handleStatusTab('')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        !selectedStatus
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    Semua Status
                </button>
                {statuses.map((st) => (
                    <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusTab(st)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                            selectedStatus === st
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        {st}
                    </button>
                ))}
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleFilter} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 flex gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan nomor pesanan (BK-...), nama pelanggan, atau email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                    />
                    <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                    Cari
                </button>
            </form>

            {/* Orders Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                {orders.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-850 text-xs">
                            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-left">
                                <tr>
                                    <th className="px-6 py-4">Nomor Pesanan</th>
                                    <th className="px-6 py-4">Tanggal Transaksi</th>
                                    <th className="px-6 py-4">Pelanggan</th>
                                    <th className="px-6 py-4">Item Buku</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Metode</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-slate-300">
                                {orders.data.map((order) => {
                                    const statusBadge =
                                        order.status === 'paid'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : order.status === 'pending'
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-white">
                                                {order.order_number}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-white block">
                                                    {order.user?.name || 'Pelanggan Terhapus'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    {order.user?.email || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate">
                                                {order.items && order.items.length > 0 ? (
                                                    <span>
                                                        {order.items[0].product?.title || 'E-Book'}
                                                        {order.items.length > 1 && (
                                                            <strong className="text-violet-400 ml-1">
                                                                (+{order.items.length - 1})
                                                            </strong>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-400">
                                                {formatRupiah(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 uppercase font-semibold text-slate-400">
                                                {order.payment_method || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-violet-400 hover:text-white rounded-lg font-bold transition-colors"
                                                >
                                                    Audit
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
                        <p className="text-sm text-slate-400">Tidak ada transaksi yang cocok.</p>
                    </div>
                )}

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="px-6 py-4 bg-slate-900 border-t border-slate-850 flex justify-center items-center space-x-1">
                        {orders.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-violet-600 text-white'
                                        : link.url
                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        : 'text-slate-600 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
