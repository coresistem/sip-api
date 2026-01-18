import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Award } from 'lucide-react';

interface Badge {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    earnedAt?: string; // If present, badge is unlocked
}

interface BadgeShowcaseProps {
    badges: Badge[];
}

export default function BadgeShowcase({ badges }: BadgeShowcaseProps) {
    // Separate earned vs unearned logic would be handled by parent or here
    // For now assuming passed badges are a mix or all (with earnedAt flag)

    // Mocking some "Locked" badges if not enough data
    const displayBadges = badges.length > 0 ? badges : [
        { id: '1', code: 'FIRST_SCORE', name: 'First Blood', description: 'Log your first score', icon: 'target', earnedAt: undefined },
        { id: '2', code: '100_ARROWS', name: 'Centurion', description: 'Shoot 100 arrows', icon: 'target', earnedAt: undefined },
        { id: '3', code: 'LEVEL_5', name: 'Rising Star', description: 'Reach Level 5', icon: 'star', earnedAt: undefined },
    ];

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {displayBadges.map((badge, index) => {
                    const isUnlocked = !!badge.earnedAt;
                    return (
                        <motion.div
                            key={badge.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col items-center text-center group ${isUnlocked ? 'cursor-pointer' : 'opacity-50 grayscale'}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 relative ${isUnlocked ? 'bg-gradient-to-br from-dark-700 to-dark-600 border border-yellow-500/30 group-hover:border-yellow-500 shadow-lg shadow-yellow-500/10' : 'bg-dark-800 border border-dark-700'}`}>
                                {isUnlocked ? (
                                    <Award className="w-8 h-8 text-yellow-400" />
                                ) : (
                                    <Lock className="w-6 h-6 text-dark-500" />
                                )}

                                {isUnlocked && (
                                    <div className="absolute inset-0 bg-yellow-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                            <span className={`text-xs font-medium truncate w-full ${isUnlocked ? 'text-gray-200' : 'text-dark-500'}`}>
                                {badge.name}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
