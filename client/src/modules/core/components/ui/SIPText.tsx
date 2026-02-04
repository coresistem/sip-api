import React from 'react';

interface SIPTextProps {
    className?: string;
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    isUppercase?: boolean;
    variant?: 'default' | 'legal';
    children?: React.ReactNode;
}

const SIPText: React.FC<SIPTextProps> = ({
    className = '',
    size = 'base',
    isUppercase = false,
    variant = 'default',
    children
}) => {
    const sizeClasses = {
        // ... (unchanged)
        'xs': 'text-[10px]',
        'sm': 'text-xs',
        'base': 'text-base',
        'lg': 'text-lg',
        'xl': 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
    };

    if (children) {
        return (
            <span className={`${sizeClasses[size]} tracking-tight ${className}`}>
                {children}
            </span>
        );
    }

    // ... (rest of the component)

    const s = isUppercase ? 'S' : 'S';
    const istem = isUppercase ? 'ISTEM' : 'istem';
    const i = isUppercase ? 'I' : 'I';
    const ntegrasi = isUppercase ? 'NTEGRASI' : 'ntegrasi';
    const p = isUppercase ? 'P' : 'P';
    const anahan = isUppercase ? 'ANAHAN' : 'anahan';

    if (variant === 'legal') {
        const outlineStyle = {
            // Using multiple shadows instead of stroke to avoid internal line artifacts in P, B, R
            textShadow: `
                -0.5px -0.5px 0 #92400E,  
                 0.5px -0.5px 0 #92400E,
                -0.5px  0.5px 0 #92400E,
                 0.5px  0.5px 0 #92400E,
                 0.5px  0.5px 1px rgba(146, 64, 14, 0.2)
            `,
        };

        return (
            <span
                className={`${sizeClasses[size]} font-bold tracking-tight ${className}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                <span style={outlineStyle} className="text-amber-400 font-black mr-[0.5px]">{s}</span>
                <span className="text-blue-600">{istem}</span>{' '}
                <span style={outlineStyle} className="text-amber-400 font-black mr-[0.5px]">{i}</span>
                <span className="text-blue-600">{ntegrasi}</span>{' '}
                <span style={outlineStyle} className="text-amber-400 font-black mr-[0.5px]">{p}</span>
                <span className="text-blue-600">{anahan}</span>
            </span>
        );
    }

    return (
        <span className={`${sizeClasses[size]} font-bold tracking-tight text-white ${className}`}>
            <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] font-black">{s}</span>{istem}{' '}
            <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] font-black">{i}</span>{ntegrasi}{' '}
            <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] font-black">{p}</span>{anahan}
        </span>
    );
};

export default SIPText;
