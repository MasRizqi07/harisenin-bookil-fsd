import React, { useState, useEffect, useRef } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';
import ProductCard from '@/Components/ProductCard';
import BentoHero from '@/Components/BentoHero';
import InstantCheckoutModal from '@/Components/InstantCheckoutModal';
import CommandPalette from '@/Components/CommandPalette';
import { Category, PageProps, PaginatedData, Product } from '@/types';

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
    const { auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<Product | null>(null);
    const isFirstRender = useRef(true);

    // Debounced search (300ms)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('products.index'),
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
            route('products.index'),
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
            route('products.index'),
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

    const handleResetFilters = () => {
        setSearch('');
        router.get(route('products.index'), {}, { preserveState: false });
    };

    const featuredProduct = products.data.length > 0 ? products.data[0] : null;

    return (
        <StoreLayout>
            <Head title="Katalog E-Book Arsitektur Software & Bisnis Digital" />

            {/* Spotlight Command Palette */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                products={products.data}
            />

            {/* Instant Checkout Buy-Now Modal */}
            {selectedProductForCheckout && (
                <InstantCheckoutModal
                    key={selectedProductForCheckout.id}
                    isOpen={!!selectedProductForCheckout}
                    onClose={() => setSelectedProductForCheckout(null)}
                    product={selectedProductForCheckout}
                    user={auth.user}
                />
            )}

            {/* Modern Neo-SaaS Bento Grid Hero */}
            <BentoHero
                featuredProduct={featuredProduct}
                onSearchClick={() => setCommandPaletteOpen(true)}
            />

            {/* Catalog Main Body */}
            <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Section Header & Subtitle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                Eksplorasi Pustaka
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                            Katalog E-Book Terkurasi
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Daftar buku digital berlisensi resmi dengan pembaruan materi edisi terkini.
                        </p>
                    </div>

                    {/* Results Counter */}
                    <div className="text-xs font-medium text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm w-max">
                        Menampilkan <strong className="text-slate-900">{products.total}</strong> judul tersedia
                    </div>
                </div>

                {/* Filters, Search & Sorting Controls */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 mb-8">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                        {/* Interactive In-Page Search */}
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-3 text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Saring judul buku, nama penulis, topik..."
                                className="w-full h-11 pl-11 pr-9 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            )}
                        </div>

                        {/* Sorting Dropdown */}
                        <div className="flex items-center gap-2 shrink-0">
                            <label htmlFor="sort-select" className="text-xs font-semibold text-slate-600">
                                Urutkan:
                            </label>
                            <select
                                id="sort-select"
                                value={filters.sort || 'latest'}
                                onChange={handleSortChange}
                                className="h-11 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:ring-indigo-500 py-1 pl-3 pr-8"
                            >
                                <option value="latest">Rilis Terbaru</option>
                                <option value="price_asc">Harga: Terendah ke Tertinggi</option>
                                <option value="price_desc">Harga: Tertinggi ke Terendah</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filter Pills Ribbon */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                        <button
                            type="button"
                            onClick={() => handleCategoryClick('')}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                                !filters.category
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                                    filters.category === category.slug
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {products.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.data.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onQuickBuy={(prod) => {
                                    if (!auth.user) {
                                        router.visit(route('login'));
                                    } else {
                                        setSelectedProductForCheckout(prod);
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm my-12">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">search_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Buku Belum Ditemukan</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            Tidak ada e-book yang cocok dengan kata kunci pencarian atau kategori yang Anda pilih saat ini.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                        >
                            Reset Semua Filter
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="mt-12 flex justify-center items-center gap-1.5 flex-wrap">
                        {products.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                                    link.active
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : link.url
                                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                        : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </StoreLayout>
    );
}
