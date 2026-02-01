import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Search, CheckCircle, RefreshCw, ArrowLeft, Database, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScanItem {
    id: string;
    slug: string;
    name: string;
    details?: string;
    routePath?: string;
}

export default function DataIntegrityLab() {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<Record<string, ScanItem[]>>({});
    const [verifiedIds, setVerifiedIds] = useState<string[]>([]);

    // Unified Mock Data - Consolidated to prevent terminology redundancy
    const MOCK_DATA: ScanItem[] = [
        { id: '1', slug: 'onboarding-premium', name: 'Premium Onboarding', details: 'Standard User Registration Flow (Production)', routePath: '/?step=greeting' },
        { id: '3', slug: 'bleep-test', name: 'Pro Bleep Test Engine', details: 'Unified Cardiovascular Assessment Protocol', routePath: '/labs/bleep-test' },
        { id: '5', slug: 'dropdown-search', name: 'Dropdown Search Control', details: 'Unified UI Component Lab', routePath: '/labs/dropdown-search' },
    ];

    const runScan = () => {
        setIsScanning(true);
        setScanResults({});
        setVerifiedIds([]);

        setTimeout(() => {
            const duplicates: Record<string, ScanItem[]> = {};
            const nameGroups: Record<string, ScanItem[]> = {};
            MOCK_DATA.forEach(item => {
                if (!nameGroups[item.name]) nameGroups[item.name] = [];
                nameGroups[item.name].push(item);
            });

            Object.entries(nameGroups).forEach(([name, items]) => {
                if (items.length > 1) duplicates[name] = items;
            });

            setScanResults(duplicates);
            setIsScanning(false);
        }, 1200);
    };

    const toggleVerify = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setVerifiedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleOpenFeature = (path?: string) => {
        if (!path) return;
        window.open(path, '_blank');
    };

    const duplicateCount = Object.keys(scanResults).length;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <button
                onClick={() => navigate('/labs')}
                className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Sandbox
            </button>

            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                        Integrità Hub
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                        <span className="text-emerald-400 font-bold tracking-widest uppercase">Verification Active.</span> Gunakan tombol panah <ExternalLink size={12} className="inline mx-1" /> untuk audit visual, lalu tandai sebagai terverifikasi.
                    </p>
                </div>

                <button
                    onClick={runScan}
                    disabled={isScanning}
                    className={`
                        px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3
                        ${isScanning ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 hover:bg-cyan-400 active:scale-95'}
                    `}
                >
                    {isScanning ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />}
                    {isScanning ? 'Auditing...' : 'Start Audit'}
                </button>
            </header>

            <main className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="py-24 flex flex-col items-center gap-6"
                        >
                            <div className="w-80 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                />
                            </div>
                            <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Running Integrity Audit Protocol</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-12">
                            {duplicateCount > 0 && (
                                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] flex items-center justify-between shadow-2xl">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                                                {duplicateCount} Cluster Conflicts
                                            </h3>
                                            <p className="text-slate-500 text-sm">Review identified duplicates via the external preview tool.</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-slate-950 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-tighter">Verified Progress</p>
                                        <p className="text-2xl font-black text-white leading-none tracking-tight">{verifiedIds.length}<span className="text-slate-800 mx-1">/</span>{Object.values(scanResults).flat().length}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-14 pb-24">
                                {Object.entries(scanResults).map(([name, items]) => (
                                    <div key={name} className="space-y-6">
                                        <div className="flex items-center gap-4 px-2">
                                            <div className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-widest leading-none flex items-center justify-center min-w-[2.5rem] h-6">{items.length}</div>
                                            <h4 className="text-lg font-black text-slate-400 uppercase tracking-[0.2em]">{name}</h4>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {items.map(item => {
                                                const isVerified = verifiedIds.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`
                                                            group relative p-6 rounded-[32px] border transition-all duration-300 overflow-hidden
                                                            ${isVerified
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                                                                : 'bg-slate-900/40 border-slate-800 shadow-xl'}
                                                        `}
                                                    >
                                                        <div className="relative flex items-center justify-between">
                                                            <div className="flex items-center gap-6">
                                                                {/* INFORMATION AREA FIRST */}
                                                                <div className="min-w-0">
                                                                    <p className={`text-[10px] font-black uppercase tracking-[2px] mb-1.5 transition-colors ${isVerified ? 'text-emerald-400' : 'text-slate-500 font-mono'}`}>
                                                                        {isVerified ? '✓ VERIFIED IDENTITY' : item.slug}
                                                                    </p>
                                                                    <div className="flex items-center gap-3">
                                                                        <h5 className={`text-xl font-bold transition-colors ${isVerified ? 'text-white' : 'text-slate-200'} tracking-tight truncate`}>
                                                                            {item.details}
                                                                        </h5>

                                                                        {/* ACTION ICON IMMEDIATELY NEXT TO TEXT */}
                                                                        <button
                                                                            onClick={() => handleOpenFeature(item.routePath)}
                                                                            className={`
                                                                                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                                                                ${isVerified
                                                                                    ? 'text-emerald-500/50 bg-emerald-500/10 hover:text-emerald-400 hover:bg-emerald-500/20'
                                                                                    : 'text-slate-600 bg-slate-950/50 hover:text-cyan-400 hover:bg-cyan-400/10 hover:scale-110'}
                                                                            `}
                                                                            title="Live Preview (New Tab)"
                                                                        >
                                                                            <ExternalLink size={18} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* SYSTEM ACTIONS ON THE RIGHT */}
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={(e) => toggleVerify(e, item.id)}
                                                                    className={`
                                                                        w-14 h-14 rounded-[22px] flex items-center justify-center border transition-all
                                                                        ${isVerified
                                                                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                                                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-white hover:border-white/20 hover:scale-105'}
                                                                    `}
                                                                    title={isVerified ? "Undo Verification" : "Verify Cluster Entity"}
                                                                >
                                                                    <CheckCircle size={26} strokeWidth={isVerified ? 3 : 2} />
                                                                </button>
                                                                <div className="w-14 h-14 rounded-[22px] bg-slate-950/20 border border-white/5 flex items-center justify-center text-slate-800 opacity-20 cursor-not-allowed">
                                                                    <Trash2 size={24} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Subtle background glow on hover */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
