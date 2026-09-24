import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Category } from '@/types';

interface CategoryItem extends Category {
    products_count: number;
}

interface IndexProps {
    categories: CategoryItem[];
}

export default function Index({ categories }: IndexProps) {
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const createForm = useForm({
        name: '',
        slug: '',
        description: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        slug: '',
        description: '',
        is_active: true,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/categories', {
            onSuccess: () => {
                createForm.reset();
            },
        });
    };

    const handleStartEdit = (category: CategoryItem) => {
        setEditingCategory(category);
        editForm.setData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            is_active: category.is_active ?? true,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        editForm.put(`/admin/categories/${editingCategory.id}`, {
            onSuccess: () => {
                setEditingCategory(null);
            },
        });
    };

    const handleDelete = (category: CategoryItem) => {
        if (category.products_count > 0) {
            alert('Kategori tidak dapat dihapus karena masih memuat produk aktif.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
            router.delete(`/admin/categories/${category.id}`);
        }
    };

    return (
        <AdminLayout title="Kelola Kategori E-Book">
            <Head title="Kategori Produk - Bookil Admin" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Kategori & Taksonomi Produk
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Kelola struktur klasifikasi buku digital untuk kemudahan navigasi pembeli.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column: Create or Edit (1 col) */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-white mb-1">
                        {editingCategory ? `Edit: ${editingCategory.name}` : 'Buat Kategori Baru'}
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">
                        {editingCategory ? 'Perbarui nama atau deskripsi kategori' : 'Tambahkan kategori baru ke katalog'}
                    </p>

                    <form onSubmit={editingCategory ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Nama Kategori <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingCategory ? editForm.data.name : createForm.data.name}
                                onChange={(e) => {
                                    if (editingCategory) editForm.setData('name', e.target.value);
                                    else createForm.setData('name', e.target.value);
                                }}
                                placeholder="Contoh: Pemrograman & AI"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                required
                            />
                            {(editingCategory ? editForm.errors.name : createForm.errors.name) && (
                                <p className="mt-1 text-[11px] text-rose-400">
                                    {editingCategory ? editForm.errors.name : createForm.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Slug URL (Opsional)
                            </label>
                            <input
                                type="text"
                                value={editingCategory ? editForm.data.slug : createForm.data.slug}
                                onChange={(e) => {
                                    if (editingCategory) editForm.setData('slug', e.target.value);
                                    else createForm.setData('slug', e.target.value);
                                }}
                                placeholder="pemrograman-dan-ai"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Deskripsi Singkat
                            </label>
                            <textarea
                                rows={3}
                                value={editingCategory ? editForm.data.description : createForm.data.description}
                                onChange={(e) => {
                                    if (editingCategory) editForm.setData('description', e.target.value);
                                    else createForm.setData('description', e.target.value);
                                }}
                                placeholder="Keterangan singkat tentang lingkup kategori ini..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingCategory ? editForm.data.is_active : createForm.data.is_active}
                                    onChange={(e) => {
                                        if (editingCategory) editForm.setData('is_active', e.target.checked);
                                        else createForm.setData('is_active', e.target.checked);
                                    }}
                                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
                                />
                                <span className="text-xs font-semibold text-white">
                                    Aktif di Filter Katalog
                                </span>
                            </label>
                        </div>

                        <div className="pt-2 flex items-center space-x-2">
                            {editingCategory && (
                                <button
                                    type="button"
                                    onClick={() => setEditingCategory(null)}
                                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Batal
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={editingCategory ? editForm.processing : createForm.processing}
                                className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
                            >
                                {editingCategory ? 'Perbarui Kategori' : 'Tambah Kategori'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Categories Table (2 cols) */}
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white">Daftar Kategori</h3>
                            <p className="text-xs text-slate-400">Total {categories.length} kategori terdaftar</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-850 text-xs">
                            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-left">
                                <tr>
                                    <th className="px-6 py-4">Kategori & Slug</th>
                                    <th className="px-6 py-4">Deskripsi</th>
                                    <th className="px-6 py-4 text-center">Buku</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-slate-300">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-900/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-white block">
                                                {category.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                /{category.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-slate-400">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-white">
                                            {category.products_count}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    category.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {category.is_active ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(category)}
                                                className="text-violet-400 hover:text-violet-300 font-semibold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(category)}
                                                disabled={category.products_count > 0}
                                                className={`font-semibold ${
                                                    category.products_count > 0
                                                        ? 'text-slate-600 cursor-not-allowed'
                                                        : 'text-rose-400 hover:text-rose-300'
                                                }`}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
