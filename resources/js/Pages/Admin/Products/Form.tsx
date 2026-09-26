import React, { useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Category, Product } from '@/types';

interface FormProps {
    product: Product | null;
    categories: Category[];
}

export default function Form({ product, categories }: FormProps) {
    const isEdit = !!product;

    const { data, setData, post, processing, errors } = useForm({
        category_id: product?.category_id ? String(product.category_id) : (categories[0]?.id ? String(categories[0].id) : ''),
        title: product?.title || '',
        slug: product?.slug || '',
        author: product?.author || '',
        description: product?.description || '',
        sample_excerpt: product?.sample_excerpt || '',
        price: product?.price ? String(product.price) : '',
        file_type: product?.file_type || 'pdf',
        is_published: product ? product.is_published : false,
        cover_image: null as File | null,
        digital_file: null as File | null,
    });

    const coverInputRef = useRef<HTMLInputElement>(null);
    const digitalFileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            // Use method spoofing for multipart PUT
            router.post(`/admin/products/${product.id}`, {
                _method: 'put',
                ...data,
            }, {
                forceFormData: true,
            });
        } else {
            post('/admin/products', {
                forceFormData: true,
            });
        }
    };

    return (
        <AdminLayout title={isEdit ? `Edit: ${product.title}` : 'Tambah E-Book Baru'}>
            <Head title={`${isEdit ? 'Edit' : 'Tambah'} E-Book - Bookil Admin`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href="/admin/products"
                            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1 mb-2"
                        >
                            <span>&larr; Kembali ke Daftar E-Book</span>
                        </Link>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {isEdit ? 'Perbarui Data E-Book' : 'Terbitkan E-Book Digital Baru'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Lengkapi informasi publikasi, unggah cover depan, dan berkas privat digital (PDF, EPUB, ZIP).
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Judul E-Book <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Arsitektur Cloud Skala Tinggi"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                required
                            />
                            {errors.title && <p className="mt-1 text-[11px] text-rose-400">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                URL Slug (Opsional)
                            </label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="arsitektur-cloud-skala-tinggi"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-mono"
                            />
                            {errors.slug && <p className="mt-1 text-[11px] text-rose-400">{errors.slug}</p>}
                        </div>
                    </div>

                    {/* Author & Category & Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Penulis / Kreator <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                placeholder="Nama lengkap penulis"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                required
                            />
                            {errors.author && <p className="mt-1 text-[11px] text-rose-400">{errors.author}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Kategori <span className="text-rose-400">*</span>
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="mt-1 text-[11px] text-rose-400">{errors.category_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Harga Resmi (IDR) <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="Contoh: 149000"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                required
                            />
                            {errors.price && <p className="mt-1 text-[11px] text-rose-400">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Format & Status Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Format Berkas Digital <span className="text-rose-400">*</span>
                            </label>
                            <div className="flex gap-4">
                                {(['pdf', 'epub', 'zip'] as const).map((fmt) => (
                                    <label
                                        key={fmt}
                                        className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-bold uppercase cursor-pointer transition-colors ${
                                            data.file_type === fmt
                                                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="file_type"
                                            value={fmt}
                                            checked={data.file_type === fmt}
                                            onChange={(e) => setData('file_type', e.target.value as 'pdf' | 'epub' | 'zip')}
                                            className="sr-only"
                                        />
                                        <span>{fmt}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.file_type && <p className="mt-1 text-[11px] text-rose-400">{errors.file_type}</p>}
                        </div>

                        <div className="flex flex-col justify-end">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Visibilitas Katalog
                            </label>
                            <label className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
                                />
                                <span className="text-xs font-semibold text-white">
                                    Publikasikan langsung ke etalase toko
                                </span>
                            </label>
                            {errors.is_published && <p className="mt-1 text-[11px] text-rose-400">{errors.is_published}</p>}
                        </div>
                    </div>

                    {/* File Uploads (Cover and Private Digital Book) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                        {/* Cover Image */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                                Cover Depan (JPG / PNG / WEBP)
                            </label>
                            <p className="text-[11px] text-slate-500 mb-2">Maksimal 2MB, rasio vertikal 3:4 direkomendasikan</p>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setData('cover_image', e.target.files[0]);
                                    }
                                }}
                                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                            />
                            {product?.cover_image_path && (
                                <p className="text-[11px] text-emerald-400 mt-2">
                                    Cover saat ini tersimpan: <span className="font-mono text-slate-400">{product.cover_image_path}</span>
                                </p>
                            )}
                            {errors.cover_image && <p className="mt-1 text-[11px] text-rose-400">{errors.cover_image}</p>}
                        </div>

                        {/* Digital Asset (Private S3/R2) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                                Berkas Digital Privat (PDF/EPUB/ZIP)
                            </label>
                            <p className="text-[11px] text-slate-500 mb-2">Tersimpan aman di storage privat tanpa tautan publik</p>
                            <input
                                ref={digitalFileInputRef}
                                type="file"
                                accept=".pdf,.epub,.zip"
                                required={!isEdit}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setData('digital_file', e.target.files[0]);
                                    }
                                }}
                                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                            />
                            {isEdit && (
                                <p className="text-[11px] text-indigo-400 mt-2">
                                    Biarkan kosong jika tidak ingin mengubah berkas buku yang sudah ada.
                                </p>
                            )}
                            {errors.digital_file && <p className="mt-1 text-[11px] text-rose-400">{errors.digital_file}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t border-slate-850">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                            Sinopsis & Deskripsi Lengkap
                        </label>
                        <textarea
                            rows={6}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tuliskan ikhtisar buku, daftar bab, atau manfaat membaca karya ini..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 leading-relaxed"
                        />
                        {errors.description && <p className="mt-1 text-[11px] text-rose-400">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                            Cuplikan dari Karya (Opsional)
                        </label>
                        <textarea
                            rows={6}
                            maxLength={10000}
                            value={data.sample_excerpt}
                            onChange={(e) => setData('sample_excerpt', e.target.value)}
                            placeholder="Tempel cuplikan yang memang berasal dari karya dan boleh dipublikasikan."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                        />
                        {errors.sample_excerpt && <p className="mt-1 text-[11px] text-rose-400">{errors.sample_excerpt}</p>}
                    </div>

                    {/* Form CTA */}
                    <div className="pt-6 border-t border-slate-850 flex items-center justify-end space-x-3">
                        <Link
                            href="/admin/products"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
                        >
                            {processing && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan E-Book'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
