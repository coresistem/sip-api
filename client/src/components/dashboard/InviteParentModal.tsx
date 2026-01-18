import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Copy, Check, Users } from 'lucide-react';
import { api } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    athleteId: string;
}

export default function InviteParentModal({ isOpen, onClose, athleteId }: Props) {
    const [code, setCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCode = async () => {
        try {
            setIsLoading(true);
            const response = await api.post(`/athletes/${athleteId}/generate-link-code`);
            if (response.data.success) {
                setCode(response.data.code);
            }
        } catch (error) {
            console.error('Generate code error:', error);
            toast.error('Failed to generate code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success('Code copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
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
                                    <Users className="text-primary-500" size={24} />
                                    Invite Parent
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-dark-300 mb-4">
                                        Generate a unique code to link a parent account to this athlete.
                                    </p>

                                    {!code ? (
                                        <button
                                            onClick={generateCode}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                                        >
                                            {isLoading ? (
                                                <RefreshCw size={20} className="animate-spin" />
                                            ) : (
                                                <RefreshCw size={20} />
                                            )}
                                            Generate Code
                                        </button>
                                    ) : (
                                        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 relative group">
                                            <div className="text-4xl font-mono font-bold text-white tracking-widest mb-2">
                                                {code}
                                            </div>
                                            <p className="text-sm text-dark-400 mb-4">
                                                Share this code with the parent
                                            </p>

                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={handleCopy}
                                                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                                    {copied ? 'Copied' : 'Copy Code'}
                                                </button>
                                                <button
                                                    onClick={generateCode}
                                                    disabled={isLoading}
                                                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                                                    title="Generate New Code"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
