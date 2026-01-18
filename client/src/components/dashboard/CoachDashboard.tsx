import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    ClipboardCheck,
    TrendingUp,
    Clock,
    ChevronRight,
    Loader2,
    Target,
    CheckCircle,
    AlertCircle,
    User
} from 'lucide-react';
import { api } from '../../context/AuthContext';

interface AthleteCard {
    id: string;
    name: string;
    avatarUrl?: string;
    archeryCategory: string;
    skillLevel: string;
    lastScoreAvg?: number;
    totalSessions: number;
}

interface PendingScore {
    id: string;
    athleteName: string;
    sessionDate: string;
    distance: number;
    average: number;
    arrowCount: number;
}

interface TodaySchedule {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
    participantCount: number;
}

interface CoachStats {
    totalAthletes: number;
    pendingVerifications: number;
    todaySessions: number;
    weeklyAvgScore: number;
}

const CoachDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [athletes, setAthletes] = useState<AthleteCard[]>([]);
    const [pendingScores, setPendingScores] = useState<PendingScore[]>([]);
    const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([]);
    const [stats, setStats] = useState<CoachStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch club athletes
                const athletesRes = await api.get('/athletes?limit=6');
                if (athletesRes.data.success) {
                    const athleteData = athletesRes.data.data?.map((a: any) => ({
                        id: a.id,
                        name: a.user?.name || 'Unknown',
                        avatarUrl: a.user?.avatarUrl,
                        archeryCategory: a.archeryCategory,
                        skillLevel: a.skillLevel,
                        lastScoreAvg: a._count?.scores > 0 ? 8.5 : undefined, // Placeholder
                        totalSessions: a._count?.scores || 0,
                    })) || [];
                    setAthletes(athleteData);
                }

                // Fetch pending verifications (unverified scores)
                const scoresRes = await api.get('/scores?isVerified=false&limit=5');
                if (scoresRes.data.success) {
                    const pending = scoresRes.data.data?.map((s: any) => ({
                        id: s.id,
                        athleteName: s.athlete?.user?.name || 'Unknown',
                        sessionDate: s.sessionDate,
                        distance: s.distance,
                        average: s.average,
                        arrowCount: s.arrowCount,
                    })) || [];
                    setPendingScores(pending);
                }

                // Fetch today's schedules
                const today = new Date().toISOString().split('T')[0];
                const schedulesRes = await api.get(`/schedules?startDate=${today}&endDate=${today}`);
                if (schedulesRes.data.success) {
                    const schedules = schedulesRes.data.data?.map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        venue: s.venue,
                        participantCount: s._count?.participants || 0,
                    })) || [];
                    setTodaySchedules(schedules);
                }

                // Calculate stats
                setStats({
                    totalAthletes: athletesRes.data.data?.length || 0,
                    pendingVerifications: scoresRes.data.data?.length || 0,
                    todaySessions: schedulesRes.data.data?.length || 0,
                    weeklyAvgScore: 8.2, // Placeholder
                });

            } catch (err) {
                console.error('Failed to fetch coach dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    icon={Users}
                    label="My Athletes"
                    color="primary"
                    onClick={() => navigate('/athletes')}
                />
                <QuickAction
                    icon={Calendar}
                    label="Training Sessions"
                    color="amber"
                    onClick={() => navigate('/schedules')}
                />
                <QuickAction
                    icon={ClipboardCheck}
                    label="Verify Scores"
                    color="emerald"
                    onClick={() => navigate('/analytics')}
                    badge={pendingScores.length > 0 ? pendingScores.length : undefined}
                />
                <QuickAction
                    icon={Target}
                    label="Record Scores"
                    color="purple"
                    onClick={() => navigate('/scoring')}
                />
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="My Athletes"
                        value={stats.totalAthletes.toString()}
                        icon={Users}
                        color="primary"
                    />
                    <StatCard
                        label="Pending Verification"
                        value={stats.pendingVerifications.toString()}
                        icon={AlertCircle}
                        color={stats.pendingVerifications > 0 ? 'amber' : 'slate'}
                    />
                    <StatCard
                        label="Today's Sessions"
                        value={stats.todaySessions.toString()}
                        icon={Calendar}
                        color="emerald"
                    />
                    <StatCard
                        label="Team Avg Score"
                        value={stats.weeklyAvgScore.toFixed(1)}
                        icon={TrendingUp}
                        color="purple"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Athletes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-400" />
                            My Athletes
                        </h3>
                        <button
                            onClick={() => navigate('/athletes')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {athletes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No athletes in your club yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {athletes.slice(0, 6).map((athlete) => (
                                <div
                                    key={athlete.id}
                                    className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/athletes`)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {athlete.avatarUrl ? (
                                            <img
                                                src={athlete.avatarUrl}
                                                alt={athlete.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                                <User size={14} className="text-primary-400" />
                                            </div>
                                        )}
                                        <div className="truncate">
                                            <div className="text-sm text-white font-medium truncate">
                                                {athlete.name.split(' ')[0]}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">{athlete.archeryCategory}</span>
                                        <span className="text-primary-400">{athlete.totalSessions} sess</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Today's Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            Today's Schedule
                        </h3>
                        <button
                            onClick={() => navigate('/schedules')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {todaySchedules.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No training sessions scheduled for today</p>
                            <button
                                onClick={() => navigate('/schedules')}
                                className="mt-3 text-sm text-primary-400 hover:text-primary-300"
                            >
                                Create a session →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todaySchedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm text-white font-medium">
                                                {schedule.title}
                                            </div>
                                            {schedule.venue && (
                                                <div className="text-xs text-slate-400 mt-1">
                                                    📍 {schedule.venue}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-amber-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(schedule.startTime).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {schedule.participantCount} athletes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Pending Verifications */}
            {pendingScores.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card border-amber-500/30"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            Pending Score Verifications
                            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                                {pendingScores.length}
                            </span>
                        </h3>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                            Review All <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {pendingScores.slice(0, 3).map((score) => (
                            <div
                                key={score.id}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Target size={18} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-medium">
                                            {score.athleteName}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {score.distance}m • {score.arrowCount} arrows • {new Date(score.sessionDate).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">
                                            {score.average.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-slate-500">avg</div>
                                    </div>
                                    <button className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors">
                                        <CheckCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Quick Action Button Component
const QuickAction: React.FC<{
    icon: React.ElementType;
    label: string;
    color: 'primary' | 'emerald' | 'amber' | 'purple';
    onClick: () => void;
    badge?: number;
}> = ({ icon: Icon, label, color, onClick, badge }) => {
    const colorClasses = {
        primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400 hover:border-primary-400',
        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-400',
        amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400 hover:border-amber-400',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400 hover:border-purple-400',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                p-4 rounded-xl border bg-gradient-to-br transition-all relative
                flex flex-col items-center gap-2
                ${colorClasses[color]}
            `}
        >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
        </motion.button>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    label: string;
    value: string;
    icon: React.ElementType;
    color: 'primary' | 'emerald' | 'amber' | 'purple' | 'slate';
}> = ({ label, value, icon: Icon, color }) => {
    const iconColors = {
        primary: 'text-primary-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        purple: 'text-purple-400',
        slate: 'text-slate-400',
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
        </div>
    );
};

export default CoachDashboard;
