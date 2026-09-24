import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-lg">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
                    <h3>Hapus Akun Permanen</h3>
                </div>

                <p className="mt-1 text-xs text-rose-600/90 leading-relaxed">
                    Tindakan ini tidak dapat dibatalkan. Menghapus akun akan menghapus riwayat lisensi, token unduhan, dan akses ke e-book yang telah Anda beli. Pastikan Anda telah mengunduh semua berkas e-book sebelum melanjutkan.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm">
                Hapus Akun Saya
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Konfirmasi Penghapusan Akun
                            </h2>
                            <p className="text-xs text-slate-500">
                                Harap masukkan kata sandi Anda untuk mengonfirmasi tindakan ini.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi Akun"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="block w-full h-11 rounded-xl border-slate-200 text-sm focus:border-rose-500 focus:ring-rose-500 shadow-sm"
                            isFocused
                            placeholder="Ketik kata sandi untuk konfirmasi..."
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="rounded-xl px-5 py-2.5 text-xs font-bold">
                            Batalkan
                        </SecondaryButton>

                        <DangerButton className="rounded-xl px-5 py-2.5 text-xs font-bold" disabled={processing}>
                            {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
