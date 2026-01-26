import React from 'react';

const AnimatedHexLogo: React.FC<{
    className?: string;
    size?: string;
}> = ({ className = "", size = "w-40 h-40" }) => {
    return (
        <div
            className={`relative flex justify-center items-center shadow-2xl skew-y-0 ${size} ${className} pointer-events-auto select-none`}
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
            {/* Spinner Background - The "Gold Line" */}
            <div
                className="absolute inset-[-50%]"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 100%)',
                    animation: 'spin 3s linear infinite'
                }}
            />

            {/* Inner Background Mask */}
            <div className="absolute inset-[2px] bg-dark-950"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
            />

            {/* Logo Image */}
            <div className="w-[90%] h-[90%] p-6 flex items-center justify-center relative z-10">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                />
            </div>
        </div>
    );
};

export default AnimatedHexLogo;
