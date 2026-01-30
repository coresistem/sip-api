import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, User, MapPin, RotateCw, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';

// --- DESIGN AWAL (MODERN HEXAGON - BLUE EDITION) ---
const OriginalDesign = ({ user }: any) => {
    const [flipped, setFlipped] = useState(false);
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="px-5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl shadow-xl">
                <p className="text-blue-400 font-bold uppercase text-[11px] tracking-[0.2em] flex items-center gap-2 leading-none">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    DESIGN AWAL (ORIGINAL)
                </p>
            </div>
            <div
                className="relative w-[350px] h-[220px] cursor-pointer"
                onClick={() => setFlipped(!flipped)}
                style={{ perspective: '1200px' }}
            >
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#0a1628] text-white border border-blue-500/30" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0l43.3 25v50L50 100 6.7 75V25z' fill-opacity='0.2' fill='%233b82f6' /%3E%3C/svg%3E")`,
                                backgroundSize: '80px'
                            }}
                        />
                        <div className="relative h-full p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-1.5">
                                        <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-blue-400">CORE INDONESIA</p>
                                        <p className="text-[10px] font-black italic uppercase text-white/90">Official Digital ID</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] opacity-40 uppercase font-black tracking-widest mb-1">CORE ID</p>
                                    <p className="font-mono text-xs font-bold">{user.coreId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-24 rounded-xl bg-dark-900 border border-blue-500/20 flex items-center justify-center">
                                    <User size={40} className="text-dark-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl leading-none uppercase italic mb-2">{user.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-500 text-white uppercase italic tracking-widest">ATHLETE</span>
                                        <span className="flex items-center gap-1.5 text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold border border-emerald-500/20">ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end text-[9px] text-dark-400 font-bold">
                                <p className="text-blue-400 font-black italic">VERIFIED BY CORE</p>
                                <span className="flex items-center gap-2 text-white/30"><RotateCw size={12} /> Tap to Flip</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- DESIGN BARU (PREMIUM C-SYSTEM - THE FIX) ---
const NewPremiumDesign = ({ user }: any) => {
    const [flipped, setFlipped] = useState(false);
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl shadow-xl shadow-amber-500/5">
                <p className="text-amber-500 font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-2 leading-none">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    DESIGN BARU (PREMIUM)
                </p>
            </div>
            <div
                className="relative w-[350px] h-[220px] cursor-pointer"
                onClick={() => setFlipped(!flipped)}
                style={{ perspective: '1200px' }}
            >
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 60, damping: 20 }}
                >
                    {/* Front Face */}
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] bg-[#0d121f] text-white border border-amber-500/20"
                        style={{ backfaceVisibility: 'hidden', zIndex: 2 }}
                    >
                        {/* Improved Shine Effect */}
                        <motion.div
                            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] rotate-[35deg] pointer-events-none"
                            animate={{ x: ['-50%', '100%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Background Patterns */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-amber-500/20 blur-[100px] rounded-full" />
                            <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/15 blur-[100px] rounded-full" />
                            <div className="absolute inset-0 opacity-[0.05]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0l43.3 25v50L50 100 6.7 75V25z' fill='%23ffffff' /%3E%3C/svg%3E")`,
                                    backgroundSize: '100px'
                                }}
                            />
                        </div>

                        <div className="relative h-full p-5 flex flex-col justify-between">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl">
                                        <img src="/logo.png" className="w-full h-full object-contain brightness-110 drop-shadow-xl" alt="C" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-[0.3em] text-amber-500 leading-none mb-1">C-SYSTEM CORE</p>
                                        <p className="text-[10px] font-black italic uppercase tracking-widest text-white/90">Premium Core License</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md px-2 py-0.5 mb-1">
                                        <p className="font-mono text-[10px] font-black tracking-widest text-amber-500">{user.coreId}</p>
                                    </div>
                                    <p className="text-[6px] opacity-40 uppercase font-black tracking-[0.4em] mr-1">SECURE TOKEN</p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex gap-4 items-center">
                                <div className="w-20 h-24 rounded-2xl bg-dark-950 border border-white/10 flex-shrink-0 overflow-hidden shadow-2xl relative">
                                    <div className="w-full h-full flex items-center justify-center bg-dark-800">
                                        <User size={40} className="text-dark-600" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-950 shadow-lg" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-lg leading-tight truncate text-white uppercase italic tracking-tight drop-shadow-xl mb-2">{user.name}</h3>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black bg-amber-500 text-dark-950 uppercase italic tracking-[0.1em] shadow-lg">ATHLETE</span>
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black bg-white/5 text-dark-400 border border-white/10 uppercase tracking-widest">COACH</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 border-t border-white/5 pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] text-dark-500 font-black uppercase">Gateway</span>
                                            <span className="text-[8px] font-bold text-amber-500 italic"><Shield size={8} className="inline mr-1" /> COMPLIANT</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] text-dark-500 font-black uppercase">Attendance</span>
                                            <span className="text-[8px] font-bold text-emerald-400 italic"><CheckCircle size={8} className="inline mr-1" /> READY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-end border-t border-white/10 pt-3">
                                <span className="text-[9px] text-dark-300 font-bold uppercase flex items-center gap-1.5 italic">
                                    <MapPin size={8} className="text-amber-500" /> INDONESIA BASE
                                </span>
                                <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                                    <span className="text-[7px] text-amber-500 font-black uppercase tracking-widest animate-pulse">Tap to Rotate</span>
                                    <RotateCw size={12} className="text-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function DesignComparisonPage() {
    return (
        <div className="min-h-screen bg-[#02040a] p-10 flex flex-col items-center overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="mb-20 text-center relative z-10">
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">
                    ID DESIGN <span className="text-amber-500">EVOLUTION</span>
                </h1>
                <p className="text-dark-400 font-medium italic text-lg opacity-80">
                    Bandingkan <span className="text-blue-400 underline decoration-2 underline-offset-4">Design Awal</span> vs <span className="text-amber-500 underline decoration-2 underline-offset-4">Upgrade C-System</span>
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-16 lg:gap-32 items-center relative z-20 w-full max-w-7xl">
                <OriginalDesign user={{ name: 'ARIFIN PUTRA', coreId: 'CORE.3171.A.001', role: 'ATHLETE' }} />

                <div className="hidden lg:flex flex-col items-center gap-4">
                    <div className="h-40 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <span className="text-white/20 font-black italic text-4xl">VS</span>
                    <div className="h-40 w-[1px] bg-gradient-to-t from-transparent via-white/10 to-transparent" />
                </div>

                <NewPremiumDesign user={{ name: 'ARIFIN PUTRA', coreId: 'CORE.3171.A.001', role: 'ATHLETE' }} />
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10 pb-32">
                <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-2xl">
                    <h4 className="text-blue-400 font-black uppercase text-base tracking-widest mb-6 px-1">Initial Analysis</h4>
                    <ul className="space-y-4 text-dark-300 font-medium italic">
                        <li>• Warna Blue/Navy yang solid dan sporty</li>
                        <li>• Layout hexagonal minimalis</li>
                        <li>• Fokus pada kemudahan pembacaan data</li>
                    </ul>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.05)]">
                    <h4 className="text-amber-500 font-black uppercase text-base tracking-widest mb-6 px-1">Premium Upgrade</h4>
                    <ul className="space-y-4 text-dark-200 font-medium italic">
                        <li>• Efek <span className="text-amber-500">Holographic Shine</span> anti-pemalsuan</li>
                        <li>• Branding <span className="text-amber-500">C-SYSTEM CORE</span> eksklusif</li>
                        <li>• Integrasi <span className="text-white font-bold">Smart Gateway & Attendance</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
