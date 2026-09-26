import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/Layouts/StoreLayout';

interface FaqItem {
    id: string;
    question: string;
    category: 'pembayaran' | 'unduhan' | 'perangkat' | 'lisensi';
    keywords: string;
    answer: React.ReactNode;
}

const FAQ_DATA: FaqItem[] = [
    {
        id: 'pay-1',
        category: 'pembayaran',
        keywords: 'qris virtual account bca mandiri bni bri biaya gratis instan snap midtrans',
        question: 'Bagaimana cara membayar via QRIS Dinamis dan Virtual Account?',
        answer: (
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                    Pembayaran diproses melalui Midtrans. Metode dan batas waktu pembayaran ditampilkan pada halaman pembayaran.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">1</span>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Pilih Metode</h4>
                        <p className="text-xs text-slate-500">Pilih QRIS Dinamis (GoPay, OVO, Dana, BCA QR) atau nomor Virtual Account bank pilihan Anda.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">2</span>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Pindai atau Salin</h4>
                        <p className="text-xs text-slate-500">Pindai kode QRIS langsung di layar atau salin nomor Virtual Account ke aplikasi mobile banking Anda.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">3</span>
                        <h4 className="font-bold text-slate-800 text-xs mb-1">Akses Instan</h4>
                        <p className="text-xs text-slate-500">Sistem memverifikasi status pembayaran secara instan via Webhook SHA-512 dan e-book langsung siap diunduh.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">BCA VA</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">Mandiri Livin</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">BRImo</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">BNI Mobile</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">QRIS Standar BI</span>
                    <span className="ml-auto text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Status mengikuti konfirmasi gateway
                    </span>
                </div>
            </div>
        ),
    },
    {
        id: 'pay-2',
        category: 'pembayaran',
        keywords: 'batas waktu pending 24 jam kedaluwarsa pesanan batal expire',
        question: 'Berapa lama batas waktu pembayaran sebelum pesanan kedaluwarsa?',
        answer: (
            <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
                <p>
                    Ikuti batas waktu yang ditampilkan oleh Midtrans untuk metode pembayaran yang Anda pilih.
                </p>
                <p className="text-xs text-slate-500">
                    Ketika Midtrans menyatakan transaksi kedaluwarsa, status pesanan akan diperbarui setelah notifikasi terverifikasi diterima.
                </p>
            </div>
        ),
    },
    {
        id: 'pay-3',
        category: 'pembayaran',
        keywords: 'bukti transfer manual konfirmasi webhook sha-512 otomatis kirim struk slip',
        question: 'Apakah saya perlu mengunggah bukti transfer secara manual?',
        answer: (
            <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
                <p>
                    <strong className="text-emerald-700">Tidak perlu.</strong> Midtrans mengirimkan notifikasi pembayaran ke Bookil dan sistem memeriksa ulang status transaksi melalui API Midtrans.
                </p>
                <p className="text-xs text-slate-500">
                    Setelah status lunas terkonfirmasi, produk tampil di <strong className="text-indigo-600">Perpustakaan Saya</strong>.
                </p>
            </div>
        ),
    },
    {
        id: 'download-1',
        category: 'unduhan',
        keywords: 'kuota habis 5x unduhan reset minta tambahan fair use download limit token',
        question: 'Apa yang terjadi jika batas 5x kuota unduhan saya habis?',
        answer: (
            <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p>
                    Batas 5x unduhan diterapkan sebagai langkah proteksi fair-use untuk mencegah sindikasi massal bot tanpa izin. Kami memahami Anda mungkin berganti perangkat, kehilangan berkas lokal, atau membutuhkan berkas cadangan.
                </p>
                <p>
                    Jika kuota habis, simpan nomor pesanan dan hubungi pengelola toko untuk meninjau akses Anda.
                </p>
            </div>
        ),
    },
    {
        id: 'download-2',
        category: 'unduhan',
        keywords: 'presigned url s3 15 menit token expired aman enkripsi tautan kedaluwarsa',
        question: 'Mengapa tautan unduh memiliki durasi kedaluwarsa 15 menit?',
        answer: (
            <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
                <p>
                    Untuk melindungi berkas digital dari penyadapan dan pengunduhan tidak sah, Bookil menghasilkan <strong className="text-slate-900">Signed Storage URL</strong> sementara dengan batas waktu 15 menit setiap kali Anda menekan tombol unduh.
                </p>
                <p className="text-xs text-slate-500">
                    Jika tautan kedaluwarsa sebelum berkas selesai diunduh, cukup klik kembali tombol unduh di halaman Perpustakaan Saya untuk menghasilkan tautan baru yang segar.
                </p>
            </div>
        ),
    },
    {
        id: 'device-1',
        category: 'perangkat',
        keywords: 'format pdf epub ipad kindle paperwhite android kobo ereader offline',
        question: 'Format apa saja yang disediakan dan bagaimana cara membacanya di Kindle / iPad?',
        answer: (
            <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p>
                    Sebagian besar e-book teknis di Bookil disediakan dalam format <strong className="text-slate-900">PDF High-Resolution</strong> (optimal untuk laptop dan layar besar) serta format reflowable <strong className="text-slate-900">EPUB</strong> (optimal untuk e-reader dan ponsel).
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                    <li><strong className="text-slate-800">Apple iPad / iPhone:</strong> Buka berkas EPUB langsung menggunakan aplikasi bawaan Apple Books.</li>
                    <li><strong className="text-slate-800">Amazon Kindle:</strong> Kirim berkas EPUB via fitur <em>Send to Kindle</em> melalui email atau aplikasi Kindle.</li>
                    <li><strong className="text-slate-800">Android:</strong> Gunakan aplikasi pembaca seperti ReadEra, Lithium, atau Moon+ Reader.</li>
                </ul>
            </div>
        ),
    },
    {
        id: 'license-1',
        category: 'lisensi',
        keywords: 'drm zero-drm hak milik personal watermark lisensi abadi',
        question: 'Apa maksud lisensi Zero-DRM di Bookil?',
        answer: (
            <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p>
                    <strong className="text-indigo-600">Zero-DRM</strong> berarti buku yang Anda beli tidak dikunci oleh software proprietary yang membatasi hak Anda membaca di aplikasi mana pun. Anda memiliki kebebasan penuh menyimpan berkas di cloud storage pribadi, e-reader offline, atau perangkat pilihan Anda.
                </p>
                <p className="text-xs text-slate-500">
                    Lisensi ini bersifat personal dan abadi (perpetual personal license). Anda tidak diperkenankan menjual kembali atau mendistribusikan berkas secara publik kepada pihak ketiga.
                </p>
            </div>
        ),
    },
];

