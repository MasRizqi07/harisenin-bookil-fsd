import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatRupiah } from '@/Components/ProductCard';
import BookCoverImage from '@/Components/BookCoverImage';
import StatusBadge from '@/Components/StatusBadge';
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
    const [copied, setCopied] = useState(false);
    const [downloadingToken, setDownloadingToken] = useState<string | null>(null);

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
                    // Closed popup
                },
            });
        } else {
            const confirmSimulate = confirm(
                'Modul Midtrans Snap belum aktif atau berjalan dalam mode Sandbox lokal. Ingin mensimulasikan pembayaran lunas (settlement) sekarang untuk menguji unduhan lisensi buku?'
            );
            if (confirmSimulate) {
                router.post(route('dev.orders.simulate-paid', order.order_number));
            }
        }
    };

    const copyOrderCode = () => {
        navigator.clipboard.writeText(order.order_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isPaid = order.status === 'paid';
    const isPending = order.status === 'pending';

    return (
        <StoreLayout>
            <Head title={`Faktur #${order.order_number} — Bookil`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
                {/* Breadcrumbs & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Link href="/" className="hover:text-indigo-600 transition-colors">
                                Beranda
                            </Link>
                            <span>/</span>
                            <Link href={route('dashboard')} className="hover:text-indigo-600 transition-colors">
                                Riwayat Pesanan
                            </Link>
                            <span>/</span>
                            <span className="text-slate-800 font-semibold">{order.order_number}</span>
                        </nav>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Faktur Pesanan Resmi
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            <span>Cetak Salinan</span>
                        </button>
                    </div>
                </div>

                {/* Master Invoice Receipt Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col">
                    {/* Top Security Gradient Stripe */}
                    <div className="h-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500" />

                    {/* Receipt Head */}
                    <div className="p-6 sm:p-8 border-b border-slate-100 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                    Nomor Transaksi
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                                        {order.order_number}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyOrderCode}
                                        title="Salin Nomor Pesanan"
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    </button>
                                    {copied && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            Tersalin!
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">
                                    Dibuat pada {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                                </p>
                            </div>

                            <div className="sm:text-right">
                                <StatusBadge status={order.status} size="md" />
                            </div>
                        </div>

                        {/* Paid Celebration Banner */}
                        {isPaid && (
                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                        <span className="material-symbols-outlined text-[24px]">verified</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-emerald-900">Pembayaran Terkonfirmasi Lunas</h3>
                                        <p className="text-xs text-emerald-700">
                                            Aset digital telah disinkronkan ke perpustakaan Anda dan siap diunduh kapan saja.
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={route('customer.library')}
                                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                                >
                                    <span>Buka di Perpustakaan</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            </div>
                        )}

                        {/* Pending Payment Action Banner */}
                        {isPending && snapToken && (
                            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                                        <span className="material-symbols-outlined text-[24px]">payments</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-900">Selesaikan Pembayaran Anda</h3>
                                        <p className="text-xs text-indigo-700">
                                            Pilih Virtual Account (BCA, Mandiri, BRI) atau QRIS / GoPay melalui jendela Midtrans Snap.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={handlePayNow}
                                        className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
                                    >
                                        <span>Bayar Sekarang (Snap)</span>
                                        <span className="material-symbols-outlined text-[18px]">flash_on</span>
                                    </button>

                                    {!midtransIsProduction && (
                                        <button
                                            type="button"
                                            onClick={() => router.post(route('dev.orders.simulate-paid', order.order_number))}
                                            className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                                            title="Simulasikan notifikasi webhook settlement berhasil dari Midtrans"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            <span>Simulasi Lunas (Dev)</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Purchased Items Table */}
                    <div className="p-6 sm:p-8 space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Rincian Pembelian
                        </h3>

                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item) => (
                                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow">
                                            <BookCoverImage
                                                coverPath={item.product?.cover_image_path}
                                                title={item.product?.title}
                                                fileType={item.product?.file_type}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-slate-900 truncate">
                                                {item.product?.title || 'E-Book Digital'}
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                Penulis: {item.product?.author || '-'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                                                    {item.product?.file_type}
                                                </span>
                                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                                    Lisensi Penuh
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className="text-base font-extrabold text-slate-900 block">
                                            {formatRupiah(item.price)}
                                        </span>

                                        {isPaid && item.download_token && (
                                            <a
                                                href={route('downloads.process', item.download_token.token)}
                                                onClick={() => setDownloadingToken(item.download_token?.token || '')}
                                                className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                                            >
                                                {downloadingToken === item.download_token.token ? (
                                                    <>
                                                        <span className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-emerald-600 border-t-transparent" />
                                                        <span>Menyiapkan...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[15px]">download</span>
                                                        <span>Unduh ({item.download_token.max_downloads - item.download_token.download_count}x sisa)</span>
                                                    </>
                                                )}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Breakdown & Totals */}
                    <div className="p-6 sm:p-8 bg-slate-50/80 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>Subtotal Pembelian</span>
                            <span className="font-semibold text-slate-900">{formatRupiah(order.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>Biaya Gateway (Midtrans Snap)</span>
                            <span className="font-semibold text-emerald-600">Rp 0 (Gratis)</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>PPN Digital Indonesia (11%)</span>
                            <span className="font-semibold text-slate-500">Termasuk</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-3 border-t border-slate-200">
                            <span className="text-sm font-bold text-slate-900">Total Pembayaran:</span>
                            <span className="text-2xl font-black text-indigo-600">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
