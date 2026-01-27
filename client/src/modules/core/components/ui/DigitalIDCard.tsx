import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, X, Clock, AlertTriangle, User, Download, ShieldCheck, MapPin, CreditCard, RotateCcw, CheckCircle } from 'lucide-react';
import { ROLE_CODE_TO_NAME, parseSipId } from '@/modules/core/types/territory';
import { getProvinceById, getCityById } from '@/modules/core/types/territoryData';
import QRCode from 'qrcode';

export type IDCardStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PROPOSED';

export interface IDCardData {
    sipId: string;
    name: string;
    photo?: string;
    role: string | string[];
    status: IDCardStatus;
    verifiedBy?: string;
    verifiedAt?: Date;
    suspendedBy?: string;
    suspendReason?: string;
    proposedTo?: string;
}

const STATUS_CONFIG: Record<IDCardStatus, { color: string; bgColor: string; icon: typeof Check; label: string; glow: string }> = {
    ACTIVE: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: Check, label: 'Active', glow: 'shadow-emerald-500/20' },
    INACTIVE: { color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: X, label: 'Not Active', glow: 'shadow-gray-500/20' },
    SUSPENDED: { color: 'text-red-400', bgColor: 'bg-red-500/20', icon: AlertTriangle, label: 'Suspended', glow: 'shadow-red-500/20' },
    PROPOSED: { color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: Clock, label: 'Proposed', glow: 'shadow-amber-500/20' },
};

// ID Card dimensions for print (8.56 × 5.40 cm at 300 DPI = 1011 × 638 px)
const CARD_WIDTH = 1011;
const CARD_HEIGHT = 638;

interface DigitalIDCardProps {
    data: IDCardData;
    className?: string;
    showExport?: boolean;
}

