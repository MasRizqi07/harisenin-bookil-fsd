import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { PageProps, Product } from '@/types';

interface ShowProps {
    product: Product;
}

function formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function Show({ product }: ShowProps) {
    const { auth } = usePage<PageProps>().props;

    const { post, processing } = useForm({
        product_id: product.id,
        notes: '',
    });

    const handleBuyNow = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout');
    };

    return (
        <StoreLayout>
            <Head title={`${product.title} - Bookil`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-8">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">Katalog</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <Link href={`/?category=${product.category.slug}`} className="hover:text-indigo-600 transition-colors">
                                {product.category.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-slate-800 font-medium truncate max-w-xs">{product.title}</span>
                </nav>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                        {/* Book Cover Column */}
                        <div className="md:col-span-5 flex flex-col items-center">
                            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-gradient-to-tr from-indigo-100 via-slate-100 to-violet-100 flex items-center justify-center p-6 shadow-xl relative overflow-hidden border border-slate-100">
                                {product.cover_image_path ? (
                                    <img
                                        src={`/storage/${product.cover_image_path}`}
                                        alt={product.title}
                                        className="h-full object-contain rounded-lg shadow-md"
                                    />
                                ) : (
                                    <div className="w-48 h-64 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-700 shadow-2xl flex flex-col justify-between p-5 text-white">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Bookil E-Book</span>
                                            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                                                {product.file_type}
                                            </span>
                                        </div>
                                        <div className="my-auto text-center">
                                            <svg className="w-12 h-12 opacity-80 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <p className="text-sm font-bold line-clamp-2">{product.title}</p>
                                        </div>
                                        <p className="text-xs text-indigo-100 font-medium truncate">{product.author}</p>
                                    </div>
                                )}

                                <span className="absolute top-4 left-4 bg-indigo-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                                    {product.category?.name || 'Digital Book'}
                                </span>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm text-xs text-slate-500">
                                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Download Instan</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Pembayaran Aman</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Info Column */}
                        <div className="md:col-span-7 flex flex-col justify-between">
                            <div>
                                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
                                    {product.category?.name || 'Digital Goods'}
                                </span>
                                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1 leading-tight">
                                    {product.title}
                                </h1>
                                <p className="text-sm text-slate-600 mt-2">
                                    Karya <span className="font-semibold text-slate-800">{product.author}</span>
                                </p>

                                {/* Specification Pills */}
                                <div className="flex flex-wrap gap-2 mt-5">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                        Format: <strong className="ml-1 uppercase text-indigo-600">{product.file_type}</strong>
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                        Ukuran: <strong className="ml-1">{formatBytes(product.file_size)}</strong>
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                        Lisensi: <strong className="ml-1 text-emerald-600">Personal License</strong>
                                    </span>
                                </div>

                                {/* Price Box */}
                                <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Harga Resmi</span>
                                        <span className="text-3xl font-extrabold text-indigo-700">
                                            {formatRupiah(product.price)}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1 rounded-full">
                                        Sekali Bayar
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="mt-8">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                                        Sinopsis & Deskripsi
                                    </h3>
                                    <div className="mt-3 text-sm text-slate-600 leading-relaxed space-y-3">
                                        {product.description ? (
                                            <p className="whitespace-pre-line">{product.description}</p>
                                        ) : (
                                            <p className="italic text-slate-400">Tidak ada deskripsi tersedia untuk produk ini.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Buy CTA */}
                            <div className="mt-10 pt-6 border-t border-slate-100">
                                {auth.user ? (
                                    <form onSubmit={handleBuyNow}>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    <span>Memproses Pesanan...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    <span>Beli Sekarang ({formatRupiah(product.price)})</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                                        <p className="text-xs text-slate-600 mb-3">Silakan masuk atau buat akun terlebih dahulu untuk membeli e-book ini.</p>
                                        <Link
                                            href={`/login?redirect=/products/${product.slug}`}
                                            className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors"
                                        >
                                            Masuk untuk Membeli
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}

