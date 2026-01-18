import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        sipId?: string;
        role: string;
    };
}

export default function WelcomeModal({ isOpen, onClose, user }: WelcomeModalProps) {
    useEffect(() => {
        if (isOpen) {
            // Fire confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-dark-900 border border-dark-700 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative mb-6">
                            <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
                                <PartyPopper className="w-10 h-10 text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">
                                Congratulations!
                            </h2>
                            <p className="text-dark-400 mt-2">
                                Your account has been successfully verified.
                            </p>
                        </div>

                        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700 mb-6">
                            <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Your SIP ID</p>
                            <p className="text-3xl font-mono font-bold text-primary-400 tracking-wider">
                                {user.sipId || 'PENDING'}
                            </p>
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                                <span className="text-xs font-medium text-primary-300">{user.role}</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