export default function DigitalIDCard({ data, className = '', showExport = true }: DigitalIDCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const statusConfig = STATUS_CONFIG[data.status] || STATUS_CONFIG.ACTIVE;
    const StatusIcon = statusConfig.icon;

    // Parse SIP ID for display
    const parsedId = parseSipId(data.sipId);
    const roles = Array.isArray(data.role) ? data.role : [data.role];
    const roleLabel = roles.join(' • ');
    const city = parsedId ? getCityById(`${parsedId.provinceId}${parsedId.cityCode}`) : null;

    // Generate QR code linking to verification page
    const verificationUrl = `${window.location.origin}/verify/${data.sipId.replace(/\./g, '-')}`;

    // Generate QR on mount
    useEffect(() => {
        QRCode.toDataURL(verificationUrl, {
            width: 400,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H'
        }).then(url => setQrCodeUrl(url));
    }, [verificationUrl]);

    // Export card as image for printing
    const handleExport = async () => {
        setIsExporting(true);
        const canvas = document.createElement('canvas');
        canvas.width = CARD_WIDTH;
        canvas.height = CARD_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setIsExporting(false);
            return;
        }

        // --- DRAW PREMIUM FRONT ---
        // Mesh Gradient Logic for Export
        const meshGrad = ctx.createRadialGradient(CARD_WIDTH * 0.8, -CARD_HEIGHT * 0.2, 0, CARD_WIDTH * 0.8, -CARD_HEIGHT * 0.2, CARD_WIDTH);
        meshGrad.addColorStop(0, '#1e293b');
        meshGrad.addColorStop(1, '#020617');
        ctx.fillStyle = meshGrad;
        ctx.beginPath();
        ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 50);
        ctx.fill();

        // Hex Pattern for Export
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.03)';
        ctx.lineWidth = 1;
        const drawHex = (x: number, y: number, r: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(x + r * Math.cos(i * Math.PI / 3), y + r * Math.sin(i * Math.PI / 3));
            }
            ctx.closePath();
            ctx.stroke();
        };
        for (let x = 0; x < CARD_WIDTH + 100; x += 80) {
            for (let y = 0; y < CARD_HEIGHT + 100; y += 80) {
                drawHex(x, y, 40);
            }
        }

        // --- Logo and Header ---
        const drawLogo = new Image();
        drawLogo.src = '/logo.png';
        await new Promise(resolve => drawLogo.onload = resolve);
        ctx.drawImage(drawLogo, 60, 50, 60, 60);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'black 48px Inter, sans-serif';
        ctx.fillText('C-SYSTEM SIP', 140, 95);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText('OFFICIAL DIGITAL LICENSE • CORE ACCESS', 140, 125);

        // --- Card Info ---
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 72px Inter, sans-serif';
        ctx.fillText(data.name.toUpperCase(), 380, 260);

        // Roles
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillText(roleLabel.toUpperCase(), 380, 310);

        // SIP ID Container
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(380, 380, 560, 120, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'black 20px Inter, sans-serif';
        ctx.fillText('SIP IDENTITY ID', 410, 420);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 56px monospace';
        ctx.fillText(data.sipId, 410, 475);

        // VERIFICATION Badges
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(410, 540, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText('SIP VERIFIED • ATTENDANCE READY', 435, 548);

        // QR Code Background (on main side for export too?)
        if (qrCodeUrl) {
            const qrImg = new Image();
            qrImg.crossOrigin = 'anonymous';
            qrImg.src = qrCodeUrl;
            await new Promise(resolve => qrImg.onload = resolve);

            const qrSize = 220;
            const qrX = CARD_WIDTH - 280;
            const qrY = CARD_HEIGHT - 280;

            // Draw QR White bg
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 30);
            ctx.fill();

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // Draw CSystem Logo in center of QR
            const centerLogoSize = 50;
            ctx.drawImage(drawLogo, qrX + (qrSize - centerLogoSize) / 2, qrY + (qrSize - centerLogoSize) / 2, centerLogoSize, centerLogoSize);
        }

        // Profile Photo
        if (data.photo) {
            const protoImg = new Image();
            protoImg.crossOrigin = 'anonymous';
            protoImg.src = data.photo;
            await new Promise(resolve => protoImg.onload = resolve);

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(60, 180, 280, 360, 30);
            ctx.clip();
            ctx.drawImage(protoImg, 60, 180, 280, 360);
            ctx.restore();

            ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // Finalize Download
        const link = document.createElement('a');
        link.download = `CSystem-SIP-ID-${data.sipId}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        setIsExporting(false);
    };

    return (
        <div className={`w-full max-w-[450px] mx-auto ${className}`}>
            {/* Card Transition Base */}
            <div className="perspective-2000" style={{ perspective: '2000px' }}>
                <motion.div
                    ref={cardRef}
                    className="relative w-full aspect-[1.58/1] cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 60, damping: 20 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* FRONT SIDE (DESIGN UPGRADE) */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10"
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
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        />

                        <div className="relative h-full w-full bg-[#020617] overflow-hidden">
                            {/* Exclusive Background Mesh */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-amber-500/10 blur-[120px] rounded-full" />
                                <div className="absolute bottom-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />

                                {/* Hex Logic */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0l43.3 25v50L50 100 6.7 75V25z' fill-opacity='0.2' fill='%23f59e0b' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                        backgroundSize: '70px'
                                    }}
                                />
                            </div>

                            <div className="relative h-full p-6 flex flex-col justify-between">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shadow-2xl p-2 group-hover:scale-110 transition-transform">
                                            <img src="/logo.png" alt="CSystem" className="w-full h-full object-contain brightness-110" />
                                        </div>
                                        <div>
                                            <h1 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">C-SYSTEM SIP</h1>
                                            <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em]">Official Digital License</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-xl ${statusConfig.bgColor} border border-white/10 backdrop-blur-2xl shadow-xl flex items-center gap-2`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${statusConfig.color.replace('text', 'bg')}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.color}`}>{statusConfig.label}</span>
                                    </div>
                                </div>

                                {/* Body Section */}
                                <div className="flex gap-6 items-center">
                                    {/* Profile Avatar */}
                                    <div className="relative group/photo">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500/20 to-blue-500/20 blur-lg rounded-2xl opacity-0 transition-opacity group-hover/photo:opacity-100" />
                                        <div className="w-28 h-36 rounded-2xl bg-dark-900 border-2 border-white/10 overflow-hidden relative z-10 shadow-2xl">
                                            {data.photo ? (
                                                <img src={data.photo} alt={data.name} className="w-full h-full object-cover transition-transform group-hover/photo:scale-110 duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-dark-800 to-dark-950">
                                                    <User size={52} className="text-dark-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-1 min-w-0 space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight leading-tight mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                                {data.name}
                                            </h2>
                                            <div className="flex flex-wrap gap-1.5">
                                                {roles.map((r, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500 text-dark-950 font-black text-[9px] uppercase italic tracking-widest shadow-lg">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-inner relative overflow-hidden group/id">
                                            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-amber-500/5 to-transparent skew-x-[-20deg] translate-x-20 transition-transform group-hover/id:translate-x-[-100px] duration-1000" />
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-[8px] text-dark-500 font-black uppercase tracking-[0.3em] block mb-1">Identity ID</span>
                                                    <span className="text-xl font-bold text-white tracking-[0.2em] font-mono leading-none">{data.sipId}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black italic">
                                                    <CheckCircle size={10} />
                                                    SIP READY
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Navigation */}
                                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] text-dark-600 font-black uppercase tracking-widest leading-none mb-0.5">Location Hub</span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-dark-300 font-bold uppercase">
                                                <MapPin size={10} className="text-amber-500" />
                                                {city?.name || 'Indonesia'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                        <div className="text-right">
                                            <p className="text-[8px] text-amber-500 font-black uppercase tracking-widest leading-none">Attendance Point</p>
                                            <p className="text-[7px] text-dark-500 font-bold uppercase tracking-widest mt-0.5">TAP TO ROTATE</p>
                                        </div>
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                            <RotateCcw size={14} className="text-amber-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK SIDE (SECURITY & VERIFICATION) */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-[#01040a] text-white border border-white/10"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', zIndex: 1 }}
                    >
                        <div className="h-full w-full relative overflow-hidden flex flex-col p-8 items-center justify-between">
                            {/* Security Grid */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0l43.3 25v50L50 100 6.7 75V25z' fill-opacity='1' fill='%23f59e0b' /%3E%3C/svg%3E")`,
                                    backgroundSize: '100px'
                                }}
                            />

                            <div className="w-full flex justify-between items-center bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 shadow-2xl">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Gateway Verified</span>
                                </div>
                                <span className="text-[10px] font-mono text-white/30 tracking-widest">{data.sipId}</span>
                            </div>

                            <div className="space-y-6 flex flex-col items-center group">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700" />
                                    <div className="bg-white p-4 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] relative border-[8px] border-white transition-transform duration-500 group-hover:scale-105">
                                        {qrCodeUrl ? (
                                            <div className="relative">
                                                <img src={qrCodeUrl} alt="Security Gateway" className="w-32 h-32" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-xl">
                                                        <img src="/logo.png" className="w-full h-full object-contain" alt="C" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 flex items-center justify-center bg-dark-50">
                                                <QrCode size={80} className="text-dark-900 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-4 border-[#01040a] shadow-2xl">
                                        <CheckCircle size={24} className="text-dark-950" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-black text-lg uppercase italic tracking-tight mb-2 drop-shadow-md">Scan for Verification</h3>
                                    <p className="text-[11px] text-dark-500 max-w-[280px] leading-relaxed mx-auto font-medium">
                                        This license token confirms official SIP status and enables automated attendance logging at all C-System Gateways.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full flex justify-between items-end border-t border-white/5 pt-5">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" className="w-6 h-6 grayscale brightness-50" alt="C" />
                                    <div className="text-left">
                                        <p className="text-[7px] text-dark-600 font-black uppercase tracking-widest mb-0.5">Ownership</p>
                                        <p className="text-[9px] text-dark-500 font-bold uppercase tracking-widest">Corelink Indonesia © 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-amber-500 font-black italic uppercase tracking-wider mb-1">C-SYSTEM SIP</p>
                                    <p className="text-[8px] text-dark-500 font-bold uppercase">SECURE PASS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Premium Controls */}
            <div className="mt-10 grid grid-cols-2 gap-4">
                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="h-14 rounded-2xl bg-dark-800/80 backdrop-blur-2xl border border-white/10 hover:border-amber-500/30 text-white font-black text-[10px] transition-all flex items-center justify-center gap-3 uppercase italic tracking-widest group shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                >
                    <motion.div animate={{ rotate: isFlipped ? 180 : 0 }}>
                        <QrCode size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    </motion.div>
                    {isFlipped ? 'Identity View' : 'Verification Mode'}
                </button>

                {showExport && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleExport(); }}
                        disabled={isExporting}
                        className="h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-dark-950 font-black text-[10px] shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-3 uppercase italic tracking-widest disabled:opacity-50"
                    >
                        {isExporting ? (
                            <div className="w-6 h-6 border-3 border-dark-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Download size={20} />
                                Download Digital License
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
