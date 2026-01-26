import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Mail,
    Award,
    Activity,
    Phone,
    UserX,
    Edit3,
    ShieldAlert,
    Trash2
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
import { api } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';

interface MemberData {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
        phone?: string;
    };
    archeryCategory: string;
    skillLevel: string;
    gender: string;
    dateOfBirth?: string;
    club?: {
        name: string;
    };
    xp: number;
    level: number;
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

export default function ClubMemberDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState<MemberData | null>(null);
    const [sessions, setSessions] = useState<ScoreSession[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'scores' | 'attendance' | 'progress' | 'admin'>('scores');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch member details
                const res = await api.get(`/athletes/${id}`);
                const data = res.data.data;
                setMember(data);

                // Fetch scoring history
                const scoresRes = await api.get(`/scores/athlete/${data.id}`);
                setSessions(scoresRes.data || []);

                // Fetch attendance
                const attendanceRes = await api.get(`/attendance/athlete/${data.id}`);
                setAttendance(attendanceRes.data || []);

            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load member details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleRemoveFromClub = async () => {
        if (!confirm('Are you sure you want to remove this member from the club?')) return;

        setActionLoading(true);
        try {
            // Logic to unlink member from club
            await api.put(`/athletes/${id}`, { clubId: null });
            toast.success('Member removed from club');
            navigate('/club/members');
        } catch (error) {
            toast.error('Failed to remove member');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="text-center py-12">
                <UserX className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                <h3 className="text-xl font-medium text-white mb-2">Member Not Found</h3>
                <button onClick={() => navigate(-1)} className="btn btn-secondary mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    const chartData = [...sessions].reverse().slice(-10).map(s => ({
        date: new Date(s.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        score: s.average,
    }));

    const stats = {
        avgScore: sessions.length > 0 ? (sessions.reduce((sum, s) => sum + s.average, 0) / sessions.length).toFixed(1) : '0.0',
        totalSessions: sessions.length,
        attendanceRate: attendance.length > 0 ? ((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100).toFixed(0) : '0'
    };

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Members</span>
                </button>
                <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/athletes/${id}/edit`)}>
                        <Edit3 size={14} /> Edit Profile
                    </button>
                </div>
            </div>

            {/* Member Identity Card */}
            <div className="card p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg shadow-primary-900/20">
                        {member.user.avatarUrl ? (
                            <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : member.user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">{member.user.name}</h1>
                            <span className="badge badge-primary">{member.archeryCategory}</span>
                            <span className="badge badge-secondary">{member.skillLevel}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm text-dark-400">
                            <div className="flex items-center gap-2"><Mail size={14} /> {member.user.email}</div>
                            {member.user.phone && <div className="flex items-center gap-2"><Phone size={14} /> {member.user.phone}</div>}
                            <div className="flex items-center gap-2"><Award size={14} className="text-yellow-500" /> Level {member.level} ({member.xp} XP)</div>
                        </div>
                    </div>

                    <div className="flex gap-4 md:border-l md:border-dark-700 md:pl-6">
                        <div className="text-center">
                            <div className="text-xl font-bold text-primary-400">{stats.avgScore}</div>
                            <div className="text-xs text-dark-500 uppercase tracking-wider font-medium">Avg Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-400">{stats.totalSessions}</div>
                            <div className="text-xs text-dark-500 uppercase tracking-wider font-medium">Sessions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-cyan-400">{stats.attendanceRate}%</div>
                            <div className="text-xs text-dark-500 uppercase tracking-wider font-medium">Attendance</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-dark-900/50 rounded-lg w-fit">
                {[
                    { id: 'scores', label: 'Scores', icon: Target },
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'progress', label: 'Progress', icon: TrendingUp },
                    { id: 'admin', label: 'Admin', icon: ShieldAlert },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${activeTab === tab.id
                            ? 'bg-dark-800 text-white shadow-sm'
                            : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'scores' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-700 bg-dark-800/30">
                                <h3 className="font-bold flex items-center gap-2"><Target size={18} className="text-primary-500" /> Recent Scoring Sessions</h3>
                            </div>
                            <div className="divide-y divide-dark-700/50">
                                {sessions.length === 0 ? (
                                    <div className="p-12 text-center text-dark-500 italic">No sessions recorded yet.</div>
                                ) : (
                                    sessions.map(s => (
                                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-dark-800/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center font-bold text-dark-300">{s.distance}m</div>
                                                <div>
                                                    <div className="font-medium text-white">{new Date(s.sessionDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                                                    <div className="text-xs text-dark-500">{s.arrowCount} arrows • {s.tensCount} 10s</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-mono font-bold text-primary-400">{s.average.toFixed(2)}</div>
                                                <div className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${s.verifiedAt ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {s.verifiedAt ? 'Verified' : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-700 bg-dark-800/30 font-bold">Attendance History</div>
                            <div className="divide-y divide-dark-700/50">
                                {attendance.length === 0 ? (
                                    <div className="p-12 text-center text-dark-500 italic">No attendance records found.</div>
                                ) : (
                                    attendance.map(record => (
                                        <div key={record.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-dark-800"><Calendar size={20} className="text-dark-400" /></div>
                                                <div>
                                                    <div className="font-medium text-white">{record.scheduleTitle}</div>
                                                    <div className="text-sm text-dark-500">{new Date(record.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'PRESENT' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                record.status === 'LATE' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                {record.status}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="card p-6">
                            <h3 className="font-bold text-white mb-6">Average Score Trend (Last 10 Sessions)</h3>
                            <div className="h-64 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="space-y-4">
                            <div className="card p-6 border-red-900/30 bg-red-900/5">
                                <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4">
                                    <ShieldAlert size={18} /> Danger Zone
                                </h3>
                                <p className="text-sm text-dark-400 mb-6">
                                    Actions performed here are permanent and affect the athlete's membership in your club.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        disabled={actionLoading}
                                        onClick={handleRemoveFromClub}
                                        className="btn btn-secondary w-full border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                                        Remove from Club
                                    </button>
                                    <button className="btn btn-secondary w-full border-dark-700 text-dark-300 flex items-center justify-center gap-2">
                                        <Trash2 size={18} /> Archive Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
