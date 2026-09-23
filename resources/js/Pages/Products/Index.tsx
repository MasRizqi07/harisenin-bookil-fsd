import React, { useState, useEffect, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import ProductCard from '@/Components/ProductCard';
import { Category, PaginatedData, Product } from '@/types';

interface IndexProps {
    products: PaginatedData<Product>;
    categories: Category[];
    filters: {
        search: string;
        category: string;
        sort: string;
    };
}

export default function Index({ products, categories, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    // Debounced search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                '/',
                {
                    search: search || undefined,
                    category: filters.category || undefined,
                    sort: filters.sort || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleCategoryClick = (categorySlug: string) => {
        const newCategory = filters.category === categorySlug ? '' : categorySlug;
        router.get(
            '/',
            {
                search: search || undefined,
                category: newCategory || undefined,
                sort: filters.sort || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            '/',
            {
                search: search || undefined,
                category: filters.category || undefined,
                sort: e.target.value || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <StoreLayout>
            <Head title="Katalog E-Book & Digital Goods" />

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-700/60 text-indigo-200 border border-indigo-500/30 mb-4">
                        Platform E-Book & Digital Goods Resmi
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        Temukan Inspirasi Lewat <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">E-Book Pilihan</span>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto">
                        Akses instan ribuan literatur digital berkualitas tinggi dalam format PDF, EPUB, dan arsip berlisensi.
                    </p>

                    {/* Search Bar in Hero */}
                    <div className="mt-8 max-w-xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul buku, penulis, atau kata kunci..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl text-slate-900 shadow-xl border-0 focus:ring-2 focus:ring-amber-400 text-sm placeholder-slate-400"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalog Main Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Filters & Sorting Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            type="button"
                            onClick={() => handleCategoryClick('')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                !filters.category
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    filters.category === category.slug
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Select */}
                    <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-500">Urutkan:</span>
                        <select
                            value={filters.sort || 'latest'}
                            onChange={handleSortChange}
                            className="bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="latest">Terbaru</option>
                            <option value="price_asc">Harga Terendah</option>
                            <option value="price_desc">Harga Tertinggi</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {products.data.length > 0 ? (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-8">
                        <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="mt-3 text-base font-semibold text-slate-700">Tidak ada buku ditemukan</h3>
                        <p className="mt-1 text-xs text-slate-500">Coba ubah kata kunci atau bersihkan filter kategori Anda.</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {products.last_page > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-1">
                        {products.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : link.url
                                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                        : 'text-slate-300 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}

