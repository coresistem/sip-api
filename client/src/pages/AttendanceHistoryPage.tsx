import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    TrendingUp,
    Filter
} from 'lucide-react';
import { api } from '../context/AuthContext';

interface AttendanceRecord {
    id: string;
    date: string;
    sessionName: string;
    checkInTime: string | null;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
    notes?: string;
}

interface AttendanceStats {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attendanceRate: number;
}

// Mock data
const MOCK_STATS: AttendanceStats = {
    total: 24,
    present: 18,
    late: 3,
    absent: 2,
    excused: 1,
    attendanceRate: 87.5
};

const MOCK_RECORDS: AttendanceRecord[] = [
    { id: '1', date: '2026-01-14', sessionName: 'Morning Practice', checkInTime: '06:05', status: 'PRESENT' },
    { id: '2', date: '2026-01-13', sessionName: 'Evening Training', checkInTime: '16:35', status: 'LATE', notes: 'Traffic jam' },
    { id: '3', date: '2026-01-12', sessionName: 'Morning Practice', checkInTime: '06:00', status: 'PRESENT' },
    { id: '4', date: '2026-01-11', sessionName: 'Competition Prep', checkInTime: null, status: 'ABSENT' },
    { id: '5', date: '2026-01-10', sessionName: 'Morning Practice', checkInTime: '06:02', status: 'PRESENT' },
    { id: '6', date: '2026-01-09', sessionName: 'Evening Training', checkInTime: null, status: 'EXCUSED', notes: 'Medical appointment' },
    { id: '7', date: '2026-01-08', sessionName: 'Morning Practice', checkInTime: '05:58', status: 'PRESENT' },
    { id: '8', date: '2026-01-07', sessionName: 'Morning Practice', checkInTime: '06:01', status: 'PRESENT' }
];

export default function AttendanceHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [monthFilter, setMonthFilter] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, recordsRes] = await Promise.all([
                api.get('/api/v1/attendance/my-stats'),
                api.get('/api/v1/attendance/my-history')
            ]);
            setStats(statsRes.data || MOCK_STATS);
            setRecords(recordsRes.data?.length > 0 ? recordsRes.data : MOCK_RECORDS);
        } catch (error) {
            console.log('Using mock data');
            setStats(MOCK_STATS);
            setRecords(MOCK_RECORDS);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(r => {
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesMonth = !monthFilter || r.date.startsWith(monthFilter);
        return matchesStatus && matchesMonth;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PRESENT': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'LATE': return <Clock className="w-5 h-5 text-yellow-400" />;
            case 'ABSENT': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'EXCUSED': return <Calendar className="w-5 h-5 text-blue-400" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'LATE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'ABSENT': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'EXCUSED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-dark-700 text-dark-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                    Attendance <span className="gradient-text">History</span>
                </h1>
                <p className="text-dark-400 mt-1">
                    Your training session attendance record
                </p>
            </motion.div>

            {/* Stats */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                    <div className="card p-4 col-span-2 md:col-span-1 bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-primary-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-primary-400" />
                            <span className="text-sm text-primary-400">Rate</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.attendanceRate}%</div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-dark-400">Present</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.present}</div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-dark-400">Late</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.late}</div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-dark-400">Absent</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.absent}</div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-dark-400">Excused</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.excused}</div>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                                }`}
                        >
                            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-dark-400" />
                    <input
                        type="month"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="input"
                        placeholder="Filter by month"
                    />
                </div>
            </motion.div>

            {/* Records List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
            >
                {filteredRecords.length === 0 ? (
                    <div className="p-8 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                        <p className="text-dark-400">No attendance records found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {filteredRecords.map(record => (
                            <div key={record.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(record.status)}
                                        <div>
                                            <div className="font-medium text-white">{record.sessionName}</div>
                                            <div className="text-sm text-dark-400">
                                                {new Date(record.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                                {record.checkInTime && ` • Check-in: ${record.checkInTime}`}
                                            </div>
                                            {record.notes && (
                                                <div className="text-sm text-dark-500 mt-1 italic">"{record.notes}"</div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(record.status)}`}>
                                        {record.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
