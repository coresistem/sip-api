import React, { createContext, useContext, useState, ReactNode } from 'react';

type WaveEffect = {
    active: boolean;
    x: number;
    y: number;
    startTime: number;
};

interface BackgroundEffectContextType {
    wave: WaveEffect;
    triggerWave: (x: number, y: number) => void;
}

const BackgroundEffectContext = createContext<BackgroundEffectContextType | undefined>(undefined);

export const BackgroundEffectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wave, setWave] = useState<WaveEffect>({ active: false, x: 0, y: 0, startTime: 0 });

    const triggerWave = (x: number, y: number) => {
        setWave({
            active: true,
            x,
            y,
            startTime: Date.now()
        });

        // Reset wave after animation duration (e.g., 2 seconds)
        setTimeout(() => {
            setWave(prev => ({ ...prev, active: false }));
        }, 2000);
    };

    return (
        <BackgroundEffectContext.Provider value={{ wave, triggerWave }}>
            {children}
        </BackgroundEffectContext.Provider>
    );
};

export const useBackgroundEffect = () => {
    const context = useContext(BackgroundEffectContext);
    if (!context) {
        throw new Error('useBackgroundEffect must be used within a BackgroundEffectProvider');
    }
    return context;
};
