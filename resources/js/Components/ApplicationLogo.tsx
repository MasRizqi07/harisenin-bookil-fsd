import { SVGAttributes } from 'react';

interface ApplicationLogoProps extends SVGAttributes<SVGElement> {
    iconOnly?: boolean;
    lightText?: boolean;
}

export default function ApplicationLogo({
    iconOnly = false,
    lightText = false,
    className = 'h-9 w-auto',
    ...props
}: ApplicationLogoProps) {
    if (iconOnly) {
        return (
            <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                {...props}
            >
                <defs>
                    <linearGradient id="bookil_icon_grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#4338CA" />
                    </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#bookil_icon_grad)" />
                <path
                    d="M24 16C21.8 14.7 18.9 14.5 16 15V32C18.9 31.5 21.8 31.7 24 33M24 16C26.2 14.7 29.1 14.5 32 15V32C29.1 31.5 26.2 31.7 24 33M24 16V33"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 180 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <defs>
                <linearGradient id="bookil_full_grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>
            </defs>
            <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#bookil_full_grad)" />
            <path
                d="M24 16C21.8 14.7 18.9 14.5 16 15V32C18.9 31.5 21.8 31.7 24 33M24 16C26.2 14.7 29.1 14.5 32 15V32C29.1 31.5 26.2 31.7 24 33M24 16V33"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <text
                x="52"
                y="32"
                fontFamily="'Plus Jakarta Sans', 'Figtree', sans-serif"
                fontSize="24"
                fontWeight="800"
                fill={lightText ? '#FFFFFF' : '#0F172A'}
                letterSpacing="-0.03em"
            >
                Bookil<tspan fill="#4F46E5">.</tspan>
            </text>
        </svg>
    );
}
