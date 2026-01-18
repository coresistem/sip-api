import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Target,
    Calendar,
    TrendingUp,
    TrendingDown,
    Loader2,
    ChevronRight,
    MapPin,
    Mail
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { api } from '../context/AuthContext';
import InviteParentModal from '../components/dashboard/InviteParentModal';

interface AthleteData {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    archeryCategory: string;
    skillLevel: string;
    gender: string;
    dateOfBirth?: string;
    clubName?: string;
}

interface ScoreSession {
    id: string;
    sessionDate: string;
    distance: number;
    totalSum: number;
    arrowCount: number;
    average: number;
    tensCount: number;
    verifiedAt?: string;
}

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
    scheduleTitle: string;
}

interface AthleteStats {
    totalSessions: number;
    totalArrows: number;
    averageScore: number;
    bestSession: number;
    attendanceRate: number;
    improvement: number;
}

// Mock data for demo
const MOCK_ATHLETE: AthleteData = {
    id: '1',
    name: 'Ahmad Santoso',
    email: 'ahmad@example.com',
    avatarUrl: undefined,
    archeryCategory: 'RECURVE',
    skillLevel: 'INTERMEDIATE',
    gender: 'MALE',
    dateOfBirth: '2005-03-15',
    clubName: 'Klub Panahan Bandung'
};

const MOCK_SESSIONS: ScoreSession[] = [
    { id: '1', sessionDate: '2026-01-12', distance: 30, totalSum: 285, arrowCount: 36, average: 7.9, tensCount: 8, verifiedAt: '2026-01-12' },
    { id: '2', sessionDate: '2026-01-10', distance: 30, totalSum: 278, arrowCount: 36, average: 7.7, tensCount: 6, verifiedAt: '2026-01-10' },
    { id: '3', sessionDate: '2026-01-08', distance: 50, totalSum: 305, arrowCount: 36, average: 8.5, tensCount: 12, verifiedAt: '2026-01-08' },
    { id: '4', sessionDate: '2026-01-06', distance: 30, totalSum: 295, arrowCount: 36, average: 8.2, tensCount: 10 },
    { id: '5', sessionDate: '2026-01-04', distance: 50, totalSum: 310, arrowCount: 36, average: 8.6, tensCount: 14, verifiedAt: '2026-01-04' },
    { id: '6', sessionDate: '2026-01-02', distance: 30, totalSum: 270, arrowCount: 36, average: 7.5, tensCount: 5 },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: '1', date: '2026-01-12', status: 'PRESENT', scheduleTitle: 'Morning Training' },
    { id: '2', date: '2026-01-10', status: 'PRESENT', scheduleTitle: 'Evening Session' },
    { id: '3', date: '2026-01-08', status: 'LATE', scheduleTitle: 'Morning Training' },
    { id: '4', date: '2026-01-06', status: 'PRESENT', scheduleTitle: 'Competition Prep' },
    { id: '5', date: '2026-01-04', status: 'ABSENT', scheduleTitle: 'Morning Training' },
];

