import { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import { Download, RotateCw, CheckCircle, Shield } from 'lucide-react';

interface IdCardProps {
    user: {
        name: string;
        sipId?: string;
        role: string;
        provinceName?: string;
        cityName?: string;
        photoUrl?: string;
        status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
        clubName?: string;
        division?: string;
    };
}

const ROLE_COLORS: Record<string, string> = {
    ATHLETE: 'from-blue-600 to-cyan-600',
    COACH: 'from-green-600 to-emerald-600',
    JUDGE: 'from-indigo-600 to-violet-600',
    admin: 'from-red-600 to-rose-600',
    SUPER_ADMIN: 'from-red-600 to-rose-600',
    default: 'from-dark-700 to-dark-600'
};

export default function IdCard({ user }: IdCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.default;
    const qrValue = `${window.location.origin}/verify/${user.sipId || 'unknown'}`;

    // Card dimensions in pixels for display (aspect ratio 85.60 × 53.98 mm)
    // 3.370 × 2.125 inches.
    // Display Width: ~340px (at 1x) -> Height: ~214px.
    // We'll use relative units or standard Tailwind classes close to this ratio.

    return (
        <div className="flex flex-col items-center">
            {/* 3D Container */}
            <div
                className="relative w-[340px] h-[215px] cursor-pointer group perspective mx-auto"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500 ease-in-out"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                >
                    {/* FRONT FACE */}
                    <div className={`absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br ${roleColor} text-white`}>
                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                        {/* Content */}
                        <div className="relative h-full p-4 flex flex-col justify-between">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <img src="/logo.png" alt="SIP" className="w-5 h-5 object-contain" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">SIP Indonesia</p>
                                        <p className="text-xs font-bold leading-none">Official ID</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-70">SIP ID</p>
                                    <p className="font-mono text-sm font-bold tracking-tight">{user.sipId || '----'}</p>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex items-center gap-4 mt-2">
                                {/* Photo */}
                                <div className="w-20 h-20 rounded-lg bg-white/20 border-2 border-white/30 flex-shrink-0 overflow-hidden">
                                    {user.photoUrl ? (
                                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-dark-900/50">
                                            <span className="text-2xl font-bold opacity-50">{user.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text Info */}
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg leading-tight truncate">{user.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 uppercase tracking-wide">
                                            {user.role}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] bg-green-500/20 px-1.5 py-0.5 rounded text-green-100 border border-green-500/30">
                                            <CheckCircle size={10} />
                                            {user.status || 'Active'}
                                        </span>
                                    </div>
                                    {user.division && (
                                        <p className="text-xs mt-1 opacity-90">{user.division}</p>
                                    )}
                                    <p className="text-[10px] opacity-70 mt-0.5 truncate">
                                        {user.provinceName || user.cityName || 'Indonesia'}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-end mt-auto">
                                <div>
                                    <p className="text-[9px] opacity-60">Valid Thru</p>
                                    <p className="text-xs font-medium">12/2030</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] flex items-center gap-1 opacity-60 animate-pulse">
                                        <RotateCw size={10} />
                                        Tap to Flip
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK FACE */}
                    <div
                        className={`absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl bg-white text-dark-900`}
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <div className="h-full p-4 flex flex-col items-center justify-center relative bg-[url('/pattern-bg.png')] bg-cover">
                            <div className="absolute top-4 left-4 flex items-center gap-2 opacity-50">
                                <Shield size={16} />
                                <span className="text-xs font-bold">Verification</span>
                            </div>

                            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                <QRCode
                                    value={qrValue}
                                    size={120}
                                    level="H"
                                    includeMargin={false}
                                    renderAs="svg"
                                />
                            </div>

                            <p className="mt-3 text-xs font-semibold text-center text-dark-600">
                                Scan to verify identity<br />and view full profile
                            </p>

                            <div className="absolute bottom-4 w-full px-4 flex justify-between items-end">
                                <div className="text-[9px] text-dark-400">
                                    Property of SIP Indonesia.<br />
                                    If found, please return.
                                </div>
                                <div className="text-[9px] text-primary-600 font-bold flex items-center gap-1">
                                    <RotateCw size={10} />
                                    Flip Back
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-sm font-medium text-dark-200"
                >
                    <Download size={16} />
                    Print / Save PDF
                </button>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body * { visibility: hidden; }
                    .perspective, .perspective * { 
                        visibility: visible; 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .perspective {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 8.56cm !important;
                        height: 5.4cm !important;
                    }
                    /* Force front face if not specified, or print both? */
                    /* For now, just print what's visible, user can flip and print */
                }
            `}</style>
        </div>
    );
}
