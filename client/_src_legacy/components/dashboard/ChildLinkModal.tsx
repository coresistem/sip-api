import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { api } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChildLinkModal({ isOpen, onClose, onSuccess }: Props) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        try {
            setIsLoading(true);
            const response = await api.post('/athletes/link-parent', { code });
            if (response.data.success) {
                toast.success('Successfully linked to your child!');
                setCode('');
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Link error:', error);
            toast.error(error.response?.data?.message || 'Failed to link child');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <LinkIcon className="text-primary-500" size={24} />
                                    Link Child Account
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-1.5">
                                        Invitation Code
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono text-center text-lg tracking-widest uppercase"
                                        maxLength={6}
                                    />
                                    <p className="mt-2 text-xs text-dark-400">
                                        Ask your child or their coach for the invitation code.
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !code.trim() || code.length < 6}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Check size={18} />
                                                <span>Link Account</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
