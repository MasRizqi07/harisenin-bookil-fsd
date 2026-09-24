import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Lupa Kata Sandi?"
            subtitle="Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi akun."
        >
            <Head title="Pemulihan Kata Sandi — Bookil" />

            {status && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    {status}
                </div>
            )}

            {errors.email && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                    {errors.email}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email Akun
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

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Mengirim Tautan...</span>
                            </>
                        ) : (
                            <>
                                <span>Kirim Tautan Reset Sandi</span>
                                <span className="material-symbols-outlined text-[16px]">send</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center pt-3 text-xs text-slate-500">
                    Ingat kata sandi Anda?{' '}
                    <Link
                        href={route('login')}
                        className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        Kembali ke Masuk
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
