import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger': return <AlertTriangle className="w-6 h-6 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
            case 'success': return <CheckCircle className="w-6 h-6 text-green-400" />;
            default: return <Info className="w-6 h-6 text-blue-400" />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (variant) {
            case 'danger': return 'bg-red-500 hover:bg-red-600 text-white';
            case 'warning': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'success': return 'bg-green-500 hover:bg-green-600 text-white';
            default: return 'bg-primary-500 hover:bg-primary-600 text-white';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="w-full max-w-sm overflow-hidden bg-dark-800 border border-dark-700 rounded-xl shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full bg-dark-700/50 border border-dark-600 shrink-0`}>
                                    {getIcon()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                                    <p className="text-dark-300 text-sm leading-relaxed">{message}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-dark-300 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-lg shadow-black/20 ${getConfirmButtonClass()}`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