export default function AthleteDetailPage() {
    const { athleteId } = useParams<{ athleteId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [athlete, setAthlete] = useState<AthleteData | null>(null);
    const [sessions, setSessions] = useState<ScoreSession[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<AthleteStats | null>(null);
    const [activeTab, setActiveTab] = useState<'scores' | 'attendance' | 'progress'>('scores');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch athlete details
                const athleteRes = await api.get(`/api/v1/athletes/${athleteId}`);
                if (athleteRes.data) {
                    setAthlete({
                        id: athleteRes.data.id,
                        name: athleteRes.data.user?.name || 'Unknown',
                        email: athleteRes.data.user?.email || '',
                        avatarUrl: athleteRes.data.user?.avatarUrl,
                        archeryCategory: athleteRes.data.archeryCategory,
                        skillLevel: athleteRes.data.skillLevel,
                        gender: athleteRes.data.gender,
                        dateOfBirth: athleteRes.data.dateOfBirth,
                        clubName: athleteRes.data.club?.name
                    });
                }

                // Fetch scoring sessions
                const scoresRes = await api.get(`/api/v1/scores/athlete/${athleteId}`);
                if (scoresRes.data && scoresRes.data.length > 0) {
                    setSessions(scoresRes.data);
                    calculateStats(scoresRes.data);
                } else {
                    setSessions(MOCK_SESSIONS);
                    calculateStats(MOCK_SESSIONS);
                }

                // Fetch attendance
                const attendanceRes = await api.get(`/api/v1/attendance/athlete/${athleteId}`);
                if (attendanceRes.data && attendanceRes.data.length > 0) {
                    setAttendance(attendanceRes.data);
                } else {
                    setAttendance(MOCK_ATTENDANCE);
                }
            } catch (error) {
                console.log('Using mock data');
                setAthlete(MOCK_ATHLETE);
                setSessions(MOCK_SESSIONS);
                setAttendance(MOCK_ATTENDANCE);
                calculateStats(MOCK_SESSIONS);
            } finally {
                setLoading(false);
            }
        };

        if (athleteId) {
            fetchData();
        }
    }, [athleteId]);

    const calculateStats = (sessionData: ScoreSession[]) => {
        const totalSessions = sessionData.length;
        const totalArrows = sessionData.reduce((sum, s) => sum + s.arrowCount, 0);
        const averageScore = sessionData.reduce((sum, s) => sum + s.average, 0) / totalSessions;
        const bestSession = Math.max(...sessionData.map(s => s.average));

        // Calculate improvement (first session vs last session)
        const first = sessionData[sessionData.length - 1]?.average || 0;
        const last = sessionData[0]?.average || 0;
        const improvement = first > 0 ? ((last - first) / first) * 100 : 0;

        setStats({
            totalSessions,
            totalArrows,
            averageScore: parseFloat(averageScore.toFixed(1)),
            bestSession: parseFloat(bestSession.toFixed(1)),
            attendanceRate: 85, // Will calculate from real data
            improvement: parseFloat(improvement.toFixed(1))
        });
    };

    const getStatusColor = (status: string) => {
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

    if (!athlete) {
        return (
            <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                <h3 className="text-xl font-medium text-white mb-2">Athlete Not Found</h3>
                <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    // Prepare chart data
    const chartData = [...sessions].reverse().map(s => ({
        date: new Date(s.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        score: s.average,
        distance: s.distance
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">
                        Athlete <span className="gradient-text">Profile</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        View athlete details and performance history
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Invite Parent
                    </button>
                </div>
            </motion.div>

            {/* Athlete Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {athlete.avatarUrl ? (
                            <img src={athlete.avatarUrl} alt={athlete.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                            athlete.name.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">{athlete.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-dark-400">
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{athlete.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{athlete.clubName || 'No Club'}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                                {athlete.archeryCategory}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                {athlete.skillLevel}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-dark-700 text-dark-300">
                                {athlete.gender}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                        <div className="flex gap-6 md:border-l md:border-dark-700 md:pl-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-400">{stats.averageScore}</div>
                                <div className="text-xs text-dark-400">Avg Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.totalSessions}</div>
                                <div className="text-xs text-dark-400">Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {stats.improvement >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {Math.abs(stats.improvement)}%
                                </div>
                                <div className="text-xs text-dark-400">Progress</div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
            >
                {(['scores', 'attendance', 'progress'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${activeTab === tab
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </motion.div>

            {/* Tab Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {activeTab === 'scores' && (
                    <div className="card">
                        <div className="p-4 border-b border-dark-700">
                            <h3 className="text-lg font-semibold text-white">Recent Scoring Sessions</h3>
                        </div>
                        <div className="divide-y divide-dark-700">
                            {sessions.map((session) => (
                                <div key={session.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                                <Target className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{session.distance}m Session</div>
                                                <div className="text-sm text-dark-400">
                                                    {new Date(session.sessionDate).toLocaleDateString('id-ID', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">{session.average.toFixed(1)}</div>
                                            <div className="text-sm text-dark-400">{session.arrowCount} arrows</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded ${session.verifiedAt ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {session.verifiedAt ? 'Verified' : 'Pending'}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-dark-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="card">
                        <div className="p-4 border-b border-dark-700">
                            <h3 className="text-lg font-semibold text-white">Attendance History</h3>
                        </div>
                        <div className="divide-y divide-dark-700">
                            {attendance.map(record => (
                                <div key={record.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-dark-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{record.scheduleTitle}</div>
                                            <div className="text-sm text-dark-400">
                                                {new Date(record.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Score Trend</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6b7280"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px'
                                        }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 5 }}
                                        name="Average Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </motion.div>
            {/* Tab Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {/* ... existing tab content ... */}
            </motion.div>

            <InviteParentModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                athleteId={athleteId!}
            />
        </div>
    );
}
