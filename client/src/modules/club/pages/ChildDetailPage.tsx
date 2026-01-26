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
    Activity,
    Clock,
    MapPin,
    CheckCircle,
    XCircle
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

interface ChildData {
    id: string;
    athleteId: string;
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
    average: number;
    arrowCount: number;
}

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
    scheduleTitle: string;
}

interface ChildStats {
    avgScore: number;
    totalSessions: number;
    attendanceRate: number;
    improvement: number;
    rank?: number;
}

// Mock data
const MOCK_CHILD: ChildData = {
    id: '1',
    athleteId: 'ath1',
    name: 'Anak Saya',
    email: 'anak@email.com',
    archeryCategory: 'RECURVE',
    skillLevel: 'BEGINNER',
    gender: 'MALE',
    dateOfBirth: '2012-05-20',
    clubName: 'Klub Panahan Bandung'
};

const MOCK_SCORES: ScoreSession[] = [
    { id: '1', sessionDate: '2026-01-12', distance: 10, average: 7.5, arrowCount: 30 },
    { id: '2', sessionDate: '2026-01-10', distance: 10, average: 7.2, arrowCount: 30 },
    { id: '3', sessionDate: '2026-01-08', distance: 10, average: 7.0, arrowCount: 24 },
    { id: '4', sessionDate: '2026-01-05', distance: 10, average: 6.8, arrowCount: 30 },
    { id: '5', sessionDate: '2026-01-03', distance: 10, average: 6.5, arrowCount: 30 },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: '1', date: '2026-01-12', status: 'PRESENT', scheduleTitle: 'Morning Training' },
    { id: '2', date: '2026-01-10', status: 'PRESENT', scheduleTitle: 'Evening Class' },
    { id: '3', date: '2026-01-08', status: 'LATE', scheduleTitle: 'Morning Training' },
    { id: '4', date: '2026-01-05', status: 'PRESENT', scheduleTitle: 'Morning Training' },
    { id: '5', date: '2026-01-03', status: 'ABSENT', scheduleTitle: 'Evening Class' },
];

export default function ChildDetailPage() {
    const { childId } = useParams<{ childId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [child, setChild] = useState<ChildData | null>(null);
    const [scores, setScores] = useState<ScoreSession[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<ChildStats | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'attendance'>('overview');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch child details
                const childRes = await api.get(`/api/v1/parents/children/${childId}`);
                if (childRes.data) {
                    setChild(childRes.data);
                }

                // Fetch scores
                const scoresRes = await api.get(`/api/v1/parents/children/${childId}/scores`);
                if (scoresRes.data && scoresRes.data.length > 0) {
                    setScores(scoresRes.data);
                } else {
                    setScores(MOCK_SCORES);
                }

                // Fetch attendance
                const attendanceRes = await api.get(`/api/v1/parents/children/${childId}/attendance`);
                if (attendanceRes.data && attendanceRes.data.length > 0) {
                    setAttendance(attendanceRes.data);
                } else {
                    setAttendance(MOCK_ATTENDANCE);
                }

                // Calculate stats
                calculateStats(scoresRes.data?.length > 0 ? scoresRes.data : MOCK_SCORES);
            } catch (error) {
                console.log('Using mock data');
                setChild(MOCK_CHILD);
                setScores(MOCK_SCORES);
                setAttendance(MOCK_ATTENDANCE);
                calculateStats(MOCK_SCORES);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            fetchData();
        }
    }, [childId]);

    const calculateStats = (scoreData: ScoreSession[]) => {
        const avgScore = scoreData.reduce((sum, s) => sum + s.average, 0) / scoreData.length;
        const first = scoreData[scoreData.length - 1]?.average || 0;
        const last = scoreData[0]?.average || 0;
        const improvement = first > 0 ? ((last - first) / first) * 100 : 0;
        const presentCount = MOCK_ATTENDANCE.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attendanceRate = (presentCount / MOCK_ATTENDANCE.length) * 100;

        setStats({
            avgScore: parseFloat(avgScore.toFixed(1)),
            totalSessions: scoreData.length,
            attendanceRate: parseFloat(attendanceRate.toFixed(0)),
            improvement: parseFloat(improvement.toFixed(1))
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PRESENT': return { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle };
            case 'LATE': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock };
            case 'ABSENT': return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle };
            default: return { bg: 'bg-dark-700', text: 'text-dark-400', icon: Clock };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!child) {
        return (
            <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                <h3 className="text-xl font-medium text-white mb-2">Child Not Found</h3>
                <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    const chartData = [...scores].reverse().map(s => ({
        date: new Date(s.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        score: s.average
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
                        <span className="gradient-text">{child.name}</span>
                    </h1>
                    <p className="text-dark-400 mt-1">
                        View your child's archery progress
                    </p>
                </div>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {child.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{child.clubName || 'No Club'}</span>
                            </div>
                            {child.dateOfBirth && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Born {new Date(child.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {child.archeryCategory}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                {child.skillLevel}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                        <div className="flex gap-4 md:gap-6 md:border-l md:border-dark-700 md:pl-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-400">{stats.avgScore}</div>
                                <div className="text-xs text-dark-400">Avg Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.attendanceRate}%</div>
                                <div className="text-xs text-dark-400">Attendance</div>
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
                {(['overview', 'scores', 'attendance'] as const).map(tab => (
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
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Score Chart */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary-400" />
                                Score Progress
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} name="Score" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-400" />
                                Recent Attendance
                            </h3>
                            <div className="space-y-3">
                                {attendance.slice(0, 5).map(record => {
                                    const badge = getStatusBadge(record.status);
                                    return (
                                        <div key={record.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-white text-sm">{record.scheduleTitle}</div>
                                                <div className="text-xs text-dark-400">
                                                    {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'scores' && (
                    <div className="card">
                        <div className="p-4 border-b border-dark-700">
                            <h3 className="text-lg font-semibold text-white">Training Sessions</h3>
                        </div>
                        <div className="divide-y divide-dark-700">
                            {scores.map(session => (
                                <div key={session.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                            <Target className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{session.distance}m Session</div>
                                            <div className="text-sm text-dark-400">
                                                {new Date(session.sessionDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">{session.average.toFixed(1)}</div>
                                        <div className="text-sm text-dark-400">{session.arrowCount} arrows</div>
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
                            {attendance.map(record => {
                                const badge = getStatusBadge(record.status);
                                const StatusIcon = badge.icon;
                                return (
                                    <div key={record.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg ${badge.bg} flex items-center justify-center`}>
                                                <StatusIcon className={`w-5 h-5 ${badge.text}`} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{record.scheduleTitle}</div>
                                                <div className="text-sm text-dark-400">
                                                    {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${badge.bg} ${badge.text}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
