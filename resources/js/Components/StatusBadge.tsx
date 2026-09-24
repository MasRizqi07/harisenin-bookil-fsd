import React from 'react';

export type StatusType = 'paid' | 'pending' | 'failed' | 'expired' | 'settlement' | 'capture';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
    className?: string;
}

export default function StatusBadge({
    status,
    size = 'md',
    className = '',
}: StatusBadgeProps) {
    const normalized = status.toLowerCase();

    const isSuccess = normalized === 'paid' || normalized === 'settlement' || normalized === 'capture';
    const isWarning = normalized === 'pending';
    const isDanger = normalized === 'failed' || normalized === 'deny' || normalized === 'cancel';
    const isExpired = normalized === 'expired' || normalized === 'expire';

    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

    if (isSuccess) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80 shadow-sm ${sizeClasses} ${className}`}
            >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span>Lunas</span>
            </span>
        );
    }

    if (isWarning) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/80 shadow-sm ${sizeClasses} ${className}`}
            >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Menunggu Pembayaran</span>
            </span>
        );
    }

    if (isExpired) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200 shadow-sm ${sizeClasses} ${className}`}
            >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <span>Kedaluwarsa</span>
            </span>
        );
    }

    if (isDanger) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200/80 shadow-sm ${sizeClasses} ${className}`}
            >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                <span>Gagal</span>
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 ${sizeClasses} ${className}`}
        >
            <span className="capitalize">{status}</span>
        </span>
    );
}
