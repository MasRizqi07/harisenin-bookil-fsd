import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Login({
    status,
    canResetPassword = true,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Masuk ke Akun Anda"
            subtitle="Lanjutkan akses rak buku digital dan riwayat lisensi Anda."
        >
            <Head title="Masuk ke Akun — Bookil" />

            {/* Status Feedback */}
            {status && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}

            {/* General Validation Error Summary */}
            {Object.keys(errors).length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>Terjadi kesalahan autentikasi:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                        {Object.values(errors).map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Interactive Tab Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
                <span className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-white text-indigo-700 shadow-sm">
                    Masuk Akun
                </span>
                <Link
                    href={route('register')}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Daftar Baru
                </Link>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
                {/* Email Input */}
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

                {/* Password Input */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Kata Sandi
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined text-slate-400 absolute left-3.5 top-3 text-[18px]">
                            lock
                        </span>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
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

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-600">Ingat perangkat saya</span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Memverifikasi Akun...</span>
                            </>
                        ) : (
                            <>
                                <span>Masuk ke Bookil</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Switch to Register footer */}
                <div className="text-center pt-3 text-xs text-slate-500">
                    Belum memiliki akun Bookil?{' '}
                    <Link
                        href={route('register')}
                        className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        Daftar akun sekarang
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
