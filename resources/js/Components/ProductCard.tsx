import React from 'react';
import { Link } from '@inertiajs/react';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
    onQuickBuy?: (product: Product) => void;
}

export function formatRupiah(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

export function formatFileSize(bytes: number): string {
    if (bytes >= 1048576) {
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
    return (bytes / 1024).toFixed(0) + ' KB';
}

export function getCoverImageUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    if (path.startsWith('/')) {
        return path;
    }
    if (path.startsWith('covers/')) {
        return `/images/${path}`;
    }
    return `/storage/${path}`;
}

export default function ProductCard({ product, onQuickBuy }: ProductCardProps) {
    const [imgSrc, setImgSrc] = React.useState<string | null>(
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

    return (
        <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden relative">
            {/* Top 3:4 Aspect Ratio Cover Area */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={product.title}
                        onError={handleImgError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-between p-6 text-white text-center">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                            <span>Bookil Original</span>
                        </div>
                        <div className="space-y-2">
                            <span className="material-symbols-outlined text-4xl text-indigo-400/80">
                                menu_book
                            </span>
                            <h4 className="text-sm font-bold uppercase leading-tight line-clamp-3">
                                {product.title}
                            </h4>
                        </div>
                        <p className="text-xs text-indigo-200 font-medium truncate w-full">
                            {product.author}
                        </p>
                    </div>
                )}

                {/* Category Glass Floating Badge */}
                {product.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 shadow-sm">
                        {product.category.name}
                    </span>
                )}

                {/* File Specs Pill */}
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-indigo-600">description</span>
                    <span>{product.file_type}</span>
                    {product.file_size > 0 && (
                        <span>• {formatFileSize(product.file_size)}</span>
                    )}
                </span>
            </div>

            {/* Bottom Content Area */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                    {/* Rating and Format info */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <span className="material-symbols-outlined text-[15px] fill-current">star</span>
                            <span>4.9</span>
                        </span>
                        <span className="text-[11px] text-slate-400">Berkas Digital</span>
                    </div>

                    {/* Book Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        <Link href={route('products.show', product.slug)}>
                            {product.title}
                        </Link>
                    </h3>

                    {/* Author Attribution */}
                    <p className="text-xs text-slate-500">
                        Karya <span className="font-semibold text-slate-700">{product.author}</span>
                    </p>

                    {/* Brief Synopsis Snippet */}
                    {product.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Price and Action Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Harga Lisensi
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-slate-900">
                            {formatRupiah(product.price)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {onQuickBuy ? (
                            <button
                                type="button"
                                onClick={() => onQuickBuy(product)}
                                className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1"
                            >
                                <span>Beli</span>
                                <span className="material-symbols-outlined text-[15px]">flash_on</span>
                            </button>
                        ) : (
                            <Link
                                href={route('products.show', product.slug)}
                                className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs transition-colors flex items-center gap-1"
                            >
                                <span>Detail</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
