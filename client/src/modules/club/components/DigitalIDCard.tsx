import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, X, Clock, AlertTriangle, User, Download } from 'lucide-react';
import { ROLE_CODE_TO_NAME, parseSipId } from '@/modules/core/types/territory';
import { getProvinceById, getCityById } from '@/modules/core/types/territoryData';
import QRCode from 'qrcode';

export type IDCardStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PROPOSED';

export interface IDCardData {
    sipId: string;
    name: string;
    photo?: string;
    role: string;
    status: IDCardStatus;
    verifiedBy?: string;
    verifiedAt?: Date;
    suspendedBy?: string;
    suspendReason?: string;
    proposedTo?: string;
}

const STATUS_CONFIG: Record<IDCardStatus, { color: string; bgColor: string; icon: typeof Check; label: string }> = {
    ACTIVE: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: Check, label: 'Active' },
    INACTIVE: { color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: X, label: 'Not Active' },
    SUSPENDED: { color: 'text-red-400', bgColor: 'bg-red-500/20', icon: AlertTriangle, label: 'Suspended' },
    PROPOSED: { color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: Clock, label: 'Proposed' },
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

    const statusConfig = STATUS_CONFIG[data.status];
    const StatusIcon = statusConfig.icon;

    // Parse SIP ID for display
    const parsedId = parseSipId(data.sipId);
    const roleLabel = parsedId ? ROLE_CODE_TO_NAME[parsedId.roleCode] || data.role : data.role;
    const province = parsedId ? getProvinceById(parsedId.provinceId) : null;
    const city = parsedId ? getCityById(`${parsedId.provinceId}${parsedId.cityCode}`) : null;

    // Generate QR code linking to verification page
    const verificationUrl = `${window.location.origin}/verify/${data.sipId.replace(/\./g, '-')}`;

    // Generate QR on mount
    useState(() => {
        QRCode.toDataURL(verificationUrl, {
            width: 200,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
        }).then(url => setQrCodeUrl(url));
    });

    // Export card as image for printing
    const handleExport = async () => {
        setIsExporting(true);

        // Create a canvas for the print-ready card
        const canvas = document.createElement('canvas');
        canvas.width = CARD_WIDTH;
        canvas.height = CARD_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setIsExporting(false);
            return;
        }

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 40);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#2a2a4a';
        ctx.lineWidth = 3;
        ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 40);
        ctx.stroke();

        // Draw logo placeholder
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(80, 80, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw SIP text
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('SIP', 130, 75);
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.fillText('Sistem Integrasi Panahan', 130, 95);

        // Draw status badge
        const statusColors: Record<string, string> = {
            ACTIVE: '#10b981',
            INACTIVE: '#6b7280',
            SUSPENDED: '#ef4444',
            PROPOSED: '#f59e0b'
        };
        ctx.fillStyle = statusColors[data.status] + '40';
        ctx.roundRect(CARD_WIDTH - 180, 50, 130, 40, 20);
        ctx.fill();
        ctx.fillStyle = statusColors[data.status];
        ctx.font = 'bold 18px Arial';
        ctx.fillText(statusConfig.label, CARD_WIDTH - 165, 77);

        // Draw photo placeholder
        ctx.fillStyle = '#374151';
        ctx.roundRect(50, 150, 200, 240, 20);
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.font = '48px Arial';
        ctx.fillText('👤', 120, 295);

        // Draw name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial';
        ctx.fillText(data.name, 280, 200);

        // Draw role
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(roleLabel, 280, 240);

        // Draw location
        if (city) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '22px Arial';
            ctx.fillText(`📍 ${city.name}${province ? `, ${province.name}` : ''}`, 280, 280);
        }

        // Draw SIP ID
        ctx.fillStyle = '#1f2937';
        ctx.roundRect(280, 310, 350, 80, 15);
        ctx.fill();
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px Arial';
        ctx.fillText('SIP ID', 300, 340);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(data.sipId, 300, 375);

        // Draw QR code
        if (qrCodeUrl) {
            const qrImg = new Image();
            qrImg.onload = () => {
                ctx.drawImage(qrImg, CARD_WIDTH - 200, CARD_HEIGHT - 200, 150, 150);

                // Draw footer text
                ctx.fillStyle = '#6b7280';
                ctx.font = '14px Arial';
                ctx.fillText('Tap to flip for details', 50, CARD_HEIGHT - 40);

                // Download the image
                const link = document.createElement('a');
                link.download = `SIP-ID-${data.sipId.replace(/\./g, '-')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                setIsExporting(false);
            };
            qrImg.src = qrCodeUrl;
        } else {
            setIsExporting(false);
        }
    };

    return (
        <div className={`${className}`}>
            {/* Card Container */}
            <div className="perspective-1000" style={{ perspective: '1000px' }}>
                <motion.div
                    ref={cardRef}
                    className="relative w-full cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front Side */}
                    <div
                        className="w-full rounded-2xl overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="bg-gradient-to-br from-dark-800 via-dark-850 to-dark-900 border border-dark-700 rounded-2xl p-5 shadow-2xl">
                            {/* Header with Logo */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <img src="/logo.png" alt="SIP Logo" className="w-10 h-10 object-contain" />
                                    <div>
                                        <p className="text-xs font-bold text-primary-400">Csystem</p>
                                        <p className="text-[8px] text-dark-400">Sistem Integrasi Panahan</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full ${statusConfig.bgColor} flex items-center gap-1`}>
                                    <StatusIcon size={12} className={statusConfig.color} />
                                    <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex gap-4">
                                {/* Photo */}
                                <div className="w-24 h-28 rounded-xl bg-dark-700 overflow-hidden flex-shrink-0 border border-dark-600">
                                    {data.photo ? (
                                        <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User size={40} className="text-dark-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate mb-1">{data.name}</h3>
                                    <p className="text-sm text-primary-400 font-medium mb-2">{roleLabel}</p>

                                    {/* Location */}
                                    {(province || city) && (
                                        <p className="text-xs text-dark-400 mb-2 truncate">
                                            {city?.name}{province && `, ${province.name}`}
                                        </p>
                                    )}

                                    {/* SIP ID */}
                                    <div className="bg-dark-700/50 rounded-lg px-3 py-2 mt-auto">
                                        <p className="text-[10px] text-dark-400 mb-0.5">SIP ID</p>
                                        <p className="font-mono text-lg font-bold text-white tracking-wider">{data.sipId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer with QR */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700/50">
                                <div className="text-xs text-dark-400">
                                    <p>Tap to flip for details</p>
                                    {data.status === 'ACTIVE' && data.verifiedBy && (
                                        <p className="text-[10px] mt-1">✓ Verified by {data.verifiedBy}</p>
                                    )}
                                    {data.status === 'SUSPENDED' && data.suspendedBy && (
                                        <p className="text-[10px] mt-1 text-red-400">⚠ Suspended by {data.suspendedBy}</p>
                                    )}
                                    {data.status === 'PROPOSED' && data.proposedTo && (
                                        <p className="text-[10px] mt-1 text-amber-400">⏳ Proposed to {data.proposedTo}</p>
                                    )}
                                </div>
                                {qrCodeUrl ? (
                                    <div className="bg-white rounded-lg p-1">
                                        <img src={qrCodeUrl} alt="Verification QR" className="w-12 h-12" />
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center">
                                        <QrCode size={32} className="text-dark-800" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div
                        className="w-full rounded-2xl overflow-hidden absolute top-0 left-0"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="bg-gradient-to-br from-dark-800 via-dark-850 to-dark-900 border border-dark-700 rounded-2xl p-5 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <img src="/logo.png" alt="SIP Logo" className="w-10 h-10 object-contain" />
                                    <div>
                                        <p className="text-xs font-bold text-primary-400">Csystem</p>
                                        <p className="text-[8px] text-dark-400">Verification Details</p>
                                    </div>
                                </div>
                                <p className="font-mono text-sm text-dark-400">{data.sipId}</p>
                            </div>

                            {/* Attendance QR */}
                            <div className="flex justify-center mb-4">
                                {qrCodeUrl ? (
                                    <div className="bg-white rounded-xl p-3">
                                        <img src={qrCodeUrl} alt="Scan to Verify" className="w-24 h-24" />
                                        <p className="text-center text-[10px] text-dark-600 mt-1">Scan to Verify</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl p-3">
                                        <QrCode size={100} className="text-dark-900" />
                                        <p className="text-center text-[10px] text-dark-600 mt-1">Scan to Verify</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Details */}
                            <div className="space-y-2">
                                <div className={`p-3 rounded-lg ${statusConfig.bgColor}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <StatusIcon size={16} className={statusConfig.color} />
                                        <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                                    </div>

                                    {data.status === 'ACTIVE' && data.verifiedBy && (
                                        <p className="text-xs text-dark-300">
                                            Verified by {data.verifiedBy}
                                            {data.verifiedAt && ` on ${new Date(data.verifiedAt).toLocaleDateString()}`}
                                        </p>
                                    )}

                                    {data.status === 'SUSPENDED' && (
                                        <p className="text-xs text-dark-300">
                                            {data.suspendedBy && `By: ${data.suspendedBy}`}
                                            {data.suspendReason && ` - ${data.suspendReason}`}
                                        </p>
                                    )}

                                    {data.status === 'PROPOSED' && data.proposedTo && (
                                        <p className="text-xs text-dark-300">
                                            Pending approval from {data.proposedTo}
                                        </p>
                                    )}

                                    {data.status === 'INACTIVE' && (
                                        <p className="text-xs text-dark-300">
                                            This ID is not yet verified
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700/50">
                                <div className="text-xs text-dark-400">
                                    <p>Tap to flip back</p>
                                </div>
                                <p className="text-xs text-dark-500">© Csystem Indonesia</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Export Button */}
            {showExport && (
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleExport(); }}
                        disabled={isExporting}
                        className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Export for Print
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
