import React, { useState, useEffect } from 'react';
import { getCoverImageUrl } from '@/Components/ProductCard';

interface BookCoverImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    coverPath?: string | null;
    title?: string;
    fileType?: string;
    fallbackContainerClassName?: string;
}

export default function BookCoverImage({
    coverPath,
    title = 'E-Book Digital',
    fileType = 'PDF',
    fallbackContainerClassName = '',
    className = 'w-full h-full object-cover',
    ...props
}: BookCoverImageProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(
        () => (coverPath ? getCoverImageUrl(coverPath) : null)
    );

    useEffect(() => {
        setImgSrc(coverPath ? getCoverImageUrl(coverPath) : null);
    }, [coverPath]);

    const handleError = () => {
        if (imgSrc && imgSrc.startsWith('/storage/')) {
            const fallback = imgSrc.replace('/storage/', '/images/');
            if (fallback !== imgSrc) {
                setImgSrc(fallback);
                return;
            }
        }
        setImgSrc(null);
    };

    if (imgSrc) {
        return (
            <img
                src={imgSrc}
                alt={title}
                onError={handleError}
                className={className}
                {...props}
            />
        );
    }

    return (
        <div className={`w-full h-full bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-3 text-white text-center select-none ${fallbackContainerClassName}`}>
            <span className="material-symbols-outlined text-2xl text-indigo-400 mb-1">auto_stories</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 line-clamp-2 px-1">
                {title}
            </span>
            <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 uppercase tracking-widest text-slate-300">
                {fileType}
            </span>
        </div>
    );
}
