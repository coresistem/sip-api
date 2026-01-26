import React from 'react';

interface HexLogoFrameProps {
    size?: number;
    className?: string;
}

/**
 * Hexagon-shaped logo frame with animated gold border effect.
 * Used throughout the app (sidebar, header) except onboarding page.
 */
const HexLogoFrame: React.FC<HexLogoFrameProps> = ({ size = 40, className = '' }) => {
    const hexClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

    return (
        <div
            className={`relative flex justify-center items-center ${className}`}
            style={{
                width: size,
                height: size,
                clipPath: hexClipPath
            }}
        >
            {/* Spinning Gold Border */}
            <div
                className="absolute inset-[-50%]"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 100%)',
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

export default HexLogoFrame;
