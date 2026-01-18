import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    CheckSquare,
    DollarSign,
    RotateCcw,
    Maximize2,
    Minimize2,
    Play,
    ChevronRight,
    Check,
    X,
    Clock,
    AlertCircle
} from 'lucide-react';

interface InteractiveModulePreviewProps {
    moduleCode: string;
    moduleName: string;
    category: string;
}

// ============================================
// SCORING INTERACTIVE PREVIEW
// ============================================
const ScoringInteractive: React.FC = () => {
    const [arrows, setArrows] = useState<number[]>([]);
    const [currentEnd, setCurrentEnd] = useState(1);
    const [distance] = useState(18);
    const arrowsPerEnd = 6;

    const scoreColors: Record<number, string> = {
        10: 'bg-amber-400 text-black',
        9: 'bg-amber-400 text-black',
        8: 'bg-red-500 text-white',
        7: 'bg-red-500 text-white',
        6: 'bg-blue-500 text-white',
        5: 'bg-blue-500 text-white',
        4: 'bg-slate-800 text-white',
        3: 'bg-slate-800 text-white',
        2: 'bg-slate-800 text-white',
        1: 'bg-slate-800 text-white',
        0: 'bg-slate-600 text-white',
    };

    const addArrow = (score: number) => {
        if (arrows.length < arrowsPerEnd) {
            setArrows([...arrows, score]);
        }
    };

    const removeLastArrow = () => {
        setArrows(arrows.slice(0, -1));
    };

    const nextEnd = () => {
        if (arrows.length === arrowsPerEnd) {
            setCurrentEnd(currentEnd + 1);
            setArrows([]);
        }
    };

    const reset = () => {
        setArrows([]);
        setCurrentEnd(1);
    };

    const total = arrows.reduce((sum, a) => sum + a, 0);
    const average = arrows.length > 0 ? (total / arrows.length).toFixed(2) : '0.00';

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-white">Scoring Session</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">
                        End {currentEnd}
                    </span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {distance}m
                    </span>
                </div>
            </div>

            {/* Target Face (Compact) */}
            <div className="flex justify-center">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-white border-2 border-slate-600" />
                    <div className="absolute inset-2 rounded-full bg-slate-800" />
                    <div className="absolute inset-4 rounded-full bg-blue-500" />
                    <div className="absolute inset-6 rounded-full bg-red-500" />
                    <div className="absolute inset-8 rounded-full bg-amber-400" />
                    <div className="absolute inset-10 rounded-full bg-amber-300" />
                    {/* X mark in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">X</span>
                    </div>
                </div>
            </div>

            {/* Score Input Buttons */}
            <div className="grid grid-cols-6 gap-1">
                {[10, 9, 8, 7, 6, 5].map((score) => (
                    <button
                        key={score}
                        onClick={() => addArrow(score)}
                        disabled={arrows.length >= arrowsPerEnd}
                        className={`py-2 rounded font-bold text-sm transition-all
                            ${scoreColors[score]}
                            ${arrows.length >= arrowsPerEnd ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                        `}
                    >
                        {score}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-6 gap-1">
                {[4, 3, 2, 1, 0, 'M'].map((score) => (
                    <button
                        key={score}
                        onClick={() => addArrow(score === 'M' ? 0 : score as number)}
                        disabled={arrows.length >= arrowsPerEnd}
                        className={`py-2 rounded font-bold text-sm transition-all
                            ${score === 'M' ? 'bg-slate-600 text-white' : scoreColors[score as number]}
                            ${arrows.length >= arrowsPerEnd ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                        `}
                    >
                        {score}
                    </button>
                ))}
            </div>

            {/* Current Arrows Display */}
            <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Arrows ({arrows.length}/{arrowsPerEnd})</span>
                    <button
                        onClick={removeLastArrow}
                        disabled={arrows.length === 0}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                        Undo
                    </button>
                </div>
                <div className="flex gap-1 min-h-[32px]">
                    {arrows.map((score, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${scoreColors[score]}`}
                        >
                            {score === 0 ? 'M' : score}
                        </motion.div>
                    ))}
                    {Array.from({ length: arrowsPerEnd - arrows.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-8 rounded border-2 border-dashed border-slate-600" />
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/20 rounded p-2">
                    <div className="text-lg font-bold text-emerald-400">{total}</div>
                    <div className="text-[10px] text-slate-400">Total</div>
                </div>
                <div className="bg-blue-500/20 rounded p-2">
                    <div className="text-lg font-bold text-blue-400">{average}</div>
                    <div className="text-[10px] text-slate-400">Average</div>
                </div>
                <div className="bg-amber-500/20 rounded p-2">
                    <div className="text-lg font-bold text-amber-400">{arrows.filter(a => a >= 10).length}</div>
                    <div className="text-[10px] text-slate-400">10s/Xs</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={reset}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300 transition-colors"
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
                <button
                    onClick={nextEnd}
                    disabled={arrows.length !== arrowsPerEnd}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm text-white transition-colors"
                >
                    Next End
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

// ============================================
// ATTENDANCE INTERACTIVE PREVIEW
// ============================================
type AttendanceStatus = 'PENDING' | 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

interface Athlete {
    id: number;
    name: string;
    status: AttendanceStatus;
}

const AttendanceInteractive: React.FC = () => {
    const [athletes, setAthletes] = useState<Athlete[]>([
        { id: 1, name: 'Andi Pranata', status: 'PENDING' },
        { id: 2, name: 'Siti Rahayu', status: 'PENDING' },
        { id: 3, name: 'Dian Kusuma', status: 'PENDING' },
        { id: 4, name: 'Maya Putri', status: 'PENDING' },
    ]);

    const statusStyles: Record<AttendanceStatus, { bg: string; icon: React.ReactNode }> = {
        PENDING: { bg: 'bg-slate-600', icon: <Clock size={12} /> },
        PRESENT: { bg: 'bg-emerald-500', icon: <Check size={12} /> },
        LATE: { bg: 'bg-amber-500', icon: <Clock size={12} /> },
        ABSENT: { bg: 'bg-red-500', icon: <X size={12} /> },
        EXCUSED: { bg: 'bg-blue-500', icon: <AlertCircle size={12} /> },
    };

    const cycleStatus = (id: number) => {
        const statusOrder: AttendanceStatus[] = ['PENDING', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];
        setAthletes(athletes.map(a => {
            if (a.id === id) {
                const currentIdx = statusOrder.indexOf(a.status);
                const nextIdx = (currentIdx + 1) % statusOrder.length;
                return { ...a, status: statusOrder[nextIdx] };
            }
            return a;
        }));
    };

    const markAllPresent = () => {
        setAthletes(athletes.map(a => ({ ...a, status: 'PRESENT' as AttendanceStatus })));
    };

    const reset = () => {
        setAthletes(athletes.map(a => ({ ...a, status: 'PENDING' as AttendanceStatus })));
    };

    const counts = {
        present: athletes.filter(a => a.status === 'PRESENT').length,
        late: athletes.filter(a => a.status === 'LATE').length,
        absent: athletes.filter(a => a.status === 'ABSENT').length,
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-white">Attendance</span>
                </div>
                <span className="text-xs text-slate-400">Tap to change status</span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
                <button
                    onClick={markAllPresent}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-xs text-emerald-400 transition-colors"
                >
                    <Check size={12} />
                    Mark All Present
                </button>
                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                >
                    <RotateCcw size={12} />
                </button>
            </div>

            {/* Athlete List */}
            <div className="space-y-2">
                {athletes.map((athlete) => (
                    <motion.div
                        key={athlete.id}
                        layout
                        className="flex items-center justify-between bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-750 transition-colors"
                        onClick={() => cycleStatus(athlete.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {athlete.name.charAt(0)}
                            </div>
                            <span className="text-sm text-white">{athlete.name}</span>
                        </div>
                        <motion.div
                            key={athlete.status}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${statusStyles[athlete.status].bg}`}
                        >
                            {statusStyles[athlete.status].icon}
                            {athlete.status}
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/20 rounded p-2">
                    <div className="text-lg font-bold text-emerald-400">{counts.present}</div>
                    <div className="text-[10px] text-slate-400">Present</div>
                </div>
                <div className="bg-amber-500/20 rounded p-2">
                    <div className="text-lg font-bold text-amber-400">{counts.late}</div>
                    <div className="text-[10px] text-slate-400">Late</div>
                </div>
                <div className="bg-red-500/20 rounded p-2">
                    <div className="text-lg font-bold text-red-400">{counts.absent}</div>
                    <div className="text-[10px] text-slate-400">Absent</div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// FINANCE INTERACTIVE PREVIEW
// ============================================
type InvoiceStatus = 'PENDING' | 'PAID' | 'VERIFIED' | 'OVERDUE';

interface Invoice {
    id: number;
    athlete: string;
    amount: number;
    status: InvoiceStatus;
    period: string;
}

const FinanceInteractive: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([
        { id: 1, athlete: 'Andi P.', amount: 150000, status: 'PENDING', period: 'Jan 2026' },
        { id: 2, athlete: 'Siti R.', amount: 150000, status: 'PAID', period: 'Jan 2026' },
        { id: 3, athlete: 'Dian K.', amount: 150000, status: 'OVERDUE', period: 'Dec 2025' },
    ]);

    const statusStyles: Record<InvoiceStatus, string> = {
        PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        VERIFIED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const verifyPayment = (id: number) => {
        setInvoices(invoices.map(inv => {
            if (inv.id === id && inv.status === 'PAID') {
                return { ...inv, status: 'VERIFIED' as InvoiceStatus };
            }
            return inv;
        }));
    };

    const markAsPaid = (id: number) => {
        setInvoices(invoices.map(inv => {
            if (inv.id === id && (inv.status === 'PENDING' || inv.status === 'OVERDUE')) {
                return { ...inv, status: 'PAID' as InvoiceStatus };
            }
            return inv;
        }));
    };

    const reset = () => {
        setInvoices([
            { id: 1, athlete: 'Andi P.', amount: 150000, status: 'PENDING', period: 'Jan 2026' },
            { id: 2, athlete: 'Siti R.', amount: 150000, status: 'PAID', period: 'Jan 2026' },
            { id: 3, athlete: 'Dian K.', amount: 150000, status: 'OVERDUE', period: 'Dec 2025' },
        ]);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const totalPending = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
        .reduce((sum, i) => sum + i.amount, 0);
    const totalVerified = invoices.filter(i => i.status === 'VERIFIED')
        .reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-white">Finance</span>
                </div>
                <button
                    onClick={reset}
                    className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
                >
                    <RotateCcw size={12} />
                    Reset
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-500/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-amber-400 mb-1">Pending</div>
                    <div className="text-lg font-bold text-amber-400">{formatCurrency(totalPending)}</div>
                </div>
                <div className="bg-emerald-500/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-emerald-400 mb-1">Verified</div>
                    <div className="text-lg font-bold text-emerald-400">{formatCurrency(totalVerified)}</div>
                </div>
            </div>

            {/* Invoice List */}
            <div className="space-y-2">
                {invoices.map((invoice) => (
                    <motion.div
                        key={invoice.id}
                        layout
                        className="bg-slate-800 rounded-lg p-3"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-sm font-medium text-white">{invoice.athlete}</div>
                                <div className="text-xs text-slate-400">{invoice.period}</div>
                            </div>
                            <motion.span
                                key={invoice.status}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className={`text-xs px-2 py-1 rounded border ${statusStyles[invoice.status]}`}
                            >
                                {invoice.status}
                            </motion.span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{formatCurrency(invoice.amount)}</span>
                            <div className="flex gap-1">
                                {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                                    <button
                                        onClick={() => markAsPaid(invoice.id)}
                                        className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                                    >
                                        Mark Paid
                                    </button>
                                )}
                                {invoice.status === 'PAID' && (
                                    <button
                                        onClick={() => verifyPayment(invoice.id)}
                                        className="text-xs px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded transition-colors"
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// GENERIC INTERACTIVE PREVIEW
// ============================================
const GenericInteractive: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [count, setCount] = useState(0);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary-400" />
                <span className="font-semibold text-white">{moduleName}</span>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-primary-400 mb-4">{count}</div>
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => setCount(c => c - 1)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
                    >
                        -
                    </button>
                    <button
                        onClick={() => setCount(0)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => setCount(c => c + 1)}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded text-white transition-colors"
                    >
                        +
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                    Interactive preview for "{moduleName}" module
                </p>
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const InteractiveModulePreview: React.FC<InteractiveModulePreviewProps> = ({
    moduleCode,
    moduleName,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const codeLower = moduleCode.toLowerCase();

    // Select the appropriate interactive component
    let PreviewContent: React.ReactNode;

    if (codeLower.includes('score') || codeLower.includes('scoring')) {
        PreviewContent = <ScoringInteractive />;
    } else if (codeLower.includes('attendance') || codeLower.includes('checkin')) {
        PreviewContent = <AttendanceInteractive />;
    } else if (codeLower.includes('finance') || codeLower.includes('payment') || codeLower.includes('fee')) {
        PreviewContent = <FinanceInteractive />;
    } else {
        PreviewContent = <GenericInteractive moduleName={moduleName} />;
    }

    return (
        <div className={`bg-slate-900 rounded-xl border border-slate-700 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                    <Play size={12} className="text-emerald-400" />
                    Interactive Preview
                </span>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>

            {/* Preview Content */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={moduleCode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {PreviewContent}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InteractiveModulePreview;
