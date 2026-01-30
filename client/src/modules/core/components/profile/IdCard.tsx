import { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { Download, RotateCw, CheckCircle, Shield, User, MapPin } from 'lucide-react';
import SIPText from '@/modules/core/components/ui/SIPText';

interface IdCardProps {
    user: {
        name: string;
        coreId?: string;
        role: string | string[];
        provinceName?: string;
        cityName?: string;
        photoUrl?: string;
        status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
        clubName?: string;
        division?: string;
    };
}

const ROLE_COLORS: Record<string, string> = {
    ATHLETE: 'bg-blue-500',
    COACH: 'bg-emerald-500',
    JUDGE: 'bg-indigo-500',
    ADMIN: 'bg-red-500',
    SUPER_ADMIN: 'bg-purple-500',
};

export default function IdCard({ user }: IdCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const roles = Array.isArray(user.role) ? user.role : [user.role];
    const qrValue = `${window.location.origin}/verify/${user.coreId || 'unknown'}`;

    return (
        <div className="flex flex-col items-center">
            {/* 3D Container */}
            <div
                className="relative w-[350px] h-[220px] cursor-pointer group mx-auto"
                style={{ perspective: '1500px' }}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 60, damping: 20 }}
                >
                    {/* FRONT FACE */}
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] bg-[#030712] text-white border border-white/10"
                        style={{ backfaceVisibility: 'hidden', zIndex: 2 }}
                    >
                        {/* Holographic Shine */}
                        <motion.div
                            className="absolute inset-0 z-10 pointer-events-none opacity-20"
                            animate={{
                                background: [
                                    "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.2) 25%, transparent 30%)",
                                    "linear-gradient(110deg, transparent 70%, rgba(255,255,255,0.2) 75%, transparent 80%)"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Premium Mesh Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-amber-500/10 blur-[100px] rounded-full" />
                            <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full" />
                            <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-purple-500/5 blur-[80px] rounded-full" />

                            {/* Layered Patterns */}
                            <div className="absolute inset-0 opacity-[0.03] grayscale invert"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
                                    backgroundSize: '40px'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative h-full p-5 flex flex-col justify-between">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-lg" />
                                        <div className="relative w-10 h-10 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
                                            <img src="/logo.png" alt="CSystem" className="w-full h-full object-contain brightness-110 drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-[0.3em] text-amber-500 leading-none mb-1">C-System CORE</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                            <p className="text-[10px] font-black italic uppercase tracking-widest text-white/90">Official Digital License</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md px-2 py-0.5 mb-1">
                                        <p className="font-mono text-[11px] font-black tracking-widest text-white/80">{user.coreId || 'PENDING'}</p>
                                    </div>
                                    <p className="text-[7px] opacity-40 uppercase font-black tracking-[0.4em] mr-1">Identity ID</p>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex gap-5 items-center my-1">
                                {/* Photo Container */}
                                <div className="relative group">
                                    <div className="absolute -inset-1.5 bg-gradient-to-br from-amber-500/20 to-blue-500/20 blur-md rounded-xl opacity-50 transition-all duration-500 group-hover:opacity-100" />
                                    <div className="relative w-22 h-26 rounded-xl bg-dark-900 border-2 border-white/10 flex-shrink-0 overflow-hidden shadow-2xl">
                                        {user.photoUrl ? (
                                            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-dark-800 to-dark-950">
                                                <User className="text-dark-600 w-12 h-12" />
                                            </div>
                                        )}
                                        {/* Status Dot Overlay */}
                                        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-dark-900 shadow-lg bg-emerald-500" />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div>
                                        <h3 className="font-black text-lg leading-none truncate text-white uppercase italic tracking-tight drop-shadow-lg mb-1.5">
                                            {user.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {roles.map((r, idx) => (
                                                <span key={idx} className={`px-2 py-0.5 rounded text-[8px] font-black ${ROLE_COLORS[r.toUpperCase()] || 'bg-amber-600'} text-white uppercase italic tracking-[0.1em] shadow-lg border border-white/10`}>
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pr-2">
                                        <div className="space-y-1">
                                            <p className="text-[7px] text-dark-500 font-black uppercase tracking-widest">Verification</p>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500/90 italic">
                                                <Shield size={10} />
                                                CORE COMPLIANT
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[7px] text-dark-500 font-black uppercase tracking-widest">Attendance</p>
                                            <div className="flex items-center gap-1.5 justify-end text-[9px] font-bold text-emerald-400/90 italic">
                                                <CheckCircle size={10} />
                                                READY
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-end border-t border-white/5 pt-3">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-dark-600 font-black uppercase tracking-widest leading-none mb-0.5">Location</span>
                                        <div className="flex items-center gap-1 text-[9px] text-dark-300 font-bold uppercase tracking-tighter">
                                            <MapPin size={8} className="text-amber-500" />
                                            {user.cityName || 'Indonesia'}
                                        </div>
                                    </div>
                                    {user.division && (
                                        <div className="flex flex-col border-l border-white/10 pl-4">
                                            <span className="text-[7px] text-dark-600 font-black uppercase tracking-widest leading-none mb-0.5">Division</span>
                                            <div className="text-[9px] text-dark-300 font-bold uppercase tracking-tighter italic">
                                                {user.division}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] text-amber-500 font-black uppercase tracking-widest animate-pulse">Security Mirror</span>
                                        <span className="text-[6px] text-dark-600 font-black tracking-[0.3em]">TAP TO VERIFY</span>
                                    </div>
                                    <div className="bg-amber-500/10 p-1 rounded-md border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                                        <RotateCw size={12} className="text-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK FACE (SECURITY) */}
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-[#020617] text-white border border-white/10"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', zIndex: 1 }}
                    >
                        {/* Security Pattern */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0l43.3 25v50L50 100 6.7 75V25z' fill-opacity='1' fill='%23f59e0b'/%3E%3C/svg%3E")`,
                                backgroundSize: '100px'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-blue-500/5" />

                        <div className="h-full p-6 flex flex-col items-center justify-between relative">
                            {/* Security Header */}
                            <div className="w-full flex justify-between items-center bg-white/5 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Encrypted Security Access</span>
                                </div>
                                <span className="text-[9px] font-mono tracking-widest text-dark-400">{user.coreId}</span>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="absolute -inset-6 bg-amber-500/10 blur-3xl rounded-full" />
                                    <div className="bg-white p-3 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] relative border-[6px] border-white overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                        <QRCode
                                            value={qrValue}
                                            size={100}
                                            level="H"
                                            includeMargin={false}
                                            renderAs="svg"
                                            imageSettings={{
                                                src: "/logo.png",
                                                x: undefined,
                                                y: undefined,
                                                height: 24,
                                                width: 24,
                                                excavate: true,
                                            }}
                                        />
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-4 border-[#020617] shadow-xl">
                                        <CheckCircle size={20} className="text-dark-950" />
                                    </div>
                                </div>

                                <div className="text-center group-hover:translate-y-[-5px] transition-transform duration-500">
                                    <h3 className="text-white font-black text-base uppercase italic tracking-tight mb-2 drop-shadow-lg">CORE GATEWAY VERIFIED</h3>
                                    <div className="flex items-center gap-2 justify-center mb-3">
                                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest">Attendance System</span>
                                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black text-blue-400 uppercase tracking-widest">Verify Access</span>
                                    </div>
                                    <p className="text-[10px] text-dark-500 font-medium max-w-[240px] leading-relaxed mx-auto">
                                        This ID grants official access to competition zones and automated attendance recording via C-System CORE Gateway.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full flex justify-between items-end border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <img src="/logo.png" className="w-4 h-4 brightness-50 grayscale" alt="SIP" />
                                    <p className="text-[8px] text-dark-600 font-black uppercase tracking-[0.3em] flex items-center gap-1">
                                        © 2026 Corelink - <SIPText size="xs" isUppercase={true} className="!tracking-[0.3em]" />
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                                    className="flex items-center gap-2 text-amber-500/40 hover:text-amber-500 font-black italic text-[9px] transition-colors uppercase tracking-widest"
                                >
                                    <RotateCw size={10} />
                                    Profile View
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Premium Actions */}
            <div className="mt-10 flex gap-4">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-dark-800/50 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 transition-all font-black text-[10px] text-white uppercase italic tracking-[0.2em] group"
                >
                    <Download size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    Download License PDF
                </button>
            </div>

            {/* Print Layout Optimization */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body * { visibility: hidden; }
                    .card-print-area { visibility: visible; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
                }
            `}</style>
        </div>
    );
}
