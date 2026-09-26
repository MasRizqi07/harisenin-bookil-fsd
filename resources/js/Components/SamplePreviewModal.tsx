import React from 'react';
import { Product } from '@/types';

interface SamplePreviewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onBuyNow: () => void;
}

export default function SamplePreviewModal({ product, isOpen, onClose, onBuyNow }: SamplePreviewModalProps) {
    if (!isOpen || !product.sample_excerpt) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="presentation" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="sample-title"
                className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 id="sample-title" className="text-base font-bold text-slate-800">Cuplikan: {product.title}</h3>
                        <p className="text-xs text-slate-500">Oleh {product.author}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Tutup cuplikan" className="text-slate-500 hover:text-slate-800 p-2">✕</button>
                </div>
                <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                    {product.sample_excerpt}
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold">Tutup</button>
                    <button type="button" onClick={() => { onClose(); onBuyNow(); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Beli E-Book</button>
                </div>
            </div>
        </div>
    );
}
