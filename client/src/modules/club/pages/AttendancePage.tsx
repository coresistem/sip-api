import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, api } from '../../core/contexts/AuthContext';
import {
    QrCode,
    CheckCircle,
    Clock,
    XCircle,
    Users,
    Calendar,
    Scan,
    UserCheck,
    RefreshCw,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface AttendanceRecord {
    id: string;
    userName: string;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
    checkInTime: string;
    checkOutTime?: string;
    method: string;
    user?: { name: string; avatarUrl?: string };
}

interface Schedule {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
    status: 'active' | 'upcoming' | 'completed';
}

interface ScanResult {
    success: boolean;
    message: string;
    athleteName?: string;
}

export default function AttendancePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [recentScans, setRecentScans] = useState<string[]>([]);
    const [manualUserId, setManualUserId] = useState('');

    useEffect(() => {
        fetchTodaySchedules();
    }, []);

    useEffect(() => {
        if (selectedSchedule) {
            fetchAttendanceForSchedule(selectedSchedule.id);
        }
    }, [selectedSchedule]);

    const fetchTodaySchedules = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

            const response = await api.get(`/schedules?startDate=${startOfDay}&endDate=${endOfDay}`);
            if (response.data.success && response.data.data) {
                const now = new Date();
                const mappedSchedules: Schedule[] = response.data.data.map((s: any) => {
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);
                    let status: 'active' | 'upcoming' | 'completed' = 'upcoming';
                    if (now >= start && now <= end) status = 'active';
                    else if (now > end) status = 'completed';

                    return {
                        id: s.id,
                        title: s.title,
                        startTime: start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        endTime: end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        venue: s.venue || 'TBD',
                        status
                    };
                });
                setSchedules(mappedSchedules);

                // Auto-select active schedule
                const activeSchedule = mappedSchedules.find(s => s.status === 'active');
                if (activeSchedule) setSelectedSchedule(activeSchedule);
                else if (mappedSchedules.length > 0) setSelectedSchedule(mappedSchedules[0]);
            }
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceForSchedule = async (scheduleId: string) => {
        try {
            const response = await api.get(`/attendance/schedule/${scheduleId}`);
            if (response.data.success && response.data.data) {
                const mappedAttendance: AttendanceRecord[] = response.data.data.map((a: any) => ({
                    id: a.id,
                    userName: a.user?.name || 'Unknown',
                    status: a.status,
                    checkInTime: a.checkInTime
                        ? new Date(a.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-',
                    checkOutTime: a.checkOutTime
                        ? new Date(a.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : undefined,
                    method: a.method || 'MANUAL',
                    user: a.user
                }));
                setAttendanceList(mappedAttendance);
                setRecentScans(mappedAttendance.map(a => a.id));
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            setAttendanceList([]);
        }
    };

    // Real scan function using API
    const handleScan = async (userId?: string) => {
        if (!selectedSchedule) {
            setScanResult({
                success: false,
                message: 'Please select a training session first',
            });
            return;
        }

        // For demo: use manual input or prompt
        const targetUserId = userId || manualUserId;
        if (!targetUserId) {
            setScanResult({
                success: false,
                message: 'Please enter a User ID or scan a QR code',
            });
            return;
        }

        setIsScanning(true);
        setScanResult(null);

        try {
            const response = await api.post('/attendance/scan', {
                userId: targetUserId,
                scheduleId: selectedSchedule.id,
            });

            if (response.data.success) {
                const data = response.data.data;
                setScanResult({
                    success: true,
                    message: response.data.message || 'Check-in successful!',
                    athleteName: data.user?.name || 'Athlete',
                });
                setRecentScans(prev => [...prev, data.id]);
                setManualUserId('');

                // Refresh attendance list
                fetchAttendanceForSchedule(selectedSchedule.id);
            } else {
                setScanResult({
                    success: false,
                    message: response.data.message || 'Check-in failed',
                });
            }
        } catch (error: any) {
            setScanResult({
                success: false,
                message: error.response?.data?.message || 'Failed to record attendance',
            });
        } finally {
            setIsScanning(false);
            // Auto-hide result after 3 seconds
            setTimeout(() => setScanResult(null), 3000);
        }
    };

    const stats = {
        present: attendanceList.filter(a => a.status === 'PRESENT').length,
        late: attendanceList.filter(a => a.status === 'LATE').length,
        absent: attendanceList.filter(a => a.status === 'ABSENT').length,
    };

    const isCoachOrAdmin = ['SUPER_ADMIN', 'CLUB', 'COACH', 'MANPOWER'].includes(user?.role || '');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-primary-500" />
                        Attendance Scanner
                    </h1>
                    <p className="text-dark-400">
                        {isCoachOrAdmin
                            ? 'Scan athlete QR codes to record attendance'
                            : 'View your attendance history'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-dark-800 rounded-lg p-1">
                    {[
                        { key: 'scan' as const, label: 'Scan QR', icon: Scan },
                        { key: 'history' as const, label: 'History', icon: Clock },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${activeTab === tab.key
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Summary */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Present', value: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                        { label: 'Late', value: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
                        { label: 'Absent', value: stats.absent, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.02 }}
                            className="card text-center"
                        >
                            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <p className="text-3xl font-display font-bold">{stat.value}</p>
                            <p className="text-dark-400 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'scan' && (
                    <motion.div
                        key="scan"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Session Selection */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-400" />
                                Select Training Session
                            </h3>
                            <div className="grid gap-3 md:grid-cols-3">
                                {schedules.map((schedule: Schedule) => (
                                    <button
                                        key={schedule.id}
                                        onClick={() => setSelectedSchedule(schedule)}
                                        className={`p-4 rounded-xl text-left transition-all ${selectedSchedule?.id === schedule.id
                                            ? 'bg-primary-500/20 border-2 border-primary-500'
                                            : 'bg-dark-800 border-2 border-transparent hover:border-dark-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">{schedule.title}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${schedule.status === 'active'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-dark-700 text-dark-400'
                                                }`}>
                                                {schedule.status === 'active' ? 'Active' : 'Upcoming'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-dark-400">
                                            {schedule.startTime} - {schedule.endTime} • {schedule.venue}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* QR Scanner */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Scan className="w-5 h-5 text-primary-400" />
                                Scan Athlete QR Code
                            </h3>

                            <div className="flex flex-col items-center">
                                {/* Info Banner */}
                                <div className="w-full max-w-md mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                    <div className="flex gap-3">
                                        <QrCode className="w-6 h-6 text-primary-400 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-medium text-primary-400">How it works:</p>
                                            <p className="text-dark-400 mt-1">
                                                Ask athletes to show their personal QR code from their Profile page.
                                                Scan the code to record their attendance.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scanner Viewport */}
                                <div className="relative w-72 h-72 rounded-2xl overflow-hidden bg-dark-800 border-2 border-dashed border-dark-600 flex items-center justify-center">
                                    {isScanning ? (
                                        <div className="absolute inset-0">
                                            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 to-transparent animate-pulse" />
                                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-500 animate-scan" />
                                            <div className="absolute inset-4 border-2 border-primary-500/50 rounded-lg" />
                                            <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-dark-400">
                                                Scanning QR Code...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                                                <QrCode className="w-10 h-10 text-dark-500" />
                                            </div>
                                            <p className="text-dark-400 text-sm">
                                                Point camera at athlete's QR code
                                            </p>
                                            <p className="text-dark-500 text-xs mt-1">
                                                Athletes can find their QR in Profile
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleScan()}
                                    disabled={isScanning || !selectedSchedule}
                                    className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium transition-all hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Scan className="w-5 h-5" />
                                    {isScanning ? 'Scanning...' : 'Scan Athlete QR'}
                                </button>

                                {!selectedSchedule && (
                                    <p className="mt-3 text-amber-400 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Please select a training session first
                                    </p>
                                )}

                                {/* Scan Result */}
                                <AnimatePresence>
                                    {scanResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${scanResult.success
                                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                : 'bg-red-500/20 border border-red-500/30'
                                                }`}
                                        >
                                            {scanResult.success ? (
                                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                                            ) : (
                                                <XCircle className="w-8 h-8 text-red-400" />
                                            )}
                                            <div>
                                                {scanResult.athleteName && (
                                                    <p className={`font-medium ${scanResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {scanResult.athleteName}
                                                    </p>
                                                )}
                                                <p className={scanResult.success ? 'text-emerald-300' : 'text-red-300'}>
                                                    {scanResult.message}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Recent Check-ins */}
                        {recentScans.length > 0 && (
                            <div className="card">
                                <h3 className="text-sm text-dark-400 mb-3">Recent Check-ins This Session</h3>
                                <div className="flex flex-wrap gap-2">
                                    {recentScans.map((_, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Athlete {i + 1}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-400" />
                                {selectedSchedule ? selectedSchedule.title : "Today's"} Attendance
                            </h3>
                            <button className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
                                <RefreshCw className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-700">
                                        <th className="text-left py-3 px-4 text-dark-400 font-medium">Athlete</th>
                                        <th className="text-center py-3 px-4 text-dark-400 font-medium">Status</th>
                                        <th className="text-center py-3 px-4 text-dark-400 font-medium">Check In</th>
                                        <th className="text-center py-3 px-4 text-dark-400 font-medium">Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.map((record, i) => (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-dark-800 hover:bg-dark-800/50"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                                                        {record.userName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{record.userName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm ${record.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    record.status === 'LATE' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center text-dark-300">{record.checkInTime}</td>
                                            <td className="py-4 px-4 text-center">
                                                {record.method === 'QR_SCAN' ? (
                                                    <span className="inline-flex items-center gap-1 text-primary-400 text-sm">
                                                        <QrCode className="w-4 h-4" />
                                                        QR Scan
                                                    </span>
                                                ) : (
                                                    <span className="text-dark-400 text-sm">{record.method}</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for scanning animation */}
            <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-120px); }
          50% { transform: translateY(120px); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
