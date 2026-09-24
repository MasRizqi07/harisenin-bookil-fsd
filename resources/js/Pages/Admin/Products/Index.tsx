import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatRupiah } from '@/Components/ProductCard';
import { Category, PaginatedData, Product } from '@/types';

interface ProductItem extends Product {
    order_items_count: number;
}

interface IndexProps {
    products: PaginatedData<ProductItem>;
    categories: Category[];
    filters: {
        search: string;
        category_id: string;
    };
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function Index({ products, categories, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/products',
            {
                search: search || undefined,
                category_id: categoryId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleTogglePublish = (product: ProductItem) => {
        router.patch(
            `/admin/products/${product.id}/toggle-publish`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (product: ProductItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus e-book "${product.title}"?`)) {
            router.delete(`/admin/products/${product.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout title="Kelola Katalog E-Book">
            <Head title="Kelola Produk - Bookil Admin" />

            {/* Header with CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Katalog Produk & E-Book
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Daftar e-book digital aktif, aset privat, dan publikasi toko.
                    </p>
                </div>

                <Link
                    href="/admin/products/create"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah E-Book Baru</span>
                </Link>
            </div>

            {/* Filters Bar */}
            <form onSubmit={handleFilter} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul e-book atau nama penulis..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                        />
                        <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-3 pr-8 text-xs text-slate-300 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                    Terapkan Filter
                </button>
            </form>

            {/* Product Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                {products.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-850 text-xs">
                            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-left">
                                <tr>
                                    <th className="px-6 py-4">Buku & Penulis</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Harga</th>
                                    <th className="px-6 py-4">Format / Ukuran</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Terjual</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-slate-300">
                                {products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-900/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-14 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white uppercase overflow-hidden shadow">
                                                    {product.cover_image_path ? (
                                                        <img
                                                            src={`/storage/${product.cover_image_path}`}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        product.file_type
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-white truncate max-w-xs">
                                                        {product.title}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400 truncate">
                                                        {product.author}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        /{product.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300">
                                                {product.category?.name || 'Umum'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-400">
                                            {formatRupiah(product.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="uppercase font-semibold text-slate-200">
                                                {product.file_type}
                                            </span>
                                            <span className="text-slate-500 block text-[10px]">
                                                {formatBytes(product.file_size)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePublish(product)}
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                    product.is_published
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.is_published ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                                {product.is_published ? 'Publik' : 'Draf'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-200">
                                            {product.order_items_count}x
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-violet-400 hover:text-violet-300 rounded-lg font-semibold transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(product)}
                                                className="inline-flex items-center px-2.5 py-1.5 bg-slate-900 hover:bg-rose-500/10 text-rose-400 rounded-lg font-semibold transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-sm text-slate-400">Tidak ada e-book yang cocok dengan filter Anda.</p>
                    </div>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="px-6 py-4 bg-slate-900 border-t border-slate-850 flex justify-center items-center space-x-1">
                        {products.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-violet-600 text-white'
                                        : link.url
                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        : 'text-slate-600 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
