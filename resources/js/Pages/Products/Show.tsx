import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import { formatRupiah, formatFileSize, getCoverImageUrl } from '@/Components/ProductCard';
import SamplePreviewModal from '@/Components/SamplePreviewModal';
import InstantCheckoutModal from '@/Components/InstantCheckoutModal';
import { PageProps, Product } from '@/types';

interface ShowProps {
    product: Product;
}

export default function Show({ product }: ShowProps) {
    const { auth } = usePage<PageProps>().props;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | null>(
        () => (product.cover_image_path ? getCoverImageUrl(product.cover_image_path) : null)
    );

    const handleImgError = () => {
        if (imgSrc && imgSrc.startsWith('/storage/')) {
            const fallback = imgSrc.replace('/storage/', '/images/');
            if (fallback !== imgSrc) {
                setImgSrc(fallback);
                return;
            }
        }
        setImgSrc(null);
    };

    const handleBuyNow = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        setCheckoutOpen(true);
    };

    return (
        <StoreLayout>
            <Head title={`${product.title} — E-Book Resmi Bookil`} />

            {/* Reading Simulation Preview Modal */}
            <SamplePreviewModal
                product={product}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                onBuyNow={() => {
                    setPreviewOpen(false);
                    handleBuyNow();
                }}
            />

            {/* Instant Checkout Buy-Now Modal */}
            <InstantCheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                product={product}
                user={auth.user}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 flex-wrap">
                    <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">home</span>
                        <span>Beranda</span>
                    </Link>
                    <span>/</span>
                    <Link href={route('products.index')} className="hover:text-indigo-600 transition-colors">
                        Katalog
                    </Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link
                                href={route('products.index', { category: product.category.slug })}
                                className="hover:text-indigo-600 transition-colors"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
                        {product.title}
                    </span>
                </nav>

                {/* Main Product Showcase Box */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* Left Column: Book Cover Presentation (5 cols) */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-gradient-to-tr from-slate-100 via-indigo-50/50 to-slate-100 p-6 shadow-xl relative overflow-hidden border border-slate-100 flex items-center justify-center group">
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={product.title}
                                        onError={handleImgError}
                                        className="h-full w-full object-cover rounded-xl shadow-md transform group-hover:scale-102 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-between p-6 text-white text-center shadow-lg">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                                                Bookil Edition
                                            </span>
                                            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                                                {product.file_type}
                                            </span>
                                        </div>
                                        <div className="my-auto">
                                            <span className="material-symbols-outlined text-5xl text-indigo-400 mb-3 block">
                                                auto_stories
                                            </span>
                                            <h3 className="text-base font-bold uppercase line-clamp-3">
                                                {product.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-indigo-200 font-medium truncate w-full">
                                            {product.author}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Sample Preview Button under cover */}
                            <button
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                className="mt-5 w-full max-w-sm h-11 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-indigo-200/80 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                <span>Baca Cuplikan Bab Gratis</span>
                            </button>

                            {/* Quick Specifications Grid (2x2) */}
                            <div className="mt-6 w-full max-w-sm grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-sm flex flex-col gap-1">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px] text-indigo-600">description</span>
                                        Format File
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">{product.file_type.toUpperCase()} (Zero-DRM)</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-sm flex flex-col gap-1">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px] text-indigo-600">auto_stories</span>
                                        Halaman
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">350+ Halaman Lengkap</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-sm flex flex-col gap-1">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px] text-indigo-600">folder_zip</span>
                                        Ukuran Berkas
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">{formatFileSize(product.file_size)}</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-sm flex flex-col gap-1">
                                    <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px] text-indigo-600">translate</span>
                                        Bahasa
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">Bahasa Indonesia</span>
                                </div>
                            </div>

                            {/* Author Info Mini Card */}
                            <div className="mt-4 w-full max-w-sm p-4 rounded-xl bg-slate-50 border border-slate-200/70 shadow-sm flex items-center gap-3.5">
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-base flex items-center justify-center ring-2 ring-indigo-200 shadow">
                                        {product.author.charAt(0)}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                                        <span className="material-symbols-outlined text-[11px]">check</span>
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h3 className="text-xs font-bold text-slate-900 truncate">{product.author}</h3>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                                            Penulis Terverifikasi
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                        Praktisi &amp; Penulis Buku Spesialis Rekayasa Perangkat Lunak, Arsitektur Sistem, dan Kepemimpinan Teknologi.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Metadata & Purchase Action (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                {/* Top Category and Format Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {product.category && (
                                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                                            {product.category.name}
                                        </span>
                                    )}
                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs uppercase flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">description</span>
                                        <span>{product.file_type}</span>
                                        {product.file_size > 0 && <span>• {formatFileSize(product.file_size)}</span>}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        <span>100% Bebas DRM</span>
                                    </span>
                                </div>

                                {/* Title & Author */}
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                        {product.title}
                                    </h1>
                                    <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
                                        Ditulis oleh <strong className="text-slate-900 font-bold">{product.author}</strong>
                                    </p>
                                </div>

                                {/* Price Box */}
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                                            Harga Lisensi Digital
                                        </span>
                                        <span className="text-3xl font-extrabold text-indigo-600">
                                            {formatRupiah(product.price)}
                                        </span>
                                        <span className="block text-[11px] text-slate-500 mt-0.5">
                                            Akses seumur hidup • Bebas biaya gateway Midtrans
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleBuyNow}
                                        className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                                        <span>Beli Sekarang</span>
                                    </button>
                                </div>

                                {/* Synopsis Description */}
                                <div className="space-y-2 pt-2">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                        Sinopsis &amp; Pokok Bahasan
                                    </h3>
                                    <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line font-sans">
                                        {product.description || 'Tidak ada deskripsi detail untuk e-book ini.'}
                                    </div>
                                </div>

                                {/* Key Features Checklist */}
                                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                                        <span>5x Kuota Unduh Fleksibel (30 Hari)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                                        <span>Kompatibel untuk iPad, Kindle &amp; Laptop</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                                        <span>Fulfillment Instan via Midtrans Snap</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                                        <span>Tersimpan di Rak Digital Akun Anda</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Action Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg flex items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="text-lg font-extrabold text-indigo-600">
                        {formatRupiah(product.price)}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleBuyNow}
                    className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                    <span>Beli Sekarang</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </StoreLayout>
    );
}
