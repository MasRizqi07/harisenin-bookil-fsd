import React from 'react';
import { Link } from '@inertiajs/react';
import { Product } from '@/types';
import { formatRupiah, getCoverImageUrl } from '@/Components/ProductCard';

interface BentoHeroProps {
    featuredProduct?: Product | null;
    onSearchClick?: () => void;
}

export default function BentoHero({
    featuredProduct,
    onSearchClick,
}: BentoHeroProps) {
    const [imgSrc, setImgSrc] = React.useState<string | null>(
        () => (featuredProduct?.cover_image_path ? getCoverImageUrl(featuredProduct.cover_image_path) : null)
    );

    React.useEffect(() => {
        setImgSrc(featuredProduct?.cover_image_path ? getCoverImageUrl(featuredProduct.cover_image_path) : null);
    }, [featuredProduct?.cover_image_path]);

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

    return (
        <section className="relative overflow-hidden pt-8 pb-12">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Asymmetric Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Bento Cell 1: Main High-Impact Banner (8 cols) */}
                    <div className="lg:col-span-8 rounded-3xl bg-white p-8 sm:p-10 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        {/* Decorative Top Pill */}
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                Edisi 2026 Terbaru
                            </span>
                            <span className="text-xs text-slate-500">Koleksi Terkurasi Praktisi Senior</span>
                        </div>

                        {/* Headline */}
                        <div className="my-8 max-w-2xl">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                                Buka Pintu Pengetahuan Digital <span className="text-indigo-600">Tanpa Batas.</span>
                            </h1>
                            <p className="mt-4 text-base sm:lg text-slate-600 leading-relaxed">
                                Platform e-book arsitektur software, teknologi modern, dan kepemimpinan bisnis terlengkap di Indonesia. 
                                Format PDF &amp; EPUB murni, tanpa DRM mengikat, unduh instan ke perangkat Anda.
                            </p>
                        </div>

                        {/* Search & Action Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onSearchClick}
                                className="flex-1 h-12 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-between text-sm transition-all focus:outline-none"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                    <span>Cari judul e-book, topik, atau penulis...</span>
                                </span>
                                <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-white text-slate-500 text-xs font-semibold border border-slate-200">
                                    ⌘K
                                </kbd>
                            </button>
                            <a
                                href="#katalog"
                                className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
                            >
                                <span>Jelajahi Koleksi</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                            </a>
                        </div>
                    </div>

                    {/* Bento Cell 2: Spotlight Book of the Month (4 cols) */}
                    <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
                        {/* Background glowing shape */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex items-center justify-between z-10">
                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-300 text-xs font-bold border border-white/10 uppercase tracking-wider">
                                Editor's Choice
                            </span>
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                <span className="material-symbols-outlined text-[16px] text-amber-400">star</span>
                                4.9 / 5.0
                            </span>
                        </div>

                        {featuredProduct ? (
                            <div className="my-6 z-10 flex flex-col items-center text-center">
                                {/* Book Cover Presentation with 3D feel */}
                                <div className="w-32 h-44 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/20 transform hover:scale-105 transition-all duration-300 bg-indigo-800">
                                    {imgSrc ? (
                                        <img
                                            src={imgSrc}
                                            alt={featuredProduct.title}
                                            onError={handleImgError}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-indigo-700 to-indigo-950">
                                            <span className="material-symbols-outlined text-3xl">auto_stories</span>
                                            <span className="text-[10px] font-bold mt-2 uppercase line-clamp-3">
                                                {featuredProduct.title}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold mt-4 line-clamp-1">{featuredProduct.title}</h3>
                                <p className="text-xs text-indigo-200 mt-0.5">{featuredProduct.author}</p>
                                <span className="text-xl font-extrabold text-amber-300 mt-2 block">
                                    {formatRupiah(featuredProduct.price)}
                                </span>
                            </div>
                        ) : (
                            <div className="my-6 z-10 text-center">
                                <div className="w-32 h-44 mx-auto rounded-xl bg-indigo-800/80 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-indigo-300">menu_book</span>
                                </div>
                                <h3 className="text-lg font-bold mt-4">Koleksi Terpopuler</h3>
                            </div>
                        )}

                        <div className="z-10">
                            {featuredProduct ? (
                                <Link
                                    href={route('products.show', featuredProduct.slug)}
                                    className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>Lihat E-Book</span>
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            ) : (
                                <a
                                    href="#katalog"
                                    className="w-full h-11 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center"
                                >
                                    Lihat Semua Buku
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bento Cell 3: Live Community Stat Widget (4 cols) */}
                    <div className="lg:col-span-4 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[28px]">group</span>
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">Bookil</span>
                            <span className="text-xs text-slate-500 font-medium">Perpustakaan digital pribadi</span>
                        </div>
                    </div>

                    {/* Bento Cell 4: 100% DRM-Free Freedom (4 cols) */}
                    <div className="lg:col-span-4 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[28px]">verified_user</span>
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">Format Digital</span>
                            <span className="text-xs text-slate-500 font-medium">Lihat format yang tersedia di tiap produk</span>
                        </div>
                    </div>

                    {/* Bento Cell 5: Instant Fulfillment Guarantee (4 cols) */}
                    <div className="lg:col-span-4 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[28px]">bolt</span>
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">&lt; 2 Detik</span>
                            <span className="text-xs text-slate-500 font-medium">Akses langsung ke rak digital setelah bayar</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
