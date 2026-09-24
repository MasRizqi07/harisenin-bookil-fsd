import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Product, User } from '@/types';
import { formatRupiah } from '@/Components/ProductCard';

interface InstantCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    user: User | null;
}

export default function InstantCheckoutModal({
    isOpen,
    onClose,
    product,
    user,
}: InstantCheckoutModalProps) {
    const [agreed, setAgreed] = useState(true);

    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) return;

        post(route('checkout.store'), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Konfirmasi Pembelian Instan</h3>
                            <p className="text-xs text-slate-500">1-Klik Akses Lisensi Digital Seumur Hidup</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Book Summary Card */}
                    <div className="flex gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="w-16 h-22 rounded-lg overflow-hidden bg-indigo-900 shrink-0 shadow-md">
                            {product.cover_image_path ? (
                                <img
                                    src={`/storage/${product.cover_image_path}`}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-1 text-center bg-gradient-to-br from-indigo-700 to-indigo-950">
                                    <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                                    <span className="text-[9px] uppercase font-bold mt-1 line-clamp-2">
                                        {product.title}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product.title}</h4>
                                <p className="text-xs text-slate-500">Karya {product.author}</p>
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-700">
                                        {product.file_type}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        5x Kuota Unduh
                                    </span>
                                </div>
                            </div>
                            <div className="text-right mt-1">
                                <span className="text-base font-extrabold text-indigo-600 block">
                                    {formatRupiah(product.price)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Identity Strip */}
                    {user && (
                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">Penerima: {user.name}</p>
                                    <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-indigo-700 shrink-0 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">verified</span>
                                Terikat Akun
                            </span>
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Harga E-Book</span>
                            <span className="font-semibold text-slate-900">{formatRupiah(product.price)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span className="flex items-center gap-1">
                                Biaya Gateway (Midtrans Snap)
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    Gratis
                                </span>
                            </span>
                            <span className="font-semibold text-emerald-600">Rp 0</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>PPN Digital Indonesia (11%)</span>
                            <span className="font-semibold text-slate-500">Termasuk</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-200">
                            <span className="text-sm font-bold text-slate-900">Total Tagihan:</span>
                            <span className="text-xl font-extrabold text-indigo-600">
                                {formatRupiah(product.price)}
                            </span>
                        </div>
                    </div>

                    {/* Optional Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Catatan Pesanan (Opsional)
                        </label>
                        <input
                            type="text"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Contoh: Untuk referensi belajar tim dev..."
                            className="w-full h-9 rounded-lg border border-slate-300 text-xs px-3 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                        <input
                            id="terms-agree"
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        />
                        <label htmlFor="terms-agree" className="text-xs text-slate-600">
                            Saya menyetujui lisensi digital e-book Bookil dan ketentuan 5x kuota unduh berbatas waktu.
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!agreed || processing}
                            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Memproses Pesanan...</span>
                                </>
                            ) : (
                                <>
                                    <span>Lanjut ke Pembayaran Midtrans</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
