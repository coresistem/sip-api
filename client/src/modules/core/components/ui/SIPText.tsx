import React from 'react';

interface SIPTextProps {
    className?: string;
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    isUppercase?: boolean;
}

const SIPText: React.FC<SIPTextProps> = ({ className = '', size = 'base', isUppercase = false }) => {
    const sizeClasses = {
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

    const s = isUppercase ? 'S' : 'S';
    const istem = isUppercase ? 'ISTEM' : 'istem';
    const i = isUppercase ? 'I' : 'I';
    const ntegrasi = isUppercase ? 'NTEGRASI' : 'ntegrasi';
    const p = isUppercase ? 'P' : 'P';
    const anahan = isUppercase ? 'ANAHAN' : 'anahan';

    return (
        <span className={`${sizeClasses[size]} font-bold tracking-tight text-white ${className}`}>
            <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] font-black">{s}</span>{istem}{' '}
            <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] font-black">{i}</span>{ntegrasi}{' '}
            <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] font-black">{p}</span>{anahan}
        </span>
    );
};

export default SIPText;
