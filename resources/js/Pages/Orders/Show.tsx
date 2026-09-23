import React, { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { Order } from '@/types';

interface OrderShowProps {
    order: Order;
    snapToken: string | null;
    midtransClientKey: string;
    midtransIsProduction: boolean;
}

export default function Show({
    order,
    snapToken,
    midtransClientKey,
    midtransIsProduction,
}: OrderShowProps) {
    // Dynamically inject Midtrans Snap script
    useEffect(() => {
        if (!midtransClientKey) return;

        const snapScriptUrl = midtransIsProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        const scriptId = 'midtrans-snap-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = snapScriptUrl;
            script.setAttribute('data-client-key', midtransClientKey);
            script.async = true;
            document.body.appendChild(script);
        }

        return () => {
            // Keep script cached in DOM
        };
    }, [midtransClientKey, midtransIsProduction]);

    const handlePayNow = () => {
        if (!snapToken) {
            alert('Token transaksi tidak tersedia. Silakan muat ulang halaman.');
            return;
        }

        if (window.snap) {
            window.snap.pay(snapToken, {
                onSuccess: () => {
                    router.reload();
                },
                onPending: () => {
                    router.reload();
                },
                onError: () => {
                    alert('Pembayaran mengalami kendala. Silakan coba kembali.');
                },
                onClose: () => {
                    // Dialog closed by user
                },
            });
        } else {
            alert('Memuat modul pembayaran Midtrans... Silakan coba sesaat lagi.');
        }
    };

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500" />
                        Lunas
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-2 h-2 mr-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Menunggu Pembayaran
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <span className="w-2 h-2 mr-1.5 rounded-full bg-rose-500" />
                        Gagal
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        <span className="w-2 h-2 mr-1.5 rounded-full bg-slate-400" />
                        Kedaluwarsa
                    </span>
                );
        }
    };

    return (
        <StoreLayout>
            <Head title={`Invoice #${order.order_number} - Bookil`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Information */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Nomor Pesanan
                            </span>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                                #{order.order_number}
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <div className="flex sm:flex-col sm:items-end gap-2">
                            {getStatusBadge(order.status)}
                            {order.payment_method && (
                                <span className="text-xs font-medium text-slate-500">
                                    Metode: <strong className="uppercase">{order.payment_method}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Pending Payment Notice & Snap Button */}
                    {order.status === 'pending' && (
                        <div className="mt-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-3 text-amber-800 text-sm">
                                <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <strong className="block font-semibold">Selesaikan Pembayaran Anda</strong>
                                    <span className="text-xs text-amber-700">
                                        Klik tombol bayar untuk membuka gateway pembayaran aman Midtrans.
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayNow}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-200 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span>Bayar Sekarang</span>
                            </button>
                        </div>
                    )}

                    {/* Paid Success Notice */}
                    {order.status === 'paid' && (
                        <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-sm">
                            <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <strong className="block font-semibold">Pembayaran Terverifikasi</strong>
                                <span className="text-xs text-emerald-700">
                                    Aset digital Anda telah aktif. Silakan gunakan link unduhan di bawah ini.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Purchased Items List */}
                    <div className="mt-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                            Daftar Produk
                        </h2>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-16 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                                            {item.product?.file_type || 'PDF'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">
                                                {item.product?.title || 'E-Book Digital'}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Penulis: {item.product?.author || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                                        <span className="text-sm font-bold text-slate-800">
                                            {formatRupiah(item.price)}
                                        </span>

                                        {/* Download button if paid */}
                                        {order.status === 'paid' && item.download_token && (
                                            <a
                                                href={`/downloads/${item.download_token.token}`}
                                                className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download ({item.download_token.max_downloads - item.download_token.download_count} sisa)
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Total Pembayaran:</span>
                        <span className="text-2xl font-extrabold text-indigo-700">
                            {formatRupiah(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Back to Catalog Link */}
                <div className="text-center">
                    <Link href="/" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                        &larr; Kembali ke Katalog Utama
                    </Link>
                </div>
            </div>
        </StoreLayout>
    );
}

