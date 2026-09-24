import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Daftar Akun Baru"
            subtitle="Bergabunglah dengan 10.000+ pembaca dan nikmati akses koleksi digital resmi."
        >
            <Head title="Daftar Akun — Bookil" />

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>Periksa kembali data formulir:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                        {Object.values(errors).map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tab Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
                <Link
                    href={route('login')}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Masuk Akun
                </Link>
                <span className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-white text-indigo-700 shadow-sm">
                    Daftar Baru
                </span>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-3 text-[18px]">
                            person
                        </span>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Rizqi Pratama"
                            autoComplete="name"
                            required
                            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Email Address */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-3 text-[18px]">
                            mail
                        </span>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            autoComplete="username"
                            required
                            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kata Sandi
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-3 text-[18px]">
                            lock
                        </span>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter aman"
                            autoComplete="new-password"
                            required
                            className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Password Confirmation */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-3 text-[18px]">
                            lock_clock
                        </span>
                        <input
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Ulangi kata sandi Anda"
                            autoComplete="new-password"
                            required
                            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Mendaftarkan Akun...</span>
                            </>
                        ) : (
                            <>
                                <span>Buat Akun Bookil Gratis</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Footer Switch */}
                <div className="text-center pt-3 text-xs text-slate-500">
                    Sudah memiliki akun?{' '}
                    <Link
                        href={route('login')}
                        className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        Masuk di sini
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
