import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, Check, X, Building2, ExternalLink } from 'lucide-react';

interface ReConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    activeIntegrations: {
        id: string;
        name: string;
        type: string;
    }[];
}

export default function ReConsentModal({ isOpen, onClose, onApprove, activeIntegrations }: ReConsentModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-dark-900 border border-amber-500/30 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-amber-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-2xl">
                                <Shield className="w-8 h-8 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-white">Konfirmasi Data Integrasi</h2>
                                <p className="text-sm text-amber-200/60 font-medium">Anda telah memperbarui data identitas Root.</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-dark-800/50 rounded-2xl border border-white/5">
                            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-sm text-dark-100 font-medium leading-relaxed">
                                    Sesuai dengan <strong>Kebijakan Privasi (UU PDP)</strong>, perubahan pada data sensitif (seperti NIK) memerlukan persetujuan ulang bagi entitas yang terhubung dengan Anda.
                                </p>
                                <p className="text-xs text-dark-400">
                                    Akses sebelumnya akan ditangguhkan hingga Anda memberikan persetujuan baru.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest ml-1">Entitas Terhubung:</h3>
                            <div className="space-y-2">
                                {activeIntegrations.map((entity) => (
                                    <div key={entity.id} className="flex items-center justify-between p-4 bg-dark-950/50 rounded-xl border border-white/5 group hover:border-primary-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-dark-800 rounded-lg group-hover:bg-primary-500/10 transition-colors">
                                                <Building2 className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-wide">{entity.name}</p>
                                                <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">{entity.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">Akses Tertunda</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-dark-950/50 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-2xl border border-dark-700 text-dark-300 hover:bg-dark-800 hover:text-white transition-all text-sm font-bold order-2 sm:order-1"
                        >
                            Tunda (Akses Dicabut)
                        </button>
                        <button
                            onClick={onApprove}
                            className="flex-1 px-6 py-3 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all text-sm font-bold flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            <Check size={18} strokeWidth={3} />
                            Setujui Pembagian Data
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
