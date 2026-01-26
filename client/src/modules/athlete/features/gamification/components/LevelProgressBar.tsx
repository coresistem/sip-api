import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface LevelProgressBarProps {
    level: number;
    currentXP: number;
    nextLevelXP: number; // e.g. 1000 for Level 5
    prevLevelXP: number; // e.g. 600 for Level 4
}

export default function LevelProgressBar({ level, currentXP, nextLevelXP, prevLevelXP }: LevelProgressBarProps) {
    const levelProgress = currentXP - prevLevelXP;
    const levelRange = nextLevelXP - prevLevelXP;
    const percentage = Math.min(100, Math.max(0, (levelProgress / levelRange) * 100));

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-dark-900 font-bold text-xl shadow-lg border-2 border-yellow-200">
                        {level}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Level {level}</h3>
                        <p className="text-dark-400 text-xs">Archer Apprentice</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-primary-400 font-bold text-lg">{currentXP} <span className="text-xs text-dark-400 font-normal">XP</span></div>
                    <div className="text-xs text-dark-500">Next Level: {nextLevelXP} XP</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-dark-900/50 rounded-full overflow-hidden border border-dark-700/50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                />

                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
