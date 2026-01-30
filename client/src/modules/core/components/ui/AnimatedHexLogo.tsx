import React from 'react';

interface AnimatedHexLogoProps {
    size?: string | number;
    className?: string;
}

/**
 * Standardized Animated Hexagon Logo for the entire SIP ecosystem.
 * Uses CSS clip-path for high performance and clean pixel-perfect rendering.
 */
const AnimatedHexLogo: React.FC<AnimatedHexLogoProps> = ({ size = 40, className = "" }) => {
    const hexClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

    // Handle size logic
    const isTailwindSize = typeof size === 'string' && size.startsWith('w-');
    const style: React.CSSProperties = !isTailwindSize
        ? { width: size, height: size }
        : {};

    const finalClassName = isTailwindSize ? `${size} ${className}` : className;

    return (
        <div
            className={`relative flex justify-center items-center ${finalClassName}`}
            style={{
                ...style,
                clipPath: hexClipPath
            }}
        >
            {/* Spinning Gold Border - Adjusted for sharp segment feel */}
            <div
                className="absolute inset-[-100%]"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, transparent 80%, #fbbf24 90%, #fbbf24 95%, transparent 100%)',
                    animation: 'spin 3s linear infinite'
                }}
            />
            {/* Inner Background */}
            <div
                className="absolute inset-[2px] bg-dark-950"
                style={{ clipPath: hexClipPath }}
            />
            {/* Logo */}
            <div className="w-[85%] h-[85%] flex items-center justify-center relative z-10">
                <img
                    src="/assets/csystem-logo.png"
                    alt="C-SYSTEM Logo"
                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                />
            </div>
        </div>
    );
};

export default AnimatedHexLogo;