export default function Faq() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'pay-1': true, 'download-1': true });

    const toggleItem = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return FAQ_DATA;
        const q = searchQuery.toLowerCase();
        return FAQ_DATA.filter(
            (item) =>
                item.question.toLowerCase().includes(q) ||
                item.keywords.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const categories = [
        { id: 'pembayaran', label: 'Pembayaran & Midtrans', icon: 'account_balance_wallet', color: 'text-indigo-600 bg-indigo-50' },
        { id: 'unduhan', label: 'Unduhan & Kuota', icon: 'cloud_download', color: 'text-emerald-600 bg-emerald-50' },
        { id: 'perangkat', label: 'Perangkat & Format', icon: 'devices', color: 'text-purple-600 bg-purple-50' },
        { id: 'lisensi', label: 'Lisensi & Zero-DRM', icon: 'verified_user', color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <StoreLayout>
            <Head title="Pusat Bantuan & Tanya Jawab Mandiri - Bookil" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-12">
                {/* Hero Search Section */}
                <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4">
                    <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        <Link href={route('products.index')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">home</span>
                            <span>Beranda</span>
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 font-bold">Pusat Bantuan</span>
                    </nav>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4 border border-indigo-100">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">support_agent</span>
                        <span>Bantuan Mandiri 24/7 &amp; Layanan Terintegrasi</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Pusat Bantuan &amp; Tanya Jawab Mandiri
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                        Temukan solusi instan seputar aktivasi lisensi, metode pembayaran Midtrans, pengelolaan kuota unduhan, dan perlindungan aset digital Anda.
                    </p>

                    {/* Central Interactive Search Bar */}
                    <div className="w-full max-w-2xl relative mb-4">
                        <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-md p-2 transition-all focus-within:shadow-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                            <span className="material-symbols-outlined text-slate-400 ml-3 text-[22px]">search</span>
                            <input
                                className="w-full bg-transparent px-3 py-2 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
                                placeholder="Cari topik, kata kunci (mis: QRIS, kuota, kindle, refund)..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors mr-1"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Suggestion Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold mr-1">Topik populer:</span>
                        {['Cara Bayar QRIS', 'Batas 5x Kuota Unduh', 'Format EPUB di iPad', 'Lisensi Zero-DRM'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSearchQuery(tag)}
                                className="px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:text-indigo-600 text-xs font-semibold text-slate-600 transition-all"
                                type="button"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Quick Topic Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => setSearchQuery(cat.id === 'pembayaran' ? 'pembayaran' : cat.id)}
                            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
                        >
                            <div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${cat.color}`}>
                                    <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors mb-1">
                                    {cat.label}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Lihat jawaban dan petunjuk teknis seputar {cat.label.toLowerCase()}.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-indigo-600">
                                <span>Eksplorasi Topik</span>
                                <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Accordion FAQ List */}
                <section className="max-w-4xl mx-auto w-full space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900">
                            Pertanyaan yang Sering Diajukan ({filteredFaqs.length})
                        </h2>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                                Tampilkan Semua
                            </button>
                        )}
                    </div>

                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
                            <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">search_off</span>
                            <h3 className="text-base font-bold text-slate-900">Tidak ada pertanyaan yang cocok</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                Coba gunakan kata kunci lain atau langsung hubungi tim dukungan kami di bawah.
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                Reset Pencarian
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => {
                                const isOpen = !!openItems[faq.id];
                                return (
                                    <div
                                        key={faq.id}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
                                    >
                                        <button
                                            onClick={() => toggleItem(faq.id)}
                                            className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                                            type="button"
                                        >
                                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                                                {faq.question}
                                            </span>
                                            <span
                                                className={`material-symbols-outlined text-slate-400 text-[22px] transition-transform duration-200 ${
                                                    isOpen ? 'rotate-180 text-indigo-600' : ''
                                                }`}
                                            >
                                                expand_more
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-slate-100/80">
                                                <div className="pt-4">{faq.answer}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Support Contact Grid */}
                <section className="bg-slate-900 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-4 border border-indigo-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Customer Care Active
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                            Butuh Bantuan Langsung dari Tim Kami?
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed mb-6">
                            Jika Anda mengalami kendala pembayaran, butuh reset kuota unduh darurat, atau pertanyaan seputar faktur institusi, tim kami siap membantu.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">mail</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Email Helpdesk</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">support@bookil.com</p>
                                    <p className="text-[11px] text-indigo-300 mt-1">Balasan &lt; 2 jam di hari kerja</p>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">chat</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">WhatsApp Care</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">+62 812-3456-7890</p>
                                    <p className="text-[11px] text-emerald-300 mt-1">Senin - Minggu 08:00 - 22:00 WIB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </StoreLayout>
    );
}
