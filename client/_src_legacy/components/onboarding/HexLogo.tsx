import React from 'react';

const HexLogo: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <img
                src="/assets/csystem-logo.png"
                alt="C-SYSTEM Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />
        </div>
    );
};

export default HexLogo;
