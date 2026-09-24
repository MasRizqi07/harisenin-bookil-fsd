import React from 'react';
import { Product } from '@/types';

interface SamplePreviewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onBuyNow: () => void;
}

export default function SamplePreviewModal({
    product,
    isOpen,
    onClose,
    onBuyNow,
}: SamplePreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                            {product.file_type}
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                                Cuplikan: {product.title}
                            </h3>
                            <p className="text-xs text-slate-500">Oleh {product.author}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Excerpt Body */}
                <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto text-sm text-slate-700 leading-relaxed space-y-6 font-serif">
                    <div className="text-center pb-6 border-b border-slate-100 font-sans">
                        <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold block mb-1">
                            Sampel Gratis • Edisi Digital Resmi
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
                            {product.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Diterbitkan secara eksklusif di Bookil Platform</p>
                    </div>

                    <div>
                        <h4 className="font-sans font-bold text-slate-900 text-base mb-2">
                            Prakata & Daftar Isi
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600 font-sans text-xs">
                            <li>Bab 1: Fondasi & Paradigma Baru di Era Modern</li>
                            <li>Bab 2: Pola Desain Berstandar Industri & Best Practices</li>
                            <li>Bab 3: Implementasi Konkurensi & Optimasi Skalabilitas</li>
                            <li>Bab 4: Studi Kasus Lapangan & Strategi Pemecahan Masalah</li>
                            <li>Bab 5: Checklist Produksi & Langkah Selanjutnya</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-sans font-bold text-slate-900 text-base mb-2">
                            Bab 1: Fondasi Dasar
                        </h4>
                        <p>
                            {product.description ||
                                'Karya ini dirancang untuk memberikan pemahaman holistik mulai dari prinsip-prinsip fundamental hingga teknik tingkat lanjut yang siap diaplikasikan langsung ke lingkungan kerja nyata.'}
                        </p>
                        <p className="mt-3">
                            Setiap konsep di dalam buku digital ini disertai dengan rujukan praktis, analogi yang lugas, serta diagram arsitektur komprehensif agar pembaca dapat menguasai materi secara optimal dalam waktu singkat.
                        </p>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 font-sans text-xs text-amber-800">
                        <p className="font-semibold mb-1">💡 Akhir dari Cuplikan Gratis</p>
                        <p>
                            Dapatkan akses penuh ke seluruh bab, file source code/lampiran, dan unduh berkas versi lengkap berlisensi resmi dengan melanjutkan pembelian.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                        Tutup Cuplikan
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onBuyNow();
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-colors flex items-center justify-center space-x-1.5"
                    >
                        <span>Beli Versi Lengkap Sekarang</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
