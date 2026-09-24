import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Product } from '@/types';
import { formatRupiah } from '@/Components/ProductCard';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    products?: Product[];
}

export default function CommandPalette({
    isOpen,
    onClose,
    products = [],
}: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Global Cmd+K / Ctrl+K keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // Let parent handle opening or we can dispatch an event
                }
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Auto focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const defaultLinks = [
        { title: 'Jelajahi Semua E-Book', subtitle: 'Katalog lengkap buku digital', url: route('products.index'), icon: 'menu_book' },
        { title: 'Perpustakaan Saya', subtitle: 'Akses buku yang telah dibeli', url: route('customer.library'), icon: 'local_library' },
        { title: 'Profil & Keamanan', subtitle: 'Pengaturan akun dan password', url: route('profile.edit'), icon: 'manage_accounts' },
    ];

    const filteredProducts = query.trim() === ''
        ? []
        : products.filter(p =>
              p.title.toLowerCase().includes(query.toLowerCase()) ||
              p.author.toLowerCase().includes(query.toLowerCase()) ||
              p.category?.name.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);

    const filteredLinks = query.trim() === ''
        ? defaultLinks
        : defaultLinks.filter(l =>
              l.title.toLowerCase().includes(query.toLowerCase()) ||
              l.subtitle.toLowerCase().includes(query.toLowerCase())
          );

    const allItems = [
        ...filteredProducts.map(p => ({
            type: 'product' as const,
            id: p.id,
            title: p.title,
            subtitle: `${p.author} • ${formatRupiah(p.price)}`,
            url: route('products.show', p.slug),
            badge: p.file_type.toUpperCase(),
        })),
        ...filteredLinks.map(l => ({
            type: 'link' as const,
            id: l.url,
            title: l.title,
            subtitle: l.subtitle,
            url: l.url,
            icon: l.icon,
        })),
    ];

    const handleSelect = (url: string) => {
        onClose();
        router.visit(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (allItems[selectedIndex]) {
                handleSelect(allItems[selectedIndex].url);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative mx-auto max-w-2xl transform rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden transition-all">
                {/* Search Bar */}
                <div className="relative flex items-center border-b border-slate-200 px-4">
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Cari judul e-book, penulis, atau menu navigasi..."
                        className="h-14 w-full border-0 bg-transparent pr-4 pl-3 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                    />
                    <kbd className="hidden sm:inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 uppercase">
                        Esc
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-96 overflow-y-auto p-3 space-y-1">
                    {allItems.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">
                                search_off
                            </span>
                            Tidak ada hasil untuk "{query}". Coba kata kunci lain.
                        </div>
                    ) : (
                        allItems.map((item, idx) => {
                            const isSelected = idx === selectedIndex;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelect(item.url)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                                        isSelected
                                            ? 'bg-indigo-50/80 text-indigo-900'
                                            : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                isSelected
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {item.type === 'product' ? 'auto_stories' : item.icon}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{item.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        {item.type === 'product' && item.badge && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                                                {item.badge}
                                            </span>
                                        )}
                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                            chevron_right
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer Tips */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px]">↑</kbd>
                            <kbd className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px]">↓</kbd>
                            Pilih
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px]">↵</kbd>
                            Buka
                        </span>
                    </div>
                    <span>Spotlight Command</span>
                </div>
            </div>
        </div>
    );
}
