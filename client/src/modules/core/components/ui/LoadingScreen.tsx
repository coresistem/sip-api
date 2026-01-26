import React from 'react';
import { motion } from 'framer-motion';
import AnimatedHexLogo from './AnimatedHexLogo';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                {/* Unified Animated Hex Logo */}
                <AnimatedHexLogo className="w-24 h-24" />
            </motion.div>
            <p className="mt-6 text-cyan-400 font-mono text-sm tracking-[0.2em] animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                LOADING SYSTEM...
            </p>
        </div>
    );
}
