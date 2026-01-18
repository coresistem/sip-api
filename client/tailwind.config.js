/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        // Custom breakpoints for better RWD (mobile-first)
        screens: {
            'xs': '375px',    // Small phones
            'sm': '640px',    // Large phones / small tablets
            'md': '768px',    // Tablets
            'lg': '1024px',   // Laptops / small desktops
            'xl': '1280px',   // Desktops
            '2xl': '1536px',  // Large desktops
            // Touch device utilities
            'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
            'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
            // Orientation utilities
            'portrait': { 'raw': '(orientation: portrait)' },
            'landscape': { 'raw': '(orientation: landscape)' },
            // Height-based breakpoints (useful for landscape mobile)
            'short': { 'raw': '(max-height: 600px)' },
            'tall': { 'raw': '(min-height: 800px)' },
        },
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                accent: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                    950: '#4a044e',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            // Responsive spacing values
            spacing: {
                '4.5': '1.125rem',
                '5.5': '1.375rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '18': '4.5rem',
                '22': '5.5rem',
                'safe-top': 'env(safe-area-inset-top, 0)',
                'safe-bottom': 'env(safe-area-inset-bottom, 0)',
                'safe-left': 'env(safe-area-inset-left, 0)',
                'safe-right': 'env(safe-area-inset-right, 0)',
            },
            // Minimum touch target sizes
            minWidth: {
                'touch': '44px',
                'touch-lg': '48px',
            },
            minHeight: {
                'touch': '44px',
                'touch-lg': '48px',
            },
            // Fluid font sizes
            fontSize: {
                'fluid-xs': 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)',
                'fluid-sm': 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)',
                'fluid-base': 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                'fluid-lg': 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)',
                'fluid-xl': 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)',
                'fluid-2xl': 'clamp(1.25rem, 1rem + 1vw, 1.875rem)',
                'fluid-3xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(14, 165, 233, 0.6)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            // Container configuration
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '1.5rem',
                    lg: '2rem',
                    xl: '2.5rem',
                    '2xl': '3rem',
                },
            },
            // Aspect ratios for responsive media
            aspectRatio: {
                'mobile': '9 / 16',
                'tablet': '4 / 3',
                'desktop': '16 / 9',
            },
        },
    },
    plugins: [],
}
