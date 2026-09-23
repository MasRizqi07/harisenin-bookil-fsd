import React from 'react';
import { Link } from '@inertiajs/react';
import { Product } from '@/types';

interface ProductCardProps {
    product: Product;
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

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col overflow-hidden">
            {/* Cover Container */}
            <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 via-slate-100 to-violet-50 relative overflow-hidden flex items-center justify-center p-4">
                {product.cover_image_path ? (
                    <img
                        src={`/storage/${product.cover_image_path}`}
                        alt={product.title}
                        className="h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-24 h-32 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg flex flex-col justify-between p-3 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Bookil</span>
                        <svg className="w-8 h-8 opacity-90 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-[9px] font-semibold truncate text-indigo-100">{product.author}</span>
                    </div>
                )}

                {/* File Type Pill */}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {product.file_type}
                </span>

                {product.category && (
                    <span className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm">
                        {product.category.name}
                    </span>
                )}
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-slate-800 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        <Link href={`/products/${product.slug}`}>
                            {product.title}
                        </Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Oleh <span className="font-medium text-slate-700">{product.author}</span></p>

                    {product.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Harga</span>
                        <span className="text-base font-bold text-indigo-600">
                            {formatRupiah(product.price)}
                        </span>
                    </div>

                    <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Detail
                        <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

