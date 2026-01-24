import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3,
    Calendar,
    ChevronDown,
    ChevronRight,
    Users,
    User,
    Download,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface AttendanceRecord {
    id: string;
    name: string;
    role: 'COACH' | 'ATHLETE';
    avatar?: string;
    months: {
        month: string;
        present: number;
        absent: number;
        late: number;
        total: number;
        percentage: number;
    }[];
    averagePercentage: number;
}

// Sample 3-month attendance data
const sampleAttendance: AttendanceRecord[] = [
    {
        id: '1',
        name: 'Coach Ahmad',
        role: 'COACH',
        months: [
            { month: 'Oct 2025', present: 18, absent: 2, late: 2, total: 22, percentage: 82 },
            { month: 'Nov 2025', present: 19, absent: 1, late: 1, total: 21, percentage: 90 },
            { month: 'Dec 2025', present: 17, absent: 2, late: 1, total: 20, percentage: 85 },
        ],
        averagePercentage: 86,
    },
    {
        id: '2',
        name: 'Coach Siti',
        role: 'COACH',
        months: [
            { month: 'Oct 2025', present: 20, absent: 1, late: 1, total: 22, percentage: 91 },
            { month: 'Nov 2025', present: 20, absent: 0, late: 1, total: 21, percentage: 95 },
            { month: 'Dec 2025', present: 19, absent: 1, late: 0, total: 20, percentage: 95 },
        ],
        averagePercentage: 94,
    },
    {
        id: '3',
        name: 'Andi Pratama',
        role: 'ATHLETE',
        months: [
            { month: 'Oct 2025', present: 20, absent: 1, late: 1, total: 22, percentage: 91 },
            { month: 'Nov 2025', present: 18, absent: 2, late: 1, total: 21, percentage: 86 },
            { month: 'Dec 2025', present: 19, absent: 0, late: 1, total: 20, percentage: 95 },
        ],
        averagePercentage: 91,
    },
    {
        id: '4',
        name: 'Budi Santoso Jr',
        role: 'ATHLETE',
        months: [
            { month: 'Oct 2025', present: 15, absent: 5, late: 2, total: 22, percentage: 68 },
            { month: 'Nov 2025', present: 17, absent: 3, late: 1, total: 21, percentage: 81 },
            { month: 'Dec 2025', present: 18, absent: 1, late: 1, total: 20, percentage: 90 },
        ],
        averagePercentage: 80,
    },
    {
        id: '5',
        name: 'Diana Putri',
        role: 'ATHLETE',
        months: [
            { month: 'Oct 2025', present: 21, absent: 0, late: 1, total: 22, percentage: 95 },
            { month: 'Nov 2025', present: 20, absent: 0, late: 1, total: 21, percentage: 95 },
            { month: 'Dec 2025', present: 20, absent: 0, late: 0, total: 20, percentage: 100 },
        ],
        averagePercentage: 97,
    },
];

export default function ReportsPage() {
    const { user } = useAuth();
    const [expandedCoaches, setExpandedCoaches] = useState(true);
    const [expandedAthletes, setExpandedAthletes] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const isClubOwner = user?.role === 'CLUB';

    const coaches = sampleAttendance.filter(a => a.role === 'COACH');
    const athletes = sampleAttendance.filter(a => a.role === 'ATHLETE');

    const getPercentageColor = (pct: number) => {
        if (pct >= 90) return 'text-emerald-400';
        if (pct >= 75) return 'text-amber-400';
        return 'text-red-400';
    };

    const getPercentageBg = (pct: number) => {
        if (pct >= 90) return 'bg-emerald-500';
        if (pct >= 75) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getTrend = (person: AttendanceRecord) => {
        const months = person.months;
        const lastMonth = months[months.length - 1].percentage;
        const prevMonth = months[months.length - 2].percentage;
        return lastMonth - prevMonth;
    };

    const renderAttendanceTable = (data: AttendanceRecord[], title: string, expanded: boolean, setExpanded: (v: boolean) => void) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between mb-4"
            >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    {title} ({data.length})
                </h2>
                <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-dark-700">
                                        <th className="text-left py-3 px-2 text-dark-400 font-medium">Name</th>
                                        {data[0]?.months.map((m) => (
                                            <th key={m.month} className="text-center py-3 px-2 text-dark-400 font-medium">{m.month}</th>
                                        ))}
                                        <th className="text-center py-3 px-2 text-dark-400 font-medium">Average</th>
                                        <th className="text-center py-3 px-2 text-dark-400 font-medium">Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((person) => {
                                        const trend = getTrend(person);
                                        return (
                                            <tr key={person.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                                                            {person.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium">{person.name}</span>
                                                    </div>
                                                </td>
                                                {person.months.map((m) => (
                                                    <td key={m.month} className="py-3 px-2 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`font-bold ${getPercentageColor(m.percentage)}`}>
                                                                {m.percentage}%
                                                            </span>
                                                            <div className="flex gap-1 text-[10px] mt-1">
                                                                <span className="text-emerald-400">{m.present}P</span>
                                                                <span className="text-red-400">{m.absent}A</span>
                                                                <span className="text-amber-400">{m.late}L</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                ))}
                                                <td className="py-3 px-2 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="relative w-12 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`absolute left-0 top-0 h-full rounded-full ${getPercentageBg(person.averagePercentage)}`}
                                                                style={{ width: `${person.averagePercentage}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-bold mt-1 ${getPercentageColor(person.averagePercentage)}`}>
                                                            {person.averagePercentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <div className={`flex items-center justify-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        <span className="text-sm font-medium">{trend >= 0 ? '+' : ''}{trend}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // Summary Stats
    const totalPresent = sampleAttendance.reduce((sum, p) =>
        sum + p.months.reduce((s, m) => s + m.present, 0), 0);
    const totalAbsent = sampleAttendance.reduce((sum, p) =>
        sum + p.months.reduce((s, m) => s + m.absent, 0), 0);
    const totalLate = sampleAttendance.reduce((sum, p) =>
        sum + p.months.reduce((s, m) => s + m.late, 0), 0);
    const overallPercentage = Math.round(
        sampleAttendance.reduce((sum, p) => sum + p.averagePercentage, 0) / sampleAttendance.length
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Attendance Reports</h1>
                    <p className="text-dark-400">Last 3 months attendance summary</p>
                </div>
                {isClubOwner && (
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Download size={18} />
                        Export Report
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-xs">Present</p>
                            <p className="text-2xl font-bold">{totalPresent}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-xs">Absent</p>
                            <p className="text-2xl font-bold">{totalAbsent}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-xs">Late</p>
                            <p className="text-2xl font-bold">{totalLate}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-xs">Avg Rate</p>
                            <p className={`text-2xl font-bold ${getPercentageColor(overallPercentage)}`}>{overallPercentage}%</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Coach Attendance */}
            {renderAttendanceTable(coaches, 'Coach Attendance', expandedCoaches, setExpandedCoaches)}

            {/* Athlete Attendance */}
            {renderAttendanceTable(athletes, 'Athlete Attendance', expandedAthletes, setExpandedAthletes)}
        </div>
    );
}
