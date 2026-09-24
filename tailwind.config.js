import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Figtree', ...defaultTheme.fontFamily.sans],
                body: ['"Plus Jakarta Sans"', 'sans-serif'],
                headline: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                surface: '#faf8ff',
                'surface-dim': '#d2d9f4',
                'surface-bright': '#faf8ff',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#f2f3ff',
                'surface-container': '#eaedff',
                'surface-container-high': '#e2e7ff',
                'surface-container-highest': '#dae2fd',
                'on-surface': '#131b2e',
                'on-surface-variant': '#464555',
                'inverse-surface': '#283044',
                'inverse-on-surface': '#eef0ff',
                outline: '#777587',
                'outline-variant': '#c7c4d8',
                'surface-tint': '#4d44e3',
                'brand-primary': '#3525cd',
                'brand-primary-container': '#4f46e5',
                'brand-secondary': '#4648d4',
                'brand-tertiary': '#005338',
            },
        },
    },

    plugins: [forms],
};
