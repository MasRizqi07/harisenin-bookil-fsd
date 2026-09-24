import React from 'react';

interface QuotaProgressBarProps {
    downloadCount: number;
    maxDownloads: number;
    expiresAt?: string;
    className?: string;
}

export default function QuotaProgressBar({
    downloadCount,
    maxDownloads,
    expiresAt,
    className = '',
}: QuotaProgressBarProps) {
    const remaining = Math.max(0, maxDownloads - downloadCount);
    const percentage = Math.min(100, Math.round((downloadCount / maxDownloads) * 100));
    const isCritical = remaining <= 1;
    const isExhausted = remaining === 0;

    let barColor = 'bg-primary-container';
    if (isCritical && !isExhausted) {
        barColor = 'bg-amber-500';
    } else if (isExhausted) {
        barColor = 'bg-rose-500';
    }

    const formattedDate = expiresAt
        ? new Date(expiresAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">
                    Kuota Unduh: <strong className="text-slate-900">{downloadCount}</strong> dari {maxDownloads}
                </span>
                <span
                    className={`font-semibold ${
                        isExhausted
                            ? 'text-rose-600'
                            : isCritical
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                    }`}
                >
                    {isExhausted ? 'Kuota Habis' : `Sisa ${remaining}x`}
                </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 rounded-full ${barColor}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {formattedDate && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        Berlaku hingga:
                    </span>
                    <span className="font-medium text-slate-700">{formattedDate}</span>
                </div>
            )}
        </div>
    );
}
