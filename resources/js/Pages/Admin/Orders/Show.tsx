import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { Order, Payment } from '@/types';

interface OrderDetail extends Order {
    payments?: (Payment & { raw_response?: any })[];
}

interface ShowProps {
    order: OrderDetail;
}

export default function Show({ order }: ShowProps) {
    const [expandedPaymentId, setExpandedPaymentId] = useState<number | null>(null);

    const statusBadge =
        order.status === 'paid'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : order.status === 'pending'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

    return (
        <AdminLayout title={`Audit Pesanan: ${order.order_number}`}>
            <Head title={`Audit Pesanan ${order.order_number} - Bookil Admin`} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href="/admin/orders"
                        className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1 mb-3"
                    >
                        <span>&larr; Kembali ke Daftar Pesanan</span>
                    </Link>

                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h2 className="text-xl sm:text-2xl font-mono font-black text-white">
                                    {order.order_number}
                                </h2>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadge}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Dibuat pada{' '}
                                {new Date(order.created_at).toLocaleString('id-ID', {
                                    dateStyle: 'full',
                                    timeStyle: 'medium',
                                })}
                            </p>
                        </div>

                        <div className="text-left md:text-right">
                            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                                Total Tagihan
                            </span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2-Column: Customer & Payment Method Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Data */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Informasi Pelanggan</span>
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-850">
                                <span className="text-slate-400">Nama Pelanggan</span>
                                <span className="font-bold text-white">{order.user?.name || 'User Terhapus'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-850">
                                <span className="text-slate-400">Alamat Email</span>
                                <span className="font-bold text-white">{order.user?.email || '-'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-850">
                                <span className="text-slate-400">ID Pengguna</span>
                                <span className="font-mono text-slate-300">#{order.user_id}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400">Catatan Pesanan</span>
                                <span className="text-slate-300 italic">{order.notes || 'Tidak ada catatan'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Status Gateway & Pembayaran</span>
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-850">
                                <span className="text-slate-400">Metode Pembayaran</span>
                                <span className="font-bold uppercase text-white">{order.payment_method || 'Midtrans Snap'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-850">
                                <span className="text-slate-400">Status Rekonsiliasi</span>
                                <span className="font-bold text-emerald-400">
                                    {order.status === 'paid' ? 'Settled & Verified' : 'Awaiting Settlement'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-850">
                                <span className="text-slate-400">Terakhir Diperbarui</span>
                                <span className="text-slate-300">
                                    {new Date(order.updated_at).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400">Log Gateway</span>
                                <span className="text-violet-400 font-semibold">{order.payments?.length || 0} event tercatat</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchased Items & Download Token Status */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8">
                    <h3 className="text-base font-bold text-white mb-1">
                        Item Pesanan & Kuota Unduhan Digital
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">
                        Detail hak akses aset digital dan pemantauan token privat untuk item ini.
                    </p>

                    <div className="divide-y divide-slate-850">
                        {order.items?.map((item) => {
                            const product = item.product;
                            const token = item.download_token;

                            return (
                                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-16 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-xs uppercase text-violet-400 flex-shrink-0">
                                            {product?.file_type || 'PDF'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">
                                                {product?.title || 'E-Book Digital'}
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                Penulis: {product?.author || '-'} &bull; Kategori: {product?.category?.name || 'Umum'}
                                            </p>
                                            <span className="text-xs font-bold text-emerald-400 mt-1 block">
                                                {formatRupiah(item.price)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Download Token Status */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs sm:w-80">
                                        {token ? (
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Token Hash:</span>
                                                    <span className="font-mono text-slate-300 truncate max-w-[150px]">
                                                        {token.token.substring(0, 16)}...
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Penggunaan Kuota:</span>
                                                    <span className="font-bold text-violet-400">
                                                        {token.download_count} / {token.max_downloads} kali
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Kedaluwarsa:</span>
                                                    <span className="text-slate-300">
                                                        {new Date(token.expires_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 italic">Token unduhan belum digenerate (menunggu lunas)</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Gateway Webhook Payload Auditor */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8">
                    <h3 className="text-base font-bold text-white mb-1">
                        Audit Notifikasi Webhook Gateway (Midtrans)
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">
                        Payload mentah yang diterima dari endpoint pembayaran untuk keperluan kepatuhan finansial & rekonsiliasi.
                    </p>

                    {order.payments && order.payments.length > 0 ? (
                        <div className="space-y-4">
                            {order.payments.map((p) => {
                                const isExpanded = expandedPaymentId === p.id;
                                return (
                                    <div key={p.id} className="border border-slate-850 rounded-2xl bg-slate-900/60 overflow-hidden">
                                        <div
                                            onClick={() => setExpandedPaymentId(isExpanded ? null : p.id)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3 text-xs">
                                                <span className="font-mono font-bold text-white">
                                                    ID: {p.external_transaction_id || 'LOCAL-SIM'}
                                                </span>
                                                <span className="text-slate-400">&bull;</span>
                                                <span className="uppercase text-slate-300">{p.payment_type || 'snap'}</span>
                                                <span className="text-slate-400">&bull;</span>
                                                <span className="font-bold text-emerald-400">
                                                    {formatRupiah(p.gross_amount)}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {p.transaction_status}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {isExpanded ? '▲ Tutup' : '▼ Lihat Payload'}
                                                </span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 bg-slate-950 border-t border-slate-850 text-xs">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Raw Gateway Response Payload
                                                </p>
                                                <pre className="p-3 rounded-xl bg-slate-900 text-violet-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                                                    {JSON.stringify(p.raw_response, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 italic">Belum ada rekaman callback pembayaran yang masuk untuk pesanan ini.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
